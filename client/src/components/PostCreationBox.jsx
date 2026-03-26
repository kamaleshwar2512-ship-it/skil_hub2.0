import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PostCreationBox({ onCreatePost, postTypes }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onCreatePost(content.trim(), type);
    setContent('');
    setIsExpanded(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="card mb-4" style={{ padding: '12px 16px' }}>
      <div className="flex gap-2 items-center mb-3">
        <div className="avatar avatar-md">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
        </div>
        <button
          className="btn btn-ghost flex-1 text-left justify-start rounded-full border-border bg-bg-card-hover text-muted hover:bg-zinc-100 font-semibold py-3 px-4"
          onClick={() => setIsExpanded(true)}
        >
          Start a post
        </button>
      </div>

      <div className="flex justify-between items-center px-4">
        <button className="btn btn-ghost gap-2 text-sm text-secondary font-bold hover:bg-zinc-100 p-2 rounded">
          <span className="text-xl">🖼️</span> Media
        </button>
        <button className="btn btn-ghost gap-2 text-sm text-secondary font-bold hover:bg-zinc-100 p-2 rounded">
          <span className="text-xl">📅</span> Event
        </button>
        <button className="btn btn-ghost gap-2 text-sm text-secondary font-bold hover:bg-zinc-100 p-2 rounded">
          <span className="text-xl">📝</span> Write article
        </button>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-xl animate-scale-in">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-lg">
                   {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <select
                    className="form-input py-0 px-2 text-xs w-auto bg-transparent border-none font-bold text-muted cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {postTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn btn-ghost rounded-full p-2" onClick={() => setIsExpanded(false)}>✕</button>
            </div>

            <textarea
              className="form-input border-none focus:ring-0 p-0 text-lg min-h-[150px] resize-none"
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />

            <div className="mt-4 flex justify-between items-center border-t border-border pt-3">
              <div className="flex gap-2 text-xl text-muted">
                <button title="Add media">🖼️</button>
                <button title="Add document">📄</button>
                <button title="Share we're hiring">💼</button>
                <button title="Celebrate an occasion">✨</button>
                <button title="Create a poll">📊</button>
              </div>
              <button
                className="btn btn-primary rounded-full px-4 font-bold"
                disabled={!content.trim()}
                onClick={handleSubmit}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
