import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { registerUser } from '../store/authSlice';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err || 'An unknown error occurred.');
      console.error('Failed to register:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Create an Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-slate-100 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-100 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-100 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          {status === 'loading' ? 'Registering...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-6">
        Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;