import React, {
  useState,
  useEffect,
  useContext
} from 'react';

import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

import { AuthContext } from '../contexts/AuthContext';

import '../styles/forms.css';

export default function Login() {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const navigate = useNavigate();

  const { setUser } =
    useContext(AuthContext);

  useEffect(() => {

    if (localStorage.getItem('token')) {
      navigate('/');
    }

  }, [navigate]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setError('');
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    try {

      const result = await api.login(
        formData.email,
        formData.password
      );

      console.log(
        'LOGIN RESULT:',
        result
      );

      if (result.error) {

        setError(result.error);

      } else {

        // Save token
        localStorage.setItem(
          'token',
          result.token
        );

        // Save user
        localStorage.setItem(
          'user',
          JSON.stringify(result.user)
        );

        // Update auth context
        setUser(result.user);

        // Redirect
        navigate('/');
      }

    } catch (err) {

      console.error(
        'LOGIN ERROR:',
        err
      );

      setError(
        'Login failed. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="page-container">

      <div className="form-wrapper">

        <h1>
          Login to Project Marketplace
        </h1>

        <p className="demo-note">
          Demo: admin@admin.com / admin123
        </p>

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}

        <form
          className="form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

        </form>

        <p className="form-footer">

          Don't have an account?{' '}

          <a href="/register">
            Register here
          </a>

        </p>

      </div>

    </div>
  );
}