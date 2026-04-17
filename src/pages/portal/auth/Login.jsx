import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/apis';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/api/auth/login', {
                email: data.email,
                password: data.password
            });

            if (response.status === 200 || response.status === 201) {
                setIsAuthenticated(true);
                navigate('/portal/dashboard');
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage(
                err.response?.data?.message ||
                'Invalid credentials or server error'
            );
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-6 shadow-inner">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your portal account</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.includes('failed') || message.includes('Invalid') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;