import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async (isMounted) => {
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      if (isMounted) {
        setMessages(data?.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
      if (isMounted && loading) {
        setError('Failed to load messages.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!user || user.id === parseInt(userId)) {
      navigate('/feed');
      return;
    }

    setLoading(true);
    fetchMessages(isMounted);

    const interval = setInterval(() => {
      fetchMessages(isMounted);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId, user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const tempMessage = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: parseInt(userId),
      content: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      await axiosInstance.post('/messages', {
        receiver_id: userId,
        content: tempMessage.content
      });
      fetchMessages(true);
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        <div className="card">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="card message-container" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
        <div className="message-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
          <h2>Chat</h2>
        </div>
        
        {error && <p className="form-error">{error}</p>}
        
        <div className="message-list" style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          {messages.length === 0 ? (
            <p className="text-secondary text-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg?.sender_id === user?.id;
              return (
                <div key={msg?.id} style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    backgroundColor: isMine ? 'var(--color-primary)' : '#f1f1f1',
                    color: isMine ? 'white' : 'var(--color-text-primary)'
                  }}>
                    {msg?.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            className="input"
            style={{ flex: 1 }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage.trim() || sending}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
