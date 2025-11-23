import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../api/apis';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Smartphone,
  Image as ImageIcon,
  Filter
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const PaymentVerify = () => {
  const { isAuthenticated } = useAuthContext();
  const [activeTab, setActiveTab] = useState('pending');
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

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
    if (!window.confirm('Are you sure you want to verify this payment?')) return;

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

  const paginate = (items, currentPage) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const renderPagination = (totalItems, currentPage, setPage) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex gap-2 justify-center mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Verification</h1>
        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            Pending ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'verified'
                ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            Verified ({verifiedPayments.length})
          </button>
        </div>
      </div>

      {/* Filters for Verified Tab */}
      {activeTab === 'verified' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proof</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                {activeTab === 'pending' && (
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(activeTab === 'pending' ? paginate(pendingPayments, pendingPage) : paginate(verifiedPayments, verifiedPage)).map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {payment.userId}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <DollarSign className="w-3 h-3" />
                      {payment.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{payment.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        {payment.userPaymentNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.screenshot ? (
                      <button
                        onClick={() => setSelectedImage(payment.screenshot)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Proof
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No proof</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  {activeTab === 'pending' && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => verifyPayment(payment._id, payment.userId)}
                        disabled={verificationStatus[payment._id] === 'verifying'}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${verificationStatus[payment._id] === 'verified'
                            ? 'bg-green-500 cursor-default'
                            : verificationStatus[payment._id] === 'error'
                              ? 'bg-red-500'
                              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                          }`}
                      >
                        {verificationStatus[payment._id] === 'verifying' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : verificationStatus[payment._id] === 'verified' ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Verified
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Verify
                          </>
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(activeTab === 'pending' ? pendingPayments : verifiedPayments).length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 6 : 5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">No payments found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination(
        activeTab === 'pending' ? pendingPayments.length : verifiedPayments.length,
        activeTab === 'pending' ? pendingPage : verifiedPage,
        activeTab === 'pending' ? setPendingPage : setVerifiedPage
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Payment Proof"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
