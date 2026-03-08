import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (!formData.email && !formData.phone) {
      setError('Email or phone is required');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.phone, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              EasyXpense
            </h1>
            <p className="text-sm text-text-muted">
              Welcome back! Please login to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />

            <div className="text-center text-sm text-text-muted">
              OR
            </div>

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 1234567890"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-accent disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-accent font-medium transition-colors duration-200">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
