import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../api/apis';

const ITEMS_PER_PAGE = 5;

const PaymentVerify = () => {
  const { isAuthenticated } = useAuthContext();

  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({});

  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [verifiedPage, setVerifiedPage] = useState(1);

  // Search & Date filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const verifyPayment = async (paymentId, userId) => {
    setVerificationStatus(prev => ({ ...prev, [paymentId]: 'verifying' }));
    try {
      const response = await api.post('/api/payment/verify', { userId, paymentId });

      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, [paymentId]: 'verified' }));
        await fetchPayments();
      } else {
        setVerificationStatus(prev => ({ ...prev, [paymentId]: 'error' }));
      }
    } catch {
      setVerificationStatus(prev => ({ ...prev, [paymentId]: 'error' }));
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPayments();
    else setLoading(false);
  }, [isAuthenticated]);

  // Filtered data
  const pendingPayments = paymentsData.filter(
    (p) => p.paymentStatus?.toLowerCase() === 'pending'
  );

  const verifiedPayments = paymentsData
    .filter((p) => p.paymentStatus?.toLowerCase() === 'verified')
    .filter((p) =>
      p.userId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) => {
      if (!startDate && !endDate) return true;
      const paymentDate = new Date(p.paymentDate).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Date.now();
      return paymentDate >= start && paymentDate <= end;
    });

  // Pagination
  const paginate = (items, currentPage) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const renderPagination = (totalItems, currentPage, setPage) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  const renderTable = (title, data, isPending = false) => (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm md:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User ID</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Method</th>
              <th className="border p-2">Number</th>
              <th className="border p-2">Screenshot</th>
              {isPending && <th className="border p-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(payment => (
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
                      alt="proof"
                      className="h-20 object-contain mx-auto"
                    />
                  ) : 'No image'}
                </td>
                {isPending && (
                  <td className="border p-2">
                    <button
                      onClick={() => verifyPayment(payment._id, payment.userId)}
                      disabled={verificationStatus[payment._id] === 'verifying'}
                      className={`px-3 py-1 rounded text-white w-full text-sm ${
                        verificationStatus[payment._id] === 'verified'
                          ? 'bg-green-500'
                          : verificationStatus[payment._id] === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {verificationStatus[payment._id] === 'verifying'
                        ? 'Verifying...'
                        : verificationStatus[payment._id] === 'verified'
                        ? 'Verified'
                        : 'Verify'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div className="p-4">Loading payment data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">🧾 Payment Verification Panel</h1>

      {/* 🟡 Pending Section */}
      {renderTable('🔴 Pending Verifications', paginate(pendingPayments, pendingPage), true)}
      {renderPagination(pendingPayments.length, pendingPage, setPendingPage)}

      {/* 🔍 Filters for Verified */}
      <div className="bg-white rounded p-4 shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by User ID"
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* ✅ Verified Section */}
      {renderTable('✅ Verified Payments', paginate(verifiedPayments, verifiedPage), false)}
      {renderPagination(verifiedPayments.length, verifiedPage, setVerifiedPage)}
    </div>
  );
};

export default PaymentVerify;
