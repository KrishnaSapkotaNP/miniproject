import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
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
      const projectsData = await api.getAllProjects();
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
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

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProject(id);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      setMessage('✓ Project deleted');
    } catch (err) {
      setMessage('Failed to delete project');
    }
  };

  if (loading && requests.length === 0) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ Admin Dashboard</h1>
      </div>

      {message && <div className="info-message">{message}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Creator Requests ({requests.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects ({projects.length})
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
                    <button onClick={() => handleApprove(req.id)} className="btn-approve">✓ Approve</button>
                    <button onClick={() => handleReject(req.id)} className="btn-reject">✗ Reject</button>
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

      {activeTab === 'projects' && (
        <div className="admin-section">
          <h2>All Projects</h2>
          {projects.length === 0 ? (
            <p>No projects available</p>
          ) : (
            <div className="users-table">
              {projects.map(project => (
                <div key={project.id} className="user-card">
                  <div className="user-info">
                    <h4>{project.title}</h4>
                    <p><strong>Creator ID:</strong> {project.creator_id}</p>
                    <p><strong>Price:</strong> ${Number(project.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
