import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ThumbsUp, CreditCard, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import FolderTree from '../components/FolderTree';
import '../styles/dashboard.css';

const getPurchasedProjectIds = (userId) => {
  if (!userId) return [];

  try {
    const stored = JSON.parse(localStorage.getItem(`purchasedProjects:${userId}`) || '[]');
    return Array.isArray(stored) ? stored.map(String) : [];
  } catch {
    return [];
  }
};

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    try {
      const user = JSON.parse(savedUser);
      const purchasedIds = getPurchasedProjectIds(user.id);
      setIsPurchased(purchasedIds.includes(String(id)));
    } catch {
      setIsPurchased(false);
    }
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProjectById(id);
      if (data?.error) {
        setMessage(data.error);
        setProject(null);
        return;
      }
      setProject(data);
    } catch (err) {
      setMessage('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const result = await api.upvoteProject(id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setProject(result.project);
      setMessage('✓ Upvoted!');
    } catch (err) {
      setMessage('Failed to upvote');
    }
  };

  const handleBuyNow = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setMessage('Please login to continue');
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      const key = `purchasedProjects:${user.id}`;
      const purchasedIds = getPurchasedProjectIds(user.id);

      if (!purchasedIds.includes(String(id))) {
        purchasedIds.push(String(id));
        localStorage.setItem(key, JSON.stringify(purchasedIds));
      }

      setIsPurchased(true);
      setMessage('✓ Purchase unlocked GitHub access');
    } catch {
      setMessage('Failed to unlock project');
    }
  };

  if (loading) return <div className="page-container"><p>Loading project...</p></div>;
  if (!project) return <div className="page-container"><p>{message || 'Project not found'}</p></div>;

  const priceNum = parseFloat(project.price);
  const price = isNaN(priceNum) ? 0 : priceNum;
  const upvotes = project.upvotes || 0;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/')} className="btn-back">
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      <div className="project-details">
        <div className="details-header">
          <h1>{project.title}</h1>
          <span className="upvote-badge">
            <ArrowUp size={14} style={{ marginRight: '2px' }} />
            {upvotes} upvotes
          </span>
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
            <strong>GitHub:</strong>
            {isPurchased ? (
              <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="github-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                View Repository
                <ExternalLink size={14} />
              </a>
            ) : (
              <span style={{ display: 'block', marginTop: '4px', opacity: 0.75 }}>
                Buy to unlock GitHub access
              </span>
            )}
          </div> 
          <div className="meta-item">
  <strong>Live Demo:</strong>

  <a
    href={isPurchased ? project.demo_link : "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="github-link"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '4px',
      pointerEvents: isPurchased ? 'auto' : 'none',
      opacity: isPurchased ? 1 : 0.5
    }}
  >
    View Live Demo
    <ExternalLink size={14} />
  </a>
</div>

        </div>

        <div className="details-actions">
          <button onClick={handleUpvote} className="btn-upvote">
            <ThumbsUp size={16} />
            Upvote ({upvotes})
          </button>
          <button className="btn-buy" onClick={handleBuyNow}>
            <CreditCard size={16} />
            {isPurchased ? 'Purchased' : 'Buy Now'}
          </button >
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
