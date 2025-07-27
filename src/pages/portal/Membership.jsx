import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';
import api from '../../api/apis';

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
    jazzcash: '+92 301 1234567',
    easypaisa: '+92 302 7654321'
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
        // await fetchProfileData(); // Refresh profile data
        // navigate('/portal/login');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-500 text-2xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4">Payment Submitted Successfully</h2>
          <p className="mb-6">
            Your payment application has been submitted. Please wait 2-3 hours for us to review your submission.
          </p>
          <p className="text-gray-500 text-sm">
            You will be automatically redirected to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Membership Payment</h1>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <p className="mt-2">Select Payment</p>
          </div>
          <div className={`text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            <p className="mt-2">Your Details</p>
          </div>
          <div className={`text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
            <p className="mt-2">Proof Upload</p>
          </div>
        </div>
        <div className="relative mt-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${(step - 1) * 50}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Payment Method Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-all ${paymentMethod === 'jazzcash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onClick={() => setPaymentMethod('jazzcash')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'jazzcash' && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">JazzCash</span>
              </div>
            </div>
            
            <div 
              className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-all ${paymentMethod === 'easypaisa' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onClick={() => setPaymentMethod('easypaisa')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'easypaisa' && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">EasyPaisa</span>
              </div>
            </div>
          </div>

          {paymentMethod && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Send Rs. 500 to this account:</h3>
              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <span className="font-mono">{paymentAccounts[paymentMethod]}</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentAccounts[paymentMethod]);
                    alert('Number copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Customer Details */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Your Payment Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Phone Number (where you sent the payment from)
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Payment Summary:</h3>
            <ul className="space-y-2">
              <li>Payment Method: <span className="font-medium capitalize">{paymentMethod}</span></li>
              <li>Amount: <span className="font-medium">Rs. 500</span></li>
              <li>To: <span className="font-mono">{paymentAccounts[paymentMethod]}</span></li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 3: Proof Upload */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Upload Payment Proof</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              {proofImage ? (
                <div className="mb-4">
                  <img src={proofImage} alt="Payment Proof" className="max-h-64 mx-auto" />
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              
              <p className="mt-2 text-sm text-gray-500">
                Upload a screenshot of your payment receipt
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="proof-upload"
              />
              
              <label htmlFor="proof-upload" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                {proofImage ? 'Change Image' : 'Upload Image'}
              </label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Payment Summary:</h3>
            <ul className="space-y-2">
              <li>Payment Method: <span className="font-medium capitalize">{paymentMethod}</span></li>
              <li>From Phone Number: <span className="font-mono">{phoneNumber}</span></li>
              <li>Amount: <span className="font-medium">Rs. 500</span></li>
              <li>To: <span className="font-mono">{paymentAccounts[paymentMethod]}</span></li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Membership; 