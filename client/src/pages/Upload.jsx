import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import UploadForm from '../components/UploadForm';
import '../styles/dashboard.css';

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    } else {
      const userData = JSON.parse(user);
      if (userData.role !== 'creator') {
        setMessage('Only creators can upload projects. Request creator access first.');
        setIsCreator(false);
      } else {
        setIsCreator(true);
      }
    }
  }, [navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setMessage('');

    try {
      const result = await api.uploadProject(
        formData.title,
        formData.github_link,
        formData.demo_link,
        formData.description,
        formData.tech_stack,
        parseFloat(formData.price)
      );

      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage('✓ Project uploaded successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setMessage('Failed to upload project');
    } finally {
      setLoading(false);
    }
  };

  if (!isCreator) {
    return (
      <div className="page-container">
        <div className="message-box">
          <h2>Creator Access Required</h2>
          <p>{message}</p>
          <a href="/request-creator" className="btn-primary">Request Creator Access</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📤 Upload Your Project</h1>
        <p>Share your GitHub project with the community</p>
      </div>

      {message && (
        <div className={message.includes('✓') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <div className="form-wrapper">
        <UploadForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
