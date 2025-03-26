import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/apis';

const SignUp = () => {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/'); // Redirect if already logged in
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true); // Start loading
    setMessage(null); // Clear previous messages

    try {
      const response = await api.post('/api/auth/signup', data);

      if (response.status === 201) {
        setMessage('Signup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login'); // Redirect to login page after 2 seconds
        }, 2000);
      } else {
        setMessage(response.data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      // console.error('Signup failed:', err);
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="ltr font-sans p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {message && <p className={`mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username" className="block text-sm font-medium text-black">Username</label>
        <input
          id="username"
          type="text"
          {...register('username', { required: 'Username is required' })}
          name="username"
          placeholder="User Name"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}

        <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
        <input
          type="email"
          id="email"
          {...register('email', { required: 'Email is required' })}
          name="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}

        <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          {...register('password', { required: 'Password is required' })}
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isLoading} // Disable button while loading
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-500 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;