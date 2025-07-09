import React, { useState, useEffect,useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/apis';
// import { authActions } from '../../../store/auth'; // Make sure to import authActions
import {AuthContext} from '../../../context/AuthContext.jsx';
const Login = () => {
    // const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    // const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated,setIsAuthenticated } = useContext(AuthContext);
    // console.log(isAuthenticated);
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         navigate('/portal'); // Redirect to portal if already logged in
    //     }
    // }, [isAuthenticated, navigate]);

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
                navigate('/portal');
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
        <div className="ltr text-left p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {message && (
                <p className={`mb-4 ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"  // Fixed: Changed from 'password' to 'email'
                        {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
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
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="mt-4 text-center">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-blue-500 hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
};

export default Login;