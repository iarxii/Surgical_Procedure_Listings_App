# Surgical Procedure Listing App – High-Level Design Overview

**Goal:** Develop a prototype application (React frontend, optional Laravel/PHP + MySQL backend) that allows clinicians and coding staff to search surgical procedures and view **side-by-side ICD-10-CM and ICD-11 codes** (with descriptions and specific sub-codes like laterality or site). The solution will integrate the **NIH Clinical Table Search Service** for **ICD-10-CM** and the **WHO ICD API** for **ICD-11**, enabling code lookups and comparisons. Key design considerations include API integration, data modeling for procedures and codes, mapping between ICD-10 and ICD-11, UI/UX for comparisons and filters, and understanding API usage constraints.

```Html
<style>
        :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe Sans", "Segoe UI", "Segoe UI Web (West European)", -apple-system, "system-ui", Roboto, "Helvetica Neue", sans-serif;
        --overflow-wrap: break-word;
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
        overflow-wrap: var(--overflow-wrap);
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
        overflow-wrap: var(--overflow-wrap);
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li h4 em {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
        font-style: normal;
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }
        @media (max-width:600px){
        .metrics-container,
        .insights-container{
            grid-template-columns:1fr;
      }
    }
</style>
<div class="insights-container">
  <div class="insight-card">
    <h4>Dual ICD Code Integration</h4>
    <p>Leverage NIH’s ICD-10-CM API (no auth needed) and WHO’s ICD-11 API (requires OAuth2 token) to fetch codes and descriptions in tandem.</p>
  </div>
  <div class="insight-card">
    <h4>Unified Data Model</h4>
    <p>Design a database linking surgical <strong>Procedures</strong> to multiple ICD-10 and ICD-11 codes, with categorization by body system (specialty) for filtering and mapping between coding systems.</p>
  </div>
  <div class="insight-card">
    <h4>User-Friendly UI</h4>
    <p>Provide a React-based interface with search, filters by body system, and side-by-side code comparison, including detailed sub-codes (laterality, site) so users can easily compare ICD-10 vs ICD-11 specifics.</p>
  </div>
</div>
```

## 1. Integrating ICD-10-CM (NIH) and ICD-11 (WHO) APIs

**ICD-10-CM via NIH Clinical Table Search Service:** The NLM’s Clinical Table Search Service provides a free, public API for ICD-10-CM code lookup. You can query by **diagnosis code or text** (e.g. procedure name or condition) using HTTP GET requests to the base URL:

https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search

with appropriate query parameters (e.g. `terms=<search term>&sf=code,name`). This returns a JSON array including matching ICD-10-CM codes and their long descriptions. The service is **“provided as is” free of charge** (no API key required). For example, searching for “appendectomy” or “appendicitis” might return ICD-10 codes like **K35.80** (Unspecified acute appendicitis) and related descriptions. The API supports parameters for pagination (`count` and `offset`) with a maximum of 500 results per call and an upper limit of 7,500 total results retrievable. In practice, surgical searches are specific enough that you’ll typically retrieve only a manageable number of matches. Nonetheless, implement error handling and perhaps a caching layer: since it’s a public service, you should handle network latency or potential downtime gracefully (e.g. fallback to cached data or the local database sample).

**ICD-11 via WHO API:** The WHO ICD-11 REST API provides programmatic access to ICD-11 codes and terms. Unlike the ICD-10-CM service, **ICD-11 requires authentication**. You must register for an API **client ID and secret** via the WHO API portal, then obtain an **OAuth2 token** from `https://icdaccessmanagement.who.int/connect/token`. The client credentials grant returns a bearer token (valid ~60 minutes) used in the `Authorization` header for subsequent requests. The ICD-11 API offers endpoints for searching the **ICD-11 MMS (Mortality and Morbidity Statistics) linearization** by terms or codes. For example, a search query can be made to an endpoint like:

GET https://id.who.int/icd/release/11/2023-01/mms/search?q=&chapter=...

(where `release` and `chapter` parameters define the ICD-11 version and range) – the exact endpoint and parameters are defined in the API documentation and swagger UI. The response is typically JSON containing a list of matching **ICD-11 entity identifiers**, each with fields like `theCode` (ICD-11 code), `title` (description), and flags indicating if more detail (postcoordination) is available. For example, searching “appendicitis” in ICD-11 might return the entity **DB10.0** (Acute appendicitis) with sub-entries for different types of appendicitis.

**Implementation:** For the prototype, you can implement **API helper modules** in Laravel to manage these external calls. The backend would handle constructing the HTTP requests (using Guzzle or cURL in PHP) to both APIs in parallel when a user searches a term. The **Laravel controller** for “search” can accept a query (procedure name or code), then:

- Call the **ICD-10-CM API** endpoint with the search term to get matching ICD-10 codes and descriptions.
- Call the **ICD-11 API** with the same term (after ensuring a valid token) to get matching ICD-11 codes and titles.

