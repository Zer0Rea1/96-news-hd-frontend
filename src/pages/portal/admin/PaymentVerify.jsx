import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../api/apis';

const PaymentVerify = () => {
    const [paymentsData, setPaymentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState({});
    const { isAuthenticated } = useAuthContext();

    

    const verifyPayment = async (paymentId,userId) => {
        try {
            setVerificationStatus(prev => ({ ...prev, [userId]: 'verifying' }));
            
            const response = await api.post('/api/payment/verify', { userId: userId, paymentId: paymentId }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setVerificationStatus(prev => ({ ...prev, [userId]: 'verified' }));
                // Refresh the payments list
                await fetchPayments();
                return true;
            } else {
                setVerificationStatus(prev => ({ ...prev, [userId]: 'error' }));
                console.error("Verification failed:", response.data.message);
                return false;
            }
        } catch (error) {
            setVerificationStatus(prev => ({ ...prev, [userId]: 'error' }));
            console.error("Verification error:", error.response?.data || error.message);
            return false;
        }
    };

    useEffect(() => {
        const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/payment/get');
            setPaymentsData(response.data.payments || []);
        } catch (err) {
            setError('Failed to load payment requests');
            console.error('Payment request fetch error:', err);
        } finally {
            setLoading(false);
        }
    };
        if (isAuthenticated) {
            fetchPayments();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    if (loading) return <div>Loading payment data...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Payment Verification</h1>
            
            {paymentsData.length === 0 ? (
                <p>No payment records found</p>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">User ID</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Payment Date</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Method</th>
                            <th className="border p-2">Payment No</th>
                            <th className="border p-2">Screenshot</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentsData.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50">
                                <td className="border p-2">{payment.userId}</td>
                                <td className="border p-2">{payment.amount}</td>
                                
                                <td className="border p-2">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                </td>
                                <td className="border p-2">{payment.paymentStatus}</td>
                                <td className="border p-2">{payment.paymentMethod}</td>
                                <td className="border p-2">{payment.userPaymentNo}</td>
                                <td className="border p-2">
                                    {payment.screenshot ? (
                                        <img 
                                            src={payment.screenshot} 
                                            alt="Payment proof" 
                                            className="h-20 object-contain"
                                        />
                                    ) : (
                                        'No image'
                                    )}
                                </td>
                                <td className="border p-2">
                                    <button
                                        onClick={() => verifyPayment(payment._id,payment.userId)}
                                        disabled={verificationStatus[payment.userId] === 'verifying'}
                                        className={`px-3 py-1 rounded text-white ${
                                            verificationStatus[payment.userId] === 'verified' 
                                                ? 'bg-green-500' 
                                                : verificationStatus[payment.userId] === 'error' 
                                                    ? 'bg-red-500' 
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                    >
                                        {verificationStatus[payment.userId] === 'verifying' 
                                            ? 'Verifying...' 
                                            : verificationStatus[payment.userId] === 'verified' 
                                                ? 'Verified' 
                                                : 'Verify'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PaymentVerify;