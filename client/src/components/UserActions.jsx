import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function UserActions({ userId }) {
  const [status, setStatus] = useState('loading');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStatus() {
      if (!user || !user.id || user.id === parseInt(userId)) {
        if (isMounted) setStatus('none');
        return;
      }
      try {
        const { data } = await axiosInstance.get(`/connections/status/${userId}`);
        if (isMounted) {
          setStatus(data?.data?.status || 'none');
        }
      } catch (err) {
        console.error('Failed to fetch connection status', err);
        if (isMounted) setStatus('none');
      }
    }
    
    fetchStatus();
    return () => { isMounted = false; };
  }, [userId, user]);

  const handleConnect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await axiosInstance.post('/connections/request', { receiver_id: userId });
      setStatus('pending');
    } catch (err) {
      console.error('Failed to send connection request', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };

  if (!user || !user.id || user.id === parseInt(userId) || status === 'loading') {
    return null;
  }

  return (
    <div className="user-actions">
      {status === 'none' && (
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleConnect} 
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      )}
      {status === 'pending' && (
        <button className="btn btn-secondary btn-sm" disabled>
          Pending
        </button>
      )}
      {status === 'accepted' && (
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleMessage}
        >
          Message
        </button>
      )}
    </div>
  );
}