Both results are then returned to the React frontend in a unified response (e.g. a JSON structure containing two lists: `icd10_results` and `icd11_results`). This backend approach is recommended because it hides the WHO API credentials and avoids CORS issues. The NIH ICD-10 API does support direct client-side requests (as it’s public with CORS enabled), but using the backend for all external queries provides a single consistent interface for the frontend and better security (especially for the ICD-11 token).

**Performance & Rate Limits:** Both APIs are designed for real-time lookup (the ICD-10 service is used for autocompletion in forms). Still, consider implementing simple caching on the backend. For example, store recent query results in memory or a cache table to avoid repeated external calls for popular terms. The ICD-10 API doesn’t enforce a strict API key or rate limit (beyond the result size limits mentioned) but “excessive usage” could potentially be subject to throttling – the FAQ advises using reasonable query volumes. The ICD-11 API may have rate limits or daily quotas associated with your API key – check the WHO API documentation for current limits. As a prototype, moderate use is unlikely to hit limits, but your backend should handle HTTP 429 responses (too many requests) or refresh the OAuth token periodically (since it expires hourly).

## 2. Database Schema Design

Design a schema that can store surgical procedures, associated code mappings, and support filtering by body system or specialty. Key tables might include:

- **Procedures** – stores each surgical procedure (e.g., `procedure_id`, `name`, `description`, `body_system` or `specialty`). The **Body System/Specialty** field allows tagging procedures (e.g., “Cardiac Surgery”, “Gastroenterology”, “Orthopaedics”) so that the UI can filter by clinical domain.
- **ICD_Codes** – stores code details for both ICD-10-CM and ICD-11. Fields: `code_id`, `code` (e.g. “I25.10” or “BA52.0”), `description`, `version` (e.g., “ICD-10-CM” or “ICD-11”), plus optional fields for properties like `is_category` (if it’s a grouping code) or flags for laterality/applicability. Alternatively, you may have separate tables for ICD10 vs ICD11 codes; but a unified table with a version marker makes it easy to query both systems uniformly.
- **Procedure_Code Mapping** – a junction table linking procedures to one or multiple codes. For example, a procedure like “Segmentectomy / Wedge Resection (lung)” might map to both an ICD-10-CM code **C34.x** (Malignant neoplasm of bronchus or lung, particular lobe) and **D38.1** (Neoplasm of uncertain behavior of bronchus and lung) in the sample list. This table would have foreign keys like `procedure_id`, `code_id`. This supports *many-to-many* relationships: a single procedure can relate to multiple ICD codes (as seen in the sample list where some procedures list several ICD-10 codes), and conversely the same ICD code might relate to multiple procedures.
- **Body_System (or Specialty)** – a reference table listing categories of procedures (Cardiac, Thoracic, Neurosurgery, etc.), which can be linked to the Procedures table (either via a foreign key or a many-to-many if a procedure belongs to multiple categories). In the provided sample, the **“Speciality”** column (e.g. *Cardiac Surgery*, *Thoracic Surgery*, *Paediatric Surgery*) can serve as the body system or department performing the procedure.

For prototyping, you can seed the **Procedures** table with the provided sample list of surgeries and their known ICD-10 codes (from the Excel). This helps in two ways: (1) enabling offline or quick lookups for those sample cases, and (2) providing a controlled set of data to test mapping logic. The **ICD_Codes** table can be initially populated with the ICD-10 codes from the sample (and any manually identified equivalent ICD-11 codes for those samples, if known). As users search for procedures, you can also store new codes that are retrieved from the APIs into this table for caching and for enriching the internal dataset over time.

**Filtering by Body System:** To implement filtering, ensure each Procedure has an associated body system or specialty. This can be an attribute on the Procedure (if singular) or a relation if multiple categories apply. For example, **“Coronary artery bypass”** might be tagged under *Cardiac Surgery*, whereas *“Appendectomy”* would fall under *General or Gastrointestinal Surgery*. In ICD classification, *chapters* roughly correspond to body systems (e.g., ICD-10 “I00–I99” are circulatory system diseases, “K00–K95” digestive system, etc.), but since your app is procedure-centric, using clinical specialties from the sample list (Cardiac, Thoracic, etc.) is a straightforward approach. Use these categories to provide a filter dropdown or checklist in the UI so users can narrow the list of procedures or search results to a particular domain (e.g., only show procedures related to Orthopedics).

## 3. Mapping Between ICD-10 and ICD-11 Codes

**Understanding the Mapping Challenge:** Direct ICD-10 to ICD-11 mapping is **not always one-to-one**. The two code sets are structured differently – ICD-10-CM often has **multiple specific codes for variations** (such as left vs right side, specific sites, or complications), whereas **ICD-11 uses a base code plus “postcoordination”** (additional extension codes) to capture detailed specifics like **laterality or anatomical site**. This means a single ICD-11 code can represent what in ICD-10 might require a combination of codes or a more granular code selection. For example, in ICD-10-CM a malignant breast cancer diagnosis has different codes for the specific breast and quadrant (e.g., **C50.211** – Malignant neoplasm of upper-inner quadrant of right female breast, vs **C50.212** for left breast). In the sample dataset they used **C50.9** for “Breast Cancer” as a general code (malignant neoplasm of breast, unspecified site). **ICD-11**, by contrast, has a single category **2C6Z “Malignant neoplasms of breast, unspecified”**, with the ability to add a **laterality extension** code for left vs right, and even specify quadrants as post-coordinated detail.

