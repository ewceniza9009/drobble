import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { loginUser } from '../store/authSlice';
import { mergeCart } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import { FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      await dispatch(mergeCart()).unwrap();
      navigate('/');
    } catch (error) {
      toast.error("Invalid username or password.");
      console.error('Failed to login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-slate-400 transition-colors flex items-center justify-center space-x-2"
          >
            <FaSignInAlt />
            <span>{status === 'loading' ? 'Logging in...' : 'Login'}</span>
        </button>
      </form>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
        Don't have an account? <Link to="/register" className="font-semibold text-green-600 dark:text-green-400 hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;