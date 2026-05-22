import React from 'react';
import { ThumbsUp } from 'lucide-react';
import '../styles/cards.css';

export default function UpvoteButton({ projectId, upvotes, onUpvote, disabled }) {
  return (
    <button
      onClick={() => onUpvote(projectId)}
      className="btn-upvote"
      disabled={disabled}
    >
      <ThumbsUp size={16} />
      Upvote ({upvotes})
    </button>
  );
}
