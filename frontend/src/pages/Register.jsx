import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      await register(
        name,
        isEmail ? identifier : null,
        isEmail ? null : identifier,
        password
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            EasyXpense
          </h1>
          <p className="text-textSecondary dark:text-textSecondary-dark">Create your account</p>
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl shadow-lg border border-primary/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or phone number"
                required
                className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-textSecondary dark:text-textSecondary-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;