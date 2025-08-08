import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/apis';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const onNextStep = () => {
    const currentValues = getValues();
    setFormData({ ...formData, ...currentValues });
    setStep(2);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    const completeData = { ...formData, ...data };
    // console.log(completeData)

    try {
      const response = await api.post('/api/auth/signup', completeData);

      if (response.status === 201) {
        setMessage('Signup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setMessage(response.data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ltr font-sans p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {message && <p className={`mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      <form onSubmit={handleSubmit(step === 1 ? onNextStep : onSubmit)}>
        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-black">Username</label>
            <input {...register('username', { required: 'Username is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="Username" />
            {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}

            <label className="block text-sm font-medium text-black">Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="Email" />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

            <label className="block text-sm font-medium text-black">Password</label>
            <input type="password" {...register('password', { required: 'Password is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="Password" />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm font-medium text-black">First Name</label>
            <input {...register('firstName', { required: 'First name is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="First Name" />
            {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}

            <label className="block text-sm font-medium text-black">Last Name</label>
            <input {...register('lastName', { required: 'Last name is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="Last Name" />
            {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}

            <label className="block text-sm font-medium text-black">Phone Number</label>
            <input type="tel" {...register('phoneNumber', { required: 'Phone number is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="Phone" />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}

            <label className="block text-sm font-medium text-black">Date of Birth</label>
            <input type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} className="w-full p-2 border rounded-lg mb-4" />
            {errors.dob && <p className="text-red-600 text-sm">{errors.dob.message}</p>}

            <label className="block text-sm font-medium text-black">Designation City</label>
            <input {...register('city', { required: 'City is required' })} className="w-full p-2 border rounded-lg mb-4" placeholder="City or Area for Blogs" />
            {errors.city && <p className="text-red-600 text-sm">{errors.city.message}</p>}
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Signing Up...' : step === 1 ? 'Next' : 'Sign Up'}
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