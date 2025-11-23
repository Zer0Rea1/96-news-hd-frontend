import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';
import api from '../../api/apis';
import { CreditCard, Phone, Upload, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

const Membership = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();
  const { fetchProfileData } = useProfileContext();

  const paymentAccounts = {
    jazzcash: '03015507933'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1 && !paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (step === 2 && !phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!proofImage) {
      setError('Please upload payment proof');
      return;
    }

    setLoading(true);
    setError('');
    const amount = 500
    try {
      const response = await api.post('/api/payment', {
        paymentMethod,
        phoneNumber,
        proofImage,
        amount
      });

      if (response.status === 201) {
        setIsSubmitted(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Payment Submitted!</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Your payment application has been submitted. Please wait 2-3 hours for us to review your submission.
          </p>
          <button
            onClick={() => navigate('/portal/dashboard')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Premium Membership</h1>
        <p className="text-gray-500 dark:text-gray-400">Unlock exclusive features and content.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-600 -z-10 rounded-full"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>

            {/* Steps */}
            {[
              { num: 1, icon: CreditCard, label: 'Payment' },
              { num: 2, icon: Phone, label: 'Details' },
              { num: 3, icon: Upload, label: 'Proof' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.num
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'
                  }`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Step 1: Payment Method */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['jazzcash', 'easypaisa'].map((method) => (
                  <div
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === method
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                      {paymentMethod === method && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                    </div>
                    <span className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">{method}</span>
                  </div>
                ))}
              </div>

              {paymentMethod && (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Send <span className="font-bold text-gray-900 dark:text-white">Rs. 500</span> to:</p>
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-wider">
                      {paymentAccounts[paymentMethod]}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentAccounts[paymentMethod]);
                        // toast.success('Copied!'); // Assuming toast is available
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sender Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="03XX XXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="mt-2 text-sm text-gray-500">Enter the number from which you sent the payment.</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Summary</h3>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium capitalize">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">Rs. 500</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Proof */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Proof</h2>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                {proofImage ? (
                  <div className="relative inline-block">
                    <img src={proofImage} alt="Proof" className="max-h-64 rounded-lg shadow-md" />
                    <button
                      onClick={() => setProofImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Click to upload screenshot</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Payment'}
                {!loading && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;