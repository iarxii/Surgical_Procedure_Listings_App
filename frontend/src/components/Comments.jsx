import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User, Loader2, Tag, X, AtSign } from 'lucide-react';

/* ─── Predefined tag suggestions ─── */
const TAG_SUGGESTIONS = [
  'Urgent', 'Follow-up', 'Review', 'Coding Query',
  'SLA Concern', 'Documentation', 'Approval', 'Audit',
];

/* ─── Render comment body with @mention badges inline ─── */
function RichBody({ text, mentions }) {
  if (!mentions || mentions.length === 0) return <p className="comment-text">{text}</p>;

  // Build a regex that matches any @mention in the text
  const escaped = mentions.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(@(?:${escaped.join('|')}))`, 'gi');
  const parts = text.split(regex);

  return (
    <p className="comment-text">
      {parts.map((part, i) => {
        if (regex.test(part)) {
          regex.lastIndex = 0; // reset after test
          return (
            <span key={i} className="mention-badge-inline">
              <AtSign className="h-3 w-3" />
              {part.slice(1)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function Comments({ procedureName }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const tagInputRef = useRef(null);

  // Load comments when procedure changes
  useEffect(() => {
    if (!procedureName) return;
    setLoading(true);
    setError(null);
    axios
      .get(`http://127.0.0.1:8085/api/comments?procedure_name=${encodeURIComponent(procedureName)}`)
      .then(res => setComments(res.data.data))
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false));
  }, [procedureName]);

  // Extract @mentions from body text
  const extractMentions = useCallback((text) => {
    const matches = text.match(/@[\w\s.'-]+/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1).trim()).filter(Boolean))];
  }, []);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const filteredSuggestions = TAG_SUGGESTIONS.filter(
    s => !tags.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;

    const mentions = extractMentions(body);

    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post('http://127.0.0.1:8085/api/comments', {
        procedure_name: procedureName,
        author: author.trim(),
        body: body.trim(),
        tags,
        mentions,
      });
      setComments(prev => [res.data.data, ...prev]);
      setBody('');
      setTags([]);
    } catch {
      setError('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3 className="comments-title">
          <MessageSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          Comments
          {comments.length > 0 && (
            <span className="comments-count">{comments.length}</span>
          )}
        </h3>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="comments-form">
        <div className="comments-form-row">
          <div className="comments-input-group">
            <User className="h-4 w-4 comments-input-icon" />
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="comments-input comments-author-input"
              maxLength={100}
            />
          </div>
        </div>

        {/* Tags input */}
        <div className="comments-form-row">
          <div className="comments-tags-wrapper">
            <Tag className="h-4 w-4 comments-input-icon" style={{ top: tags.length > 0 ? '12px' : '50%', transform: tags.length > 0 ? 'none' : 'translateY(-50%)' }} />
            <div className="comments-tags-container">
              {tags.map(tag => (
                <span key={tag} className="tag-badge">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="tag-badge-remove">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                placeholder={tags.length === 0 ? 'Add tags (e.g. Urgent, Follow-up)…' : 'Add more…'}
                value={tagInput}
                onChange={e => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                onKeyDown={handleTagKeyDown}
                className="comments-tag-input"
                maxLength={50}
              />
            </div>
            {/* Tag suggestions dropdown */}
            {showTagSuggestions && filteredSuggestions.length > 0 && (
              <div className="tag-suggestions">
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="tag-suggestion-item"
                    onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                  >
                    <Tag className="h-3 w-3" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment body with @mention hint */}
        <div className="comments-form-row">
          <div className="comments-textarea-wrapper">
            <textarea
              placeholder="Add a comment… Use @name to mention someone"
              value={body}
              onChange={e => setBody(e.target.value)}
              className="comments-textarea"
              rows={3}
              maxLength={2000}
            />
            {extractMentions(body).length > 0 && (
              <div className="comments-mentions-preview">
                <AtSign className="h-3.5 w-3.5" style={{ color: 'var(--accent)', flexShrink: 0 }} />
                {extractMentions(body).map(m => (
                  <span key={m} className="mention-badge">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="comments-form-actions">
          <span className="comments-char-count" style={{ color: 'var(--text-muted)' }}>
            {body.length}/2000
          </span>
          <button
            type="submit"
            disabled={submitting || !author.trim() || !body.trim()}
            className="comments-submit-btn"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </div>
      </form>

      {error && (
        <div className="comments-error">{error}</div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="comments-loading">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
          <span>Loading comments…</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">
                {c.author.charAt(0).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                </div>

                {/* Tags */}
                {c.tags && c.tags.length > 0 && (
                  <div className="comment-tags">
                    {c.tags.map(tag => (
                      <span key={tag} className="tag-badge tag-badge-sm">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Body with inline @mentions */}
                <RichBody text={c.body} mentions={c.mentions} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="comments-empty">
          <MessageSquare className="h-8 w-8" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p>No comments yet. Be the first to share your thoughts.</p>
        </div>
      )}
    </div>
  );
}
