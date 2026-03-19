import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { markAllRead, decrementCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/notifications', {
        params: {
          unread_only: filterUnread || undefined,
          page: 1,
          limit: 50,
        },
      });
      setNotifications(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUnread]);

  const handleMarkAll = async () => {
    setMarkingAll(true);
    setError('');
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      markAllRead();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      decrementCount();
    } catch {
      // non-critical
    }
  };

  const handleOpen = (notif) => {
    handleMarkRead(notif.id, notif.is_read);
    if (notif.reference_type === 'post' && notif.reference_id) {
      navigate('/feed');
    } else if (notif.reference_type === 'project' && notif.reference_id) {
      navigate(`/projects/${notif.reference_id}`);
    }
  };

  return (
    <div className="content-container">
      <div className="notifications-header">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Stay on top of likes, comments, and collaboration requests.</p>
        </div>
        <div className="notifications-actions">
          <label className="notifications-filter">
            <input
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
            />
            <span>Show unread only</span>
          </label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? 'Marking…' : 'Mark all as read'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="card">
          <p className="form-error">{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center text-secondary p-4">
          No notifications yet. Interact with posts and projects to see updates here.
        </div>
      ) : (
        <div className="card">
          <ul className="notifications-list">
            {notifications.map((n) => {
              const createdAt = n.created_at
                ? new Date(n.created_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : '';
              return (
                <li
                  key={n.id}
                  className={`notification-row ${n.is_read ? 'notification-read' : 'notification-unread'}`}
                  onClick={() => handleOpen(n)}
                >
                  <div className="notification-main">
                    <p className="notification-message">{n.message}</p>
                    <p className="notification-meta text-xs text-secondary">{createdAt}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id, n.is_read);
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