**Mapping Approaches:** For the prototype, you have a few options to map between ICD-10 and ICD-11:

- **Leverage WHO’s Mapping Tables:** WHO provides an official ICD-10 to ICD-11 mapping as part of the ICD-11 implementation package. This is essentially a reference crosswalk (including one-to-one and one-to-many mappings) that could be loaded into your database. If available, using this data would allow the app to suggest the corresponding code(s) in the other system when one code is selected. For example, if a user selects an ICD-10-CM code from the search results, you might use a pre-loaded map to find the candidate ICD-11 code(s) (and vice versa). Keep in mind, however, that these mappings can be **complex** – sometimes a single ICD-10 code maps to multiple ICD-11 codes or requires multiple ICD-11 codes to convey the full meaning. In a prototype, you might include a *simplified mapping* for common procedures using the sample list as a starting point for manual mapping (since you have domain knowledge of those procedures). For instance, if you know the **ICD-11 code** that corresponds to each sample ICD-10 code, store that in the database for quick lookup.
- **On-the-fly Mapping via Search:** If comprehensive mapping data is not readily available, an alternative approach in the prototype is to **use the code descriptions to find matches**. That is, when an ICD-10 code is selected, the app can automatically query the ICD-11 API by the **ICD-10 code’s description** as a keyword. This might retrieve the analogous ICD-11 entry. For example, given ICD-10 **I25.10 “Atherosclerotic heart disease of native coronary artery without angina pectoris”**, the app could search ICD-11 for “coronary atherosclerosis” and find **BA52.0 “Coronary atherosclerosis of native coronary artery”** as a close equivalent. Similarly, ICD-10 **K37 “Appendicitis, unspecified”** (used for appendectomy in the sample list) could map to ICD-11 **DB10.02 “Acute appendicitis without generalized or localized peritonitis”** – effectively the uncomplicated appendicitis code. This heuristic isn’t perfect, but for a prototype it can demonstrate the concept of code mapping. It’s important to flag to users that mappings may be approximate and that manual verification is needed for clinical use.
- **Store Mappings in DB:** In the **Procedure_Code** mapping table mentioned above, you can add an attribute to indicate if a link is an **“equivalent” or “related” code** in the other system. For example, link ICD-10 code C50.9 to ICD-11 code 2C6Z as equivalent diagnoses for breast cancer. During a search, if a procedure from the sample list is recognized, the app can display the pre-mapped code on the opposite side. (E.g., user searches “Mastectomy” → finds ICD-10 C50.9; your database knows C50.9 corresponds to ICD-11 2C6Z, so you display 2C6Z even before calling the API). This improves speed and demonstrates the side-by-side mapping clearly. In practice, mapping **maintenance** is challenging – you’d want to regularly update mappings in line with WHO’s releases and perhaps provide a way to handle one-to-many mappings (e.g., listing multiple possible ICD-11 targets if needed).

**Handling Sub-codes and Specificity:** Both code sets allow increasing specificity: ICD-10-CM does so via distinct codes, while ICD-11 does so via extension codes. Your app should present these clearly rather than hiding them. For example, if a clinician searches for a term like “breast neoplasm”, they might get a broad code (C50.9 / 2C6Z as above) **and** more specific sub-codes. In the UI, you could show a tree or list of related codes – e.g., under C50 (Malignant neoplasm of breast) list its sub-codes C50.0–C50.9 with labels (each corresponding to different sites of the breast, and different 6th characters for laterality in ICD-10-CM). For ICD-11, if an entity has **postcoordination (sub-code options)**, the WHO API indicates that (e.g., a flag or available extension list) – you might then allow the user to select extensions. For instance, for 2C6Z (breast cancer, unspecified), the API/ontology will show that a **Laterality extension** can be added. A user interface approach is to let the user pick “left” or “right” which then appends the laterality code and updates the displayed ICD-11 code string. Since implementing full postcoordination might be complex for a prototype, you can at least **display** the possible specific options. (The find-a-code data above shows categories like “Laterality” and “Specific anatomy” for 2C6Z, meaning ICD-11 expects an extension code from those axes. For example, adding the code **XA** modifier for “Right” could yield something like “2C6Z&XA=a (fictional example)” to specify right breast – the exact mechanism would be in the API docs).

In summary, the mapping is **non-trivial**, but for a high-level prototype: use a combination of **lookup tables** (for known mappings) and **live search** to find equivalents. Clearly separate the two code sets in the UI to avoid confusion, and **document that perfect mapping may require clinical review**. This tool is primarily to assist by collating information, not to *fully automate* conversion between ICD-10 and ICD-11 (that would require a robust mapping resource and handling of complex cases – out of scope for a prototype).

## 4. Frontend UI Design (React)

The React frontend will be the user’s interface to search and compare codes. Key UI elements and features:

