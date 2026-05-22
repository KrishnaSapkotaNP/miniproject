import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import FolderTree from '../components/FolderTree';
import '../styles/dashboard.css';
import { purchaseProject } from '../utils/purchases';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expandedProjects, setExpandedProjects] = useState({});

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
        setProjects(prevProjects =>
          prevProjects.map(p =>
            p.id === id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error('Upvote error:', err);
      setMessage('Failed to upvote');
    }
  };

  const handleToggleStructure = async (id, e) => {
    e.stopPropagation();
    setExpandedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

    const target = projects.find(p => p.id === id);
    if (target?.structure?.length) return;

    try {
      const response = await api.getProjectById(id);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === id
            ? { ...project, structure: response.structure }
            : project
        )
      );
    } catch (err) {
      console.error('Failed to load structure:', err);
      setMessage('Failed to load project structure');
    }
  };

  const handleBuy = (id) => {
    purchaseProject(id);
    setProjects(prevProjects => [...prevProjects]);
  };

  if (loading) return <div className="page-container"><p>Loading projects...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏪 Project Marketplace</h1>
        <p>Browse and buy amazing software projects</p>
      </div>

      {message && <div className="info-message">{message}</div>}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="no-projects">No projects available yet</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card-container">
              <div
                onClick={() => window.location.href = `/project/${project.id}`}
                style={{ cursor: 'pointer' }}
              >
                <ProjectCard project={project} onUpvote={handleUpvote} onBuy={handleBuy} showActions={true} />
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn-upvote"
                  onClick={(e) => handleToggleStructure(project.id, e)}
                >
                  {expandedProjects[project.id] ? 'Hide Structure' : 'View Structure'}
                </button>
              </div>
              {expandedProjects[project.id] && project.structure && (
                <div className="folder-structure">
                  <FolderTree structure={project.structure} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
