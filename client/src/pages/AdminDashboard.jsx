import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Check, X, Users, ClipboardList } from 'lucide-react';
import { api } from '../services/api';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    } else {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        navigate('/');
      } else {
        loadAdminData();
      }
    }
  }, [navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const requestsData = await api.getPendingRequests();
      const usersData = await api.getAllUsers();
      setRequests(requestsData);
      setUsers(usersData);
    } catch (err) {
      setMessage('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      setMessage('✓ Request approved');
      loadAdminData();
    } catch (err) {
      setMessage('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      setMessage('✓ Request rejected');
      loadAdminData();
    } catch (err) {
      setMessage('Failed to reject request');
    }
  };

  if (loading && requests.length === 0) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <Settings size={32} style={{ color: 'var(--primary-color)' }} />
          Admin Dashboard
        </h1>
      </div>

      {message && <div className="info-message">{message}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ClipboardList size={16} />
          Creator Requests ({requests.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={16} />
          Users ({users.length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="admin-section">
          <h2>Pending Creator Requests</h2>
          {requests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <div className="requests-table">
              {requests.map(req => (
                <div key={req.id} className="request-card">
                  <div className="request-info">
                    <h4>{req.name}</h4>
                    <p><strong>Email:</strong> {req.email}</p>
                    <p><strong>Portfolio:</strong> <a href={req.sample_work_link} target="_blank" rel="noopener noreferrer">{req.sample_work_link}</a></p>
                    <p><strong>Message:</strong> {req.message}</p>
                  </div>
                  <div className="request-actions">
                    <button onClick={() => handleApprove(req.id)} className="btn-approve">
                      <Check size={14} />
                      Approve
                    </button>
                    <button onClick={() => handleReject(req.id)} className="btn-reject">
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>All Users</h2>
          <div className="users-table">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> <span className={`role-badge role-${user.role}`}>{user.role}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