- **Search Bar:** A central search input where users can type a procedure name or code. Implement features like *typeahead suggestions* for a better user experience. For instance, as the user types “append”, you can call the backend search API and display suggestions: e.g., “Appendectomy – K37 (ICD-10) / DB10.2 (ICD-11)”. This can be achieved by using the ICD-10 API’s autocompletion style (it’s designed for live suggestions). The suggestions could be shown in two columns under the search box (one for matching ICD-10 terms and one for ICD-11 terms), or as unified suggestions like “Term – [ICD-10 code]/[ICD-11 code]” if you have pre-mapped entries. For simplicity, you might start with a basic search on submit, and add auto-suggest in a later iteration.
- **Results Display (Side-by-Side):** Once a search is executed, display results from both coding systems **side by side** for easy comparison. For example, use a two-column layout: left column listing ICD-10-CM results, right column listing ICD-11 results. Each entry should show the **code** and the **description**. Highlight where a code is an exact match versus a partial match:
    - If the user searched by a specific code (e.g., “C50.9”), the ICD-10 column might show that exact code’s details at top. The ICD-11 column could then show the mapped ICD-11 code (if found via mapping or direct code search). If the user searched by text (e.g., “breast cancer procedure”), show a list of relevant codes in each column.
    - Allow the user to click on a code to see more details (either expand a row or open a detail pane). This detail could include *additional info* such as **parent category**, any known **synonyms**, and **sub-codes**. For instance, clicking on C50.9 might reveal its place in the hierarchy (Chapter II Neoplasms > Breast malignancy) and child codes like C50.0, C50.1, etc., whereas clicking on 2C6Z could show that “laterality” is an available refinement (with options for left/right).
    - For side-by-side comparison, if your backend or database provides a mapping, you can **align** equivalent codes on the same row. E.g., in a search for “breast cancer”, show C50.9 in left column directly across from 2C6Z in right column, indicating they correspond. Other related results that aren’t direct matches could be listed separately (perhaps lower in the list).
- **Filtering Controls:** Include a filter UI to narrow results by **body system/specialty**. This could be a dropdown of specialties (populated from the distinct values in the sample list, e.g., *Cardiac Surgery, Thoracic Surgery, Paediatric Surgery, etc.*). If a filter is selected, the frontend can either:
    - Limit search scope by adding a parameter (e.g., if the user selects “Cardiac Surgery”, the app could prepend the specialty term to the search query like “cardiac surgery coronary” to bias results).
    - Or filter the displayed **Procedures** list if you have an indexed list of procedures. For example, the homepage might show a categorized list of all available procedures from the sample data (grouped by specialty), and the filter could hide non-matching categories. Users might browse by specialty and then click a procedure to see codes.
    - Additionally, within the results themselves, you might provide checkboxes or pills for sub-filters like “Only show codes for left-sided conditions” if applicable, but this might be advanced. More simply, use the body system filter to reduce noise in search results (since a term like “resection” could apply to many specialties).
- **Display of Sub-codes:** Given the importance of laterality and specific site, design the UI to make these **detailed codes visible**. Options include:
    - Showing a toggle or dropdown to “Show more specific codes” under a broad code. E.g., under ICD-10 C50 (breast cancer), listing C50.011, C50.012, etc. with labels like “malignant neoplasm of nipple/areola, right breast” (this educates the user about coding specificity). In ICD-11’s case, you might show that after selecting 2C6Z, the user can refine by adding *Laterality*. Since postcoordination might be complicated to implement fully, you can at least inform the user: e.g., display text like “ICD-11 allows adding a **laterality** flag to specify left or right breast.”
    - If the prototype is not handling these as interactive elements, you can still *display sub-codes in the description*. For example, in the results list, instead of just “C50.9 – Malignant neoplasm of breast, unspecified site”, you could append a note like “(Other codes C50.0–C50.8 specify quadrant and side)” to highlight ICD-10’s sub-coding. Similarly for ICD-11, you might display “2C6Z – Malignant neoplasms of breast, unspecified (can add laterality and specific quadrant as needed)”.
- **Responsive Design & Clarity:** Ensure the side-by-side layout remains clear on various screen sizes. Use a card or table layout with scroll if necessary. Code descriptions can be long, so use a fixed-width column or allow wrapping; highlight the code itself (e.g., bold or a monospace font) for quick scanning. Since this is for clinicians/coders, showing the code **and** the description is important. Consider using a different color or icon for ICD-10 vs ICD-11 columns to reinforce the distinction.
- **No Integration (for now) with EHR:** As it’s a standalone prototype, you won’t integrate with live hospital systems. But do design the data flows such that integration could be added later. (For example, if a user selects a code, maybe allow copying it or preparing an output that could be sent to another system. But these are stretch goals; the primary focus is search and comparison.)

## 5. API Limitations & Considerations

When using external APIs, keep these points in mind:

