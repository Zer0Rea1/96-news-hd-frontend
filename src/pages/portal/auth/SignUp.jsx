import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/apis';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

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

  const onPrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    const completeData = { ...formData, ...data };

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

  const InputField = ({ label, id, type = "text", icon: Icon, register, validation, error, placeholder }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          id={id}
          {...register(id, validation)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 py-12">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-6 shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {step === 1 ? 'Step 1 of 2: Account Details' : 'Step 2 of 2: Personal Information'}
          </p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.includes('success') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(step === 1 ? onNextStep : onSubmit)} className="space-y-5">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <InputField
                label="Username"
                id="username"
                icon={User}
                placeholder="Choose a username"
                register={register}
                validation={{ required: 'Username is required' }}
                error={errors.username}
              />
              <InputField
                label="Email Address"
                id="email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                register={register}
                validation={{ required: 'Email is required' }}
                error={errors.email}
              />
              <InputField
                label="Password"
                id="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                register={register}
                validation={{ required: 'Password is required' }}
                error={errors.password}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  id="firstName"
                  icon={User}
                  placeholder="John"
                  register={register}
                  validation={{ required: 'First name is required' }}
                  error={errors.firstName}
                />
                <InputField
                  label="Last Name"
                  id="lastName"
                  icon={User}
                  placeholder="Doe"
                  register={register}
                  validation={{ required: 'Last name is required' }}
                  error={errors.lastName}
                />
              </div>

              <InputField
                label="Phone Number"
                id="phoneNumber"
                type="tel"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                register={register}
                validation={{ required: 'Phone number is required' }}
                error={errors.phoneNumber}
              />

              <InputField
                label="Date of Birth"
                id="dateOfBirth"
                type="date"
                icon={Calendar}
                register={register}
                validation={{ required: 'Date of birth is required' }}
                error={errors.dateOfBirth}
              />

              <InputField
                label="Designation City"
                id="city"
                icon={MapPin}
                placeholder="City or Area for Blogs"
                register={register}
                validation={{ required: 'City is required' }}
                error={errors.city}
              />
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={onPrevStep}
                className="flex-1 flex justify-center items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3.5 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] flex justify-center items-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}

              {step === 1 ? (
                <>Next Step <ArrowRight className="w-5 h-5" /></>
              ) : (
                isLoading ? 'Signing Up...' : 'Complete Sign Up'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;