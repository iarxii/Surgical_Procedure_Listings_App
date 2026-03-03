import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';

export default function Comments({ procedureName }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post('http://127.0.0.1:8085/api/comments', {
        procedure_name: procedureName,
        author: author.trim(),
        body: body.trim(),
      });
      setComments(prev => [res.data.data, ...prev]);
      setBody('');
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
        <div className="comments-form-row">
          <textarea
            placeholder="Add a comment about this procedure…"
            value={body}
            onChange={e => setBody(e.target.value)}
            className="comments-textarea"
            rows={3}
            maxLength={2000}
          />
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
                <p className="comment-text">{c.body}</p>
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
