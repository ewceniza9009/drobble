// ---- File: src/pages/LoginPage.tsx ----
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { loginUser } from '../store/authSlice';
import { mergeCart } from '../store/cartSlice'; // Import mergeCart
import { toast } from 'react-hot-toast';

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
      // After successful login, dispatch mergeCart
      await dispatch(mergeCart()).unwrap();
      navigate('/'); 
    } catch (error) {
      toast.error("Invalid username or password.");
      console.error('Failed to login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4">
        Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;