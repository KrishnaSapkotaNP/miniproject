import React from 'react';
import { ThumbsUp, CreditCard, ExternalLink, ArrowUp } from 'lucide-react';
import '../styles/cards.css';

const getPurchasedProjectIds = (userId) => {
  if (!userId) return [];

  try {
    const stored = JSON.parse(localStorage.getItem(`purchasedProjects:${userId}`) || '[]');
    return Array.isArray(stored) ? stored.map(String) : [];
  } catch {
    return [];
  }
};

export default function ProjectCard({ project, onUpvote, showActions }) {
  if (!project) {
    return <div className="project-card">Project data not available</div>;
  }

  const title = project.title || 'Untitled';
  const description = project.description || 'No description';
  const tech_stack = project.tech_stack || 'N/A';
  const priceNum = parseFloat(project.price);
  const price = isNaN(priceNum) ? 0 : priceNum;
  const upvotes = project.upvotes || 0;
  const github_link = project.github_link || '#';
  const savedUser = localStorage.getItem('user');
  let canViewGithub = false;

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      canViewGithub = getPurchasedProjectIds(user.id).includes(String(project.id));
    } catch {
      canViewGithub = false;
    }
  }

  return (
    <div className="project-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="upvote-badge">
          <ArrowUp size={14} style={{ marginRight: '2px' }} />
          {upvotes}
        </span>
      </div>

      <p className="card-description">{description}</p>

      <div className="card-meta">
        <span className="tech-stack">
          <strong>Tech:</strong> {tech_stack}
        </span>
        <span className="price">
          <strong>${price.toFixed(2)}</strong>
        </span>
      </div>

      <div className="card-link">
        {canViewGithub ? (
          <a href={github_link} target="_blank" rel="noopener noreferrer" className="github-link">
            View on GitHub
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="github-link" style={{ opacity: 0.75 }}>
            Buy to unlock GitHub
          </span>
        )}
      </div>
      <div className="card-link">
        <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="github-link">
          View live Demo
          <ExternalLink size={14} />
        </a>
      </div>

      {showActions && (
        <div className="card-actions">
          <button onClick={(e) => onUpvote(project.id, e)} className="btn-upvote">
            <ThumbsUp size={16} />
            Upvote
          </button>
          <button className="btn-buy">
            <CreditCard size={16} />
            Buy
          </button>
        </div>
      )}
    </div>
  );
}
