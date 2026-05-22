import React, { useState } from 'react';
import '../styles/forms.css';

export default function UploadForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    github_link: '',
    demo_link: '',
    description: '',
    tech_stack: '',
    price: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.github_link || !formData.demo_link || !formData.description || !formData.tech_stack || !formData.price) {
      setError('All fields are required, including a demo or Vercel link');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Project Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter project title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="github_link">GitHub Link *</label>
        <input
          id="github_link"
          type="url"
          name="github_link"
          value={formData.github_link}
          onChange={handleChange}
          placeholder="https://github.com/username/repo"
        />
      </div>

      <div className="form-group">
        <label htmlFor="demo_link">Demo / Vercel Link *</label>
        <input
          id="demo_link"
          type="url"
          name="demo_link"
          value={formData.demo_link}
          onChange={handleChange}
          placeholder="https://your-project.vercel.app"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tech_stack">Tech Stack *</label>
          <input
            id="tech_stack"
            type="text"
            name="tech_stack"
            value={formData.tech_stack}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="9.99"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Project'}
      </button>
    </form>
  );
}
