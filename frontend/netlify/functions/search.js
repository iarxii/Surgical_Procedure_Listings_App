const WHO_TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const WHO_SEARCH_URL = 'https://id.who.int/icd/release/11/2024-01/mms/search';
const NIH_SEARCH_URL = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getWhoToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.WHO_API_CLIENT_ID;
  const clientSecret = process.env.WHO_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing WHO API Credentials in environment variables.");
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'icdapi_access');
    params.append('grant_type', 'client_credentials');

    const response = await fetch(WHO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (response.ok) {
      const data = await response.json();
      cachedToken = data.access_token;
      // expire 5 mins before actual expiry (usually 3600s)
      tokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
      return cachedToken;
    } else {
      console.error('WHO API Token Error:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('WHO API Token Exception:', error);
    return null;
  }
}

async function searchNih(query) {
  try {
    const url = new URL(NIH_SEARCH_URL);
    url.searchParams.append('terms', query);
    url.searchParams.append('sf', 'code,name');
    url.searchParams.append('df', 'code,name');
    url.searchParams.append('maxList', '25');

    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      if (data[3] && Array.isArray(data[3])) {
        return data[3].map(item => ({
          code: item[0],
          title: item[1]
        }));
      }
    }
  } catch (e) {
    console.error('NIH API Error:', e);
  }
  return [];
}

async function searchWho(query) {
  const token = await getWhoToken();
  if (!token) return [];

  try {
    const url = new URL(WHO_SEARCH_URL);
    url.searchParams.append('q', query);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'API-Version': 'v2',
        'Accept-Language': 'en'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.destinationEntities) {
        const results = [];
        let count = 0;
        for (const entity of data.destinationEntities) {
          const code = entity.theCode || '';
          const title = entity.title ? entity.title.replace(/<[^>]*>?/gm, '') : '';
          if (!code && !title) continue;

          results.push({ code, title });
          count++;
          if (count >= 10) break;
        }
        return results;
      }
    } else {
      console.error('WHO API Request Error:', await response.text());
    }
  } catch (e) {
    console.error('WHO API Exception:', e);
  }
  return [];
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Structure depends if we received { procedure } or { query }
    if (body.procedure) {
      const proc = body.procedure;
      const icd_codes = proc.icd_codes || [];
      const mainCodes = [...new Set(icd_codes.map(c => {
        // Mock extraction logic since PHP backend did regex
        let cmatch = c.code.match(/^[a-zA-Z]{1,2}\d+|^\d+[a-zA-Z]+/);
        return cmatch ? cmatch[0].toUpperCase() : c.code.substring(0, 3).toUpperCase();
      }))];
      const subCodes = [...new Set(icd_codes.map(c => c.code.toUpperCase()))];
      
      const icd10Results = [];
      const icd11Results = [];
      const seen10 = new Set();
      const seen11 = new Set();

      // Strategy 1: Main codes
      for (const mc of mainCodes) {
        const nih = await searchNih(mc);
        for (const hit of nih) {
          if (!seen10.has(hit.code)) {
            hit.match_source = 'code'; hit.matched_query = mc;
            icd10Results.push(hit); seen10.add(hit.code);
          }
        }
        const who = await searchWho(mc);
        for (const hit of who) {
          if (hit.code && !seen11.has(hit.code)) {
            hit.match_source = 'code'; hit.matched_query = mc;
            icd11Results.push(hit); seen11.add(hit.code);
          }
        }
      }

      // Strategy 2: Sub codes
      for (const sc of subCodes) {
        if (mainCodes.indexOf(sc) !== -1) continue;
        const nih = await searchNih(sc);
        for (const hit of nih) {
          if (!seen10.has(hit.code)) {
            hit.match_source = 'sub_code'; hit.matched_query = sc;
            icd10Results.push(hit); seen10.add(hit.code);
          }
        }
      }

      // Strategy 3: Name
      if (proc.procedure_name) {
        const nameQuery = proc.procedure_name;
        const nih = await searchNih(nameQuery);
        for (const hit of nih) {
          if (!seen10.has(hit.code)) {
             hit.match_source = 'name'; hit.matched_query = nameQuery;
             icd10Results.push(hit); seen10.add(hit.code);
          }
        }
        const who = await searchWho(nameQuery);
        for (const hit of who) {
          if (hit.code && !seen11.has(hit.code)) {
             hit.match_source = 'name'; hit.matched_query = nameQuery;
             icd11Results.push(hit); seen11.add(hit.code);
          }
        }
      }

      return new Response(JSON.stringify({
        query: proc.procedure_name,
        procedure: proc,
        local_procedures: [proc], // Bounce back the provided procedure to act as local match
        icd10_suggestions: icd10Results,
        icd11_suggestions: icd11Results,
        search_strategies: { main_codes: mainCodes, sub_codes: subCodes }
      }), {
         headers: { 'Content-Type': 'application/json' }
      });

    } else if (body.query) {
      let q = body.query;
      // Same uppercase rule if looks like code
      if (/^[a-zA-Z]{1,2}\d|^\d+[a-zA-Z]/.test(q)) {
        q = q.toUpperCase();
      }
      const [nihResults, whoResults] = await Promise.all([
        searchNih(q),
        searchWho(q)
      ]);
      
      return new Response(JSON.stringify({
        query: q,
        local_procedures: [], // Raw text search doesn't get local fallback cleanly in serverless context without reading catalog
        icd10_suggestions: nihResults,
        icd11_suggestions: whoResults
      }), {
         headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: "Missing query or procedure" }), { status: 400 });
    }
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