- **WHO ICD-11 API – Authentication & Throttling:** As mentioned, the ICD-11 API requires an API key and token. This adds complexity (managing keys, refreshing tokens). The token requirement means calls from the client-side are impractical (you wouldn’t expose the secret in a browser), so a server proxy (your Laravel backend) is needed. The WHO API may also have **rate limits or request quotas** (for example, some APIs limit the number of requests per minute or per day per API key). Check WHO’s documentation for current limits and plan accordingly – e.g., if the limit is (hypothetically) 1000 calls per day, you might avoid making multiple calls per search by using efficient queries or caching. Also, consider the **coverage** of the API: ICD-11 is still relatively new, and while it’s comprehensive for diagnoses, some **national modifications** (like ICD-10-CM’s extra clinical detail) might not have direct equivalents. Educate users that differences will exist and some ICD-10 concepts (especially very U.S.-specific ones) might not neatly translate into ICD-11 terms.
- **NIH ICD-10-CM API – Data Currency & Limits:** The NLM service is updated to the latest ICD-10-CM version annually (as of now it’s using 2026 codes). It is robust and meant for public use, but since it’s “as is”, there’s no guaranteed uptime SLA. There are no fixed API keys or call quotas, but extremely high volumes could be curtailed. Also, the ICD-10-CM API primarily provides code and description. It does not offer hierarchical relationships or metadata about the codes (aside from code and long description). If you need to know a code’s chapter (body system) or parent category, you’d need a separate data source or manual classification. For prototype purposes, you can hardcode or derive it (for example, for any ICD-10 code, the first three characters or the letter can indicate the chapter – e.g., **“K” codes are Digestive System**). This could help implement the body-system filter in a dynamic way if needed.
- **Concurrent Searching & Latency:** Since you’re calling two APIs when a user searches, the slowest call will determine the response time. Typically, these APIs respond quickly (in fractions of a second) for single-term queries. Still, implement the search in parallel (e.g., trigger both requests simultaneously from the backend) to minimize wait time. On the client side, you can show a loading indicator in each results column while data is coming in. It’s also wise to handle error cases: e.g., if the ICD-11 API call fails (maybe due to an auth issue), you can still return the ICD-10 results rather than nothing, possibly with a warning that “ICD-11 data is temporarily unavailable”. For the prototype, demonstrating this resilience is a plus.
- **Data Volume and Pagination:** If a user searches a very broad term (like “cancer”), the ICD-10 API might have thousands of matches. By default the API returns only a subset (e.g., first 7 or so). You can increase `maxList` or `count` to get more results, but for usability it might be better to show the top, say, 10 results from each system. Provide a “Show more” button if needed, which could fetch the next page (using the `offset` parameter for the ICD-10 API, and analogous paging for ICD-11 if available). In most targeted use-cases (specific procedure names), this may not be an issue.
- **ICD-10 vs ICD-10-CM vs Procedures:** Note that **ICD-10-CM is a diagnosis coding system**. Surgical *procedure* coding in the U.S. is often done via **ICD-10-PCS** or CPT, not ICD-10-CM. However, your app ties surgical procedures to diagnoses (likely the indications for those surgeries). The WHO’s ICD API can serve **ICD-10 (international version) data as well** if needed, but since you specifically want ICD-11, using ICD-10-CM from NLM and ICD-11 from WHO is a reasonable approach. Just be clear that when we say “ICD-10 codes” here, we mean ICD-10-CM diagnosis codes associated with the condition the procedure addresses, not an actual procedure coding system. This is fine for a listing app (clinicians often think in terms of diagnosis when considering procedures). It might be worth mentioning this distinction somewhere in the app/UI to avoid confusion, especially if the audience includes coders – they will know ICD-10 procedure coding is separate. For now, focusing on ICD-10-CM (diagnoses) and ICD-11 is acceptable.

## 6. Prototype Tech Stack Recommendations (React + Laravel + MySQL)

**React Frontend:** Use React to create a single-page application that provides a smooth, dynamic user experience. React is well-suited for building a responsive search interface where results update without full page reloads. You can bootstrap the project with Create React App or Next.js for convenience. Key recommendations:

- Use a state management solution (even simple `useState` or Context API) to handle the search input state and results.
- Leverage component libraries or design systems for a quick UI (e.g., Material-UI or Bootstrap) to get polished controls and layout grids. This can help you create the split-view (two-column) result display and input elements quickly.
- Implement debouncing on the search input to avoid flooding the server with requests on every keystroke. For example, wait 300ms after the user stops typing before sending the query. This is especially important once you add features like auto-suggest.
- For HTTP calls, you can use `fetch` or a library like Axios. The React app will make calls to your Laravel backend (e.g., `GET /api/search?query=<term>`), which in turn calls the external APIs as described.

**Laravel/PHP Backend:** Laravel will serve as an API server that mediates between the React app and external services. Recommendations:

