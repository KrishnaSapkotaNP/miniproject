import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import FolderTree from '../components/FolderTree';
import '../styles/dashboard.css';
import { hasPurchasedProject, purchaseProject } from '../utils/purchases';

const PROJECT_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const getCachedProject = (key) => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw);
    if (!cached?.data) return null;
    if (Date.now() - cached.savedAt > PROJECT_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

const setCachedProject = (key, data) => {
  if (typeof window === 'undefined') return;
  if (!data) return;
  localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
};

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);
  const navigate = useNavigate();
  const cacheKey = `project-cache-${id}`;

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    setIsPurchased(hasPurchasedProject(id));
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    const cached = getCachedProject(cacheKey);
    if (cached) {
      setProject(cached);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getProjectById(id);
      setProject(data);
      setCachedProject(cacheKey, data);
    } catch (err) {
      setMessage('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const result = await api.upvoteProject(id);
      setProject(prev => {
        const updated = { ...result.project, structure: prev?.structure };
        setCachedProject(cacheKey, updated);
        return updated;
      });
      setMessage('✓ Upvoted!');
    } catch (err) {
      setMessage('Failed to upvote');
    }
  };

  const handleBuy = () => {
    purchaseProject(id);
    setIsPurchased(true);
    setMessage('✓ Repository unlocked for this browser');
  };

  if (loading) return <div className="page-container"><p>Loading project...</p></div>;
  if (!project) return <div className="page-container"><p>Project not found</p></div>;

  const priceNum = parseFloat(project.price);
  const price = isNaN(priceNum) ? 0 : priceNum;
  const upvotes = project.upvotes || 0;
  const demoLink = project.demo_link || '';

  return (
    <div className="page-container">
      <button onClick={() => navigate('/')} className="btn-back">← Back to Projects</button>

      <div className="project-details">
        <div className="details-header">
          <h1>{project.title}</h1>
          <span className="upvote-badge">⬆️ {upvotes} upvotes</span>
        </div>

        <p className="details-description">{project.description}</p>

        <div className="details-meta">
          <div className="meta-item">
            <strong>Tech Stack:</strong> {project.tech_stack}
          </div>
          <div className="meta-item">
            <strong>Price:</strong> ${price.toFixed(2)}
          </div>
          <div className="meta-item">
            <strong>Live Demo:</strong>
            {demoLink ? (
              <a href={demoLink} target="_blank" rel="noopener noreferrer" className="github-link">
                Open Demo
              </a>
            ) : (
              'No demo link provided'
            )}
          </div>
        </div>

        <div className="details-actions">
          <button onClick={handleUpvote} className="btn-upvote">👍 Upvote ({upvotes})</button>
          <button onClick={handleBuy} className="btn-buy">
            {isPurchased ? 'Repository Unlocked' : '💳 Buy to Unlock Repo'}
          </button>
        </div>

        <div className="repository-panel">
          <h3>Source Repository</h3>
          {isPurchased ? (
            <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="github-repo-link">
              Open GitHub Repository →
            </a>
          ) : (
            <p className="locked-link">
              The GitHub repository stays hidden until you buy this project.
            </p>
          )}
        </div>

        {project.structure && (
          <div className="folder-structure">
            <FolderTree structure={project.structure} />
          </div>
        )}
      </div>

      {message && <div className="info-message">{message}</div>}
    </div>
  );
}
