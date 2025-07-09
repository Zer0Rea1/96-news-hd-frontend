import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../api/apis';

const PaymentVerify = () => {
    const [paymentsData, setPaymentsData] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuthContext();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/api/payment/get');
                setPaymentsData(response.data || []); // Ensure it's always an array
            } catch (err) {
                setError('Failed to load payment requests');
                console.error('Payments request fetch error:', err);
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

    if (loading) {
        return <div>Loading payment data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

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
                        </tr>
                    </thead>
                    <tbody>
                        {paymentsData.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
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
                                <td><button>verify</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PaymentVerify;