- Set up API routes (Laravel has a built-in `api.php` routes file). For example, a route for searching codes, one for perhaps retrieving details of a specific code, etc. Given this is a prototype, one well-designed `/api/search` endpoint might suffice for all functionality (accept a query and optional filters).
- Within the controller, call out to the **ICD-10 API** (no auth needed) and **ICD-11 API** (with an OAuth token). You can write a service class or use Laravel’s HTTP client (which is built on Guzzle) for these calls. Make sure to handle the OAuth token lifecycle: you might create a service that checks if a current token is valid (within 1 hour) or otherwise requests a new one using your client credentials.
- Parse the JSON responses and normalize them. For instance, convert the ICD-10 API’s output into an array of objects like `{code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris"}`, and do similarly for ICD-11 (e.g., `{code: "BA52.0", title: "Coronary atherosclerosis of native coronary artery"}`).
- If using a database (MySQL), integrate Eloquent models for Procedures and Codes. For the search functionality, you might **combine live API results with your local data**. For example, if the search term exactly matches a Procedure name in your database (from the sample list), you could fetch the pre-stored codes immediately (ensuring they appear in results even if the external API might not return that exact term). Then *augment* those with any additional matches from the external APIs. This way, your known sample data is always reflected. Moreover, you can store any new codes returned from the APIs into the `ICD_Codes` table for caching. Since it’s a prototype, caching is not critical, but it could be useful if you want to demonstrate a “recent searches” or ensure subsequent searches are faster.

**MySQL Database:** Use MySQL (or SQLite for simplicity during development) with Laravel’s Eloquent ORM to manage data. Define migrations for the tables suggested in Section 2. Some specifics:

- The `ICD_Codes` table might have a composite primary key (code + version), or an auto-increment `code_id`. Be careful with code formatting: ICD-10-CM codes can include a decimal point (e.g., “K40.90”), which you might store as a string. ICD-11 codes contain letters and digits (e.g., “2C6Z” or “BA52.0” – note that ICD-11 codes can include a dot for further detail, similar to how chapters and categories are denoted).
- The `Procedure_Code` mapping table will have foreign keys referencing `Procedures` and `ICD_Codes`. If you use an auto-increment key for ICD_Codes, then store that; or use the code string directly as a foreign key if you prefer (but that may complicate using both code and version as a unique key).
- If you plan to support filtering by body system, you might not need a separate Body_System table – if each procedure only has one category, just store it in the Procedures table (e.g., `body_system: "Thoracic Surgery"`). If multiple categories per procedure are needed, a join table would be required, but from the sample it looks like each procedure falls under a single specialty.

Given this is a prototype, prioritize **read operations** and keep the design simple. Complex features like user accounts, saving favorites, etc., can be set aside unless needed for demonstration.

## 6A. Backend (Laravel) + Caching + Client-Based Search History + “Addition Requests” Workflow

This prototype benefits from a **thin backend** even though it’s not integrating directly with SCTSystem yet, because the **WHO ICD API requires OAuth2 client credentials** (which must not be exposed in the browser) and because caching dramatically improves performance.

### A) Why you need a backend (even for a prototype)

1. **Secure WHO ICD API access**: WHO ICD API access is managed via registration + keys and uses OAuth2 token-based authentication; this is best handled server-side.
2. **Central caching and rate-limit protection**: Cache results of common searches so that repeated searches don’t repeatedly hit external APIs. (This also improves resilience if external services are temporarily slow.)
3. **Workflow + audit trail**: “Addition Requests” must be stored centrally with status, timestamps, reviewers, and escalation history. (This directly addresses the current operational gap where missing procedures block case capturing and approvals take time.)

### B) Two-tier “memory” model (what gets stored where)

- **Client-based search history (per device/user)**
    - Stored in **LocalStorage** (simple) or **IndexedDB** (larger, more resilient).
    - Contains: recent searches, filters used (e.g., specialty/body system), recently selected codes, pinned items.
    - Rationale: This is *personal and fast* and avoids storing personal browsing behavior on the server. (You can keep server logs aggregated and de-identified.)
- **Server-side cache (shared performance layer)**
    - Stored in **Redis** (recommended) with optional DB fallback.
    - Contains: normalized query + filter → normalized ICD-10-CM results + ICD-11 results, with timestamps and TTL.
    - Rationale: Prevents repeat external calls and improves perceived performance.
- **Central workflow records (Addition Requests)**
    - Stored in **MySQL** as first-class entities: request details, status transitions, reviewers, evidence, timestamps.
    - Rationale: supports governance, traceability, and SLA-driven escalation.

### C) Backend service responsibilities (Laravel)

**1) External API proxy layer**

- **NIH ICD-10-CM search**: Call the Clinical Table Search endpoint and pass through parameters like `terms`, `sf`, `df`, `count`, and `offset`.
- **WHO ICD-11 search**: Handle OAuth token retrieval and use the token for ICD-11 search requests.

**2) WHO OAuth2 token lifecycle**

- Token endpoint is issued via the WHO access management service (OAuth2 client credentials).
- Tokens are short-lived (commonly ~1 hour), so the backend should refresh proactively (e.g., refresh at 55 minutes).

**3) Caching layer**

- Cache key should include: normalized query + selected specialty/body system + language + ICD release version (ICD-11 updates over time).
- Suggested TTL for cache entries (prototype): 7–30 days; invalidate early when ICD release changes.

**4) “Addition Requests” workflow engine**

- Create requests when users find a procedure + codes that are not in the official SCT list.
- Maintain statuses, reviewers, and escalations.
- Provide “export / publish payload” that could later be consumed by SCTSystem.

### D) Recommended API endpoints (prototype)

#### 1) Search (dual-source, cached)

