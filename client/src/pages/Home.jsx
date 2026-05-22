import React, { useState, useEffect } from 'react';
import { Store, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import '../styles/dashboard.css';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getAllProjects();
      setProjects(data);
    } catch (err) {
      setMessage('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const result = await api.upvoteProject(id);
      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setProjects(projects.map(p => p.id === id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
      }
    } catch (err) {
      console.error('Upvote error:', err);
      setMessage('Failed to upvote');
    }
  };

  if (loading) return <div className="page-container"><p>Loading projects...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <Store size={32} style={{ color: 'var(--primary-color)' }} />
          Project Marketplace
        </h1>
        <p>Browse and buy amazing software projects</p>
      </div>

      {message && (
        <div className="info-message">
          <AlertCircle size={18} />
          {message}
        </div>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="no-projects">No projects available yet</p>
        ) : (
          projects.map(project => (
            <div key={project.id} onClick={() => window.location.href = `/project/${project.id}`} style={{ cursor: 'pointer' }} className="project-card-container">
              <ProjectCard project={project} onUpvote={handleUpvote} showActions={true} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
