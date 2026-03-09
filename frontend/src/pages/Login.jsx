import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, '', formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent mb-4">
              EasyXpense
            </h1>
            <p className="text-xl text-[#94A3B8] leading-relaxed">
              Split expenses with friends effortlessly.
            </p>
          </div>
          <div className="space-y-6 text-[#94A3B8]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-[#E2E8F0] font-semibold mb-1">Track Expenses</h3>
                <p className="text-sm">Keep track of shared expenses with friends and groups</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-[#E2E8F0] font-semibold mb-1">Settle Debts</h3>
                <p className="text-sm">See who owes what and settle up easily</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h3 className="text-[#E2E8F0] font-semibold mb-1">Payment History</h3>
                <p className="text-sm">Keep track of all payments and settlements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#0F172A] rounded-xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#E2E8F0] mb-2">Welcome back</h2>
              <p className="text-[#94A3B8]">Login to continue to EasyXpense</p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full h-11 pl-12 pr-4 bg-[#020617] border border-slate-700 rounded-lg text-[#E2E8F0] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-12 pr-4 bg-[#020617] border border-slate-700 rounded-lg text-[#E2E8F0] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#10B981] hover:bg-[#34D399] disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Logging in...' : (
                  <>
                    Login
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-[#94A3B8]">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#10B981] hover:text-[#34D399] font-medium transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