- `GET /api/search?query=<text>&specialty=<optional>&limit=<n>`
    - Backend does:
    - normalize query
    - cache lookup
    - NIH ICD-10-CM search
    - WHO ICD-11 search (with valid token)
    - normalize into one response model

Suggested response shape:

```json
{
  "query": "appendicitis",
  "specialty": "Paediatric Surgery",
  "icd10cm": [{"code":"K35.80","title":"Unspecified acute appendicitis","score":0.92}],
  "icd11": [{"code":"DB10.02","title":"Acute appendicitis without localised or generalised peritonitis","score":0.89}],
  "cache": {"hit": true, "ttl_seconds": 1209600}
}
```

#### 2) Official SCT catalog snapshot (Authorized Procedures List)

- `GET /api/procedures/catalog?specialty=<optional>`
    - Returns the “official” procedure list snapshot used to power the Authorized Procedures frontend index. This returns directly from internal Master TTGs DB.

#### 3) Addition Requests

- `POST /api/addition-requests`
- `GET /api/addition-requests?status=<...>&specialty=<...>`
- `GET /api/addition-requests/{id}`
- `POST /api/addition-requests/{id}/triage`
- `POST /api/addition-requests/{id}/coding-review`
- `POST /api/addition-requests/{id}/clinical-review`
- `POST /api/addition-requests/{id}/approve`
- `POST /api/addition-requests/{id}/reject`
- `POST /api/addition-requests/{id}/publish` (for prototype: export to CSV or push into a “ready-for-import” queue)

### E) Database schema (MySQL) – minimum viable

Keep this minimal for the prototype; expand later once SCTSystem integration is in scope.

**procedures**

- `id`, `name`, `specialty` (body system), `description`, `is_official`, `source`, timestamps

**icd_codes**

- `id`, `system` (`ICD10CM` | `ICD11`), `code`, `title`, `raw_json` (optional), `last_verified_at`

**procedure_code_links**

- `procedure_id`, `icd_code_id`, `relationship_type` (`primary` | `related` | `example`), `confidence`, `source`

**addition_requests**

- `id`, `requester_id` (or email in prototype), `specialty`, `procedure_name`, `proposed_icd10_codes` (json), `proposed_icd11_codes` (json),

`evidence`, `justification`, `priority`, `status`, timestamps

**addition_request_events** (audit trail)

- `id`, `request_id`, `event_type`, `actor_id`, `payload_json`, timestamp

### F) Escalation rules (systemic, simple SLAs)

This is the key mechanism to reduce delays when procedures are missing from the official SCT list.

Recommended statuses:

- `draft` → `submitted` → `triage` → `coding_review` → `clinical_review` → `approved` → `published_to_sct`

Recommended escalation triggers:

- `submitted` older than 24–48 hours → notify triage queue
- `coding_review` older than X days → notify coding lead
- `clinical_review` older than X days → notify specialty lead

This aligns with the governance need for standardized definitions, classification protocols, and audit-ready processes highlighted in your prior initiatives.

### G) Frontend UX hooks that enable the workflow (React)

- If user selects a procedure + codes and **it does not exist in the official catalog snapshot**, show a primary action:
    - **“Request Addition to SCT Official List”**
- Persist:
    - **Search history** in client storage
    - **Draft requests** locally until submitted
- Provide dashboards:
    - “My requests” (submitter)
    - “Review queue” (coding/clinical reviewers)

### H) Security & privacy baseline (prototype-safe)

- Do **not** store patient identifiers or case-specific clinical notes.
- Store only: search terms, selected codes, request metadata, and audit events.
- Keep WHO client secrets and tokens strictly server-side (never in React).

---

## 7. Incorporating the Sample Procedure List

The provided sample list of procedures and ICD-10 codes (presumably from an Excel “Master_v4 TTGs.xlsx”) should be utilized to both validate the app and seed initial data. Here’s how to incorporate it:

- **Data Seeding:** Use the sample as a starting dataset. Each row in that list likely corresponds to a Procedure (with columns like Speciality, Procedure, ICD-10 code, etc.). You can create a seeder script or manual SQL to insert these into your Procedures and Procedure_Code tables. This gives the app an immediate knowledge base of procedures **even without calling the APIs**, which is useful for development and demos.
- **Testing Searches:** The sample can act as test cases. For example, if the list includes “Coronary artery bypass – I25.10”, try searching the app for “Coronary bypass” or “I25.10” and ensure the ICD-10 result appears (from either the local DB or live API) and that the corresponding ICD-11 result (e.g. BA52.0) is shown. You can use these known mappings to demonstrate the side-by-side feature.
- **Mapping Table Population:** If possible, enhance the sample data by adding a column for **ICD-11 codes** manually (for a few entries where you find them). This would let you pre-populate the mapping in your database for those examples. Our research below provides a few example mappings. Even if you don’t fill every entry, including some will make your demo more compelling (since you can show the direct comparison). For other entries without a pre-known ICD-11, the app can still use the live search approach to fetch likely matches when the user queries.
- **Body System Filter Values:** Derive the list of unique specialties from the sample (e.g., *Radiation Oncology, Cardiac Surgery, Thoracic Surgery, Paediatric Surgery*, etc.). These will populate the filter control. When a user selects a specialty, you can limit the search to procedures in that category (if searching within local data) or perhaps use the term as a keyword (e.g., adding “cardiac” if they choose Cardiac Surgery to bias the external search). Since the sample data is categorized, a simple approach is to filter the local Procedures that match the selected category and present those as suggestions or in a list. The user can then pick one to see codes.

