// ---- File: src/pages/RegisterPage.tsx ----
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
  const { status, error } = useSelector((state: RootState) => state.auth);

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
    <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="text-center mt-4">
        Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;