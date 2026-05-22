import React from 'react';
import '../styles/cards.css';
import { hasPurchasedProject, purchaseProject } from '../utils/purchases';

export default function ProjectCard({ project, onUpvote, onBuy, showActions }) {
  if (!project) {
    return <div className="project-card">Project data not available</div>;
  }

  const title = project.title || 'Untitled';
  const description = project.description || 'No description';
  const tech_stack = project.tech_stack || 'N/A';
  const priceNum = parseFloat(project.price);
  const price = isNaN(priceNum) ? 0 : priceNum;
  const upvotes = project.upvotes || 0;
  const demo_link = project.demo_link || '#';
  const purchased = hasPurchasedProject(project.id);

  const handleBuy = () => {
    purchaseProject(project.id);
    if (onBuy) {
      onBuy(project.id);
    }
  };

  return (
    <div className="project-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="upvote-badge">⬆️ {upvotes}</span>
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
        {demo_link !== '#' && (
          <a href={demo_link} target="_blank" rel="noopener noreferrer" className="github-link">
            Live Demo →
          </a>
        )}
        {purchased ? (
          <div className="locked-link unlocked">Repository unlocked</div>
        ) : (
          <div className="locked-link">Repo locked until purchase</div>
        )}
      </div>

      {showActions && (
        <div className="card-actions">
          <button onClick={(e) => onUpvote(project.id, e)} className="btn-upvote">
            👍 Upvote
          </button>
          <button onClick={handleBuy} className="btn-buy">
            {purchased ? 'Unlocked' : '💳 Buy to Unlock'}
          </button>
        </div>
      )}
    </div>
  );
}