To ensure clarity, here is a **sample mapping table** for a few procedures from your list, showing their ICD-10-CM and corresponding ICD-11 codes with descriptions and notes on specificity:

| Surgical Procedure | ICD-10-CM Code & Description | ICD-11 Code & Description |
|---|---|---|
| Mastectomy (Breast cancer) – Removal of breast (usually for malignant breast tumor) | **C50.9** – *Malignant neoplasm of breast, unspecified site*.<br>*(ICD-10-CM has distinct sub-codes C50.0–C50.8 for specific breast quadrants, and laterality extensions (e.g., C50.911: right breast, unspecified quadrant) to denote which breast)*. | **2C6Z** – *Malignant neoplasms of breast, unspecified*.<br>*(ICD-11 uses this one code for breast cancer of unspecified location; **postcoordination** can add an **extension for “Laterality”** to specify left vs right, and another for specific quadrant if needed.)* |
| Coronary artery bypass surgery – Grafting around blocked coronary arteries for CAD | **I25.10** – *Atherosclerotic heart disease of native coronary artery without angina pectoris*.<br>*(ICD-10-CM specifies whether angina is present: e.g., I25.10 without angina, I25.11 with angina, etc.)* | **BA52.0** – *Coronary atherosclerosis of native coronary artery*.<br>*(ICD-11 represents coronary artery disease without detailing angina in the code; angina pectoris, if needed, can be coded separately as a co-morbid condition. The parent category BA52 covers coronary atherosclerosis in general, with **sub-codes** like BA52.0 for native arteries and BA52.2 for bypass grafts.)* |
| Appendectomy (Appendicectomy) – Surgical removal of the appendix | **K37** – *Appendicitis, unspecified* (used when it’s not specified as acute or chronic).<br>*(In ICD-10-CM, acute appendicitis without mention of peritonitis is often coded as **K35.80**, whereas “K37” is a general code for appendicitis not specified as acute or chronic. In practice K37 is rarely used if acuity is known.)* | **DB10.02** – *Acute appendicitis without localised or generalised peritonitis*.<br>*(ICD-11 classifies appendicitis under code block **DB10**. Here we’ve chosen the code for an **uncomplicated acute appendicitis** as the likely equivalent of an unspecified appendicitis requiring an appendectomy. ICD-11 provides separate codes for appendicitis with generalized peritonitis (DB10.00) or localized peritonitis (DB10.01).)* |
| Inguinal hernia repair – Surgery to fix an inguinal hernia (groin hernia) | **K40.90** – *Unilateral inguinal hernia, without obstruction or gangrene, not specified as recurrent*.<br>*(ICD-10-CM has a family of codes for inguinal hernias based on laterality, and presence of obstruction/gangrene. For example: K40.90 for a single-side hernia with no complications, K40.20 for bilateral hernia without obstruction/gangrene, etc.)* | **DD51** – *Inguinal hernia* (base category).<br>*(ICD-11 uses one main code for inguinal hernia and allows adding detail via **extension codes**: a **Laterality extension** (to indicate left, right, or bilateral), and additional codes for complications like obstruction or gangrene if present. For example, a right-sided uncomplicated inguinal hernia could be represented as DD51 + extension for “right side”)*. |

**Table:** *Examples of surgical procedures from the sample list with their associated ICD-10-CM and ICD-11 codes and descriptions. Note how ICD-10-CM often uses multiple codes or code variants to capture specifics (like which side of the body or complications), whereas ICD-11 typically uses one base code with added **postcoordination** for specifics like laterality or complications.*

---

## Conclusion and Next Steps

**Summary:** The prototype Surgical Procedure Listing App will combine two coding systems to aid clinical coders and providers. By integrating the NLM’s ICD-10-CM search API and WHO’s ICD-11 API, the app can retrieve and display corresponding codes for a given surgical procedure or diagnosis query. A carefully designed database will support this dual-code structure, and a React-based UI will present information in a clear, side-by-side format with options to filter by specialty (body system) and drill down into specific code details (such as laterality or anatomical site distinctions).

This solution helps users understand the relationships between ICD-10 and ICD-11: for instance, showing that what was once multiple codes in ICD-10 (accounting for various specifics) might collapse into one core code in ICD-11 with extensions for additional detail. In building the prototype, pay attention to the **technical constraints** (authorization and rate limits for the ICD-11 API, data size limits for the ICD-10 API, etc.) and use the provided sample data to guide development and verify that the system works for real-world procedure examples. By following this design, you’ll create a functional prototype that demonstrates the key features: integrated search, code mapping, and an intuitive UI for cross-walking between ICD-10 and ICD-11 – a valuable tool for clinicians and coders preparing for the transition to ICD-11.
