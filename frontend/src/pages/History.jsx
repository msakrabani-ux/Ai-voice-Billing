import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdReceipt, MdSearch } from 'react-icons/md';

const History = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/invoices');
      const data = await res.json();
      if (data.data) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="glass-card p-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold neon-text-blue">Invoice History</h1>
            <p className="text-gray-400 mt-1">View all past transactions and bills</p>
          </div>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by invoice number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00f3ff] transition-colors text-white"
            />
            <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-lg border border-[rgba(255,255,255,0.05)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00f3ff]"></div>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[rgba(255,255,255,0.05)] sticky top-0">
                <tr>
                  <th className="p-4 font-medium text-gray-300">Invoice Number</th>
                  <th className="p-4 font-medium text-gray-300">Date & Time</th>
                  <th className="p-4 font-medium text-gray-300">Net Amount</th>
                  <th className="p-4 font-medium text-gray-300">GST Amount</th>
                  <th className="p-4 font-medium text-gray-300">Total Amount</th>
                  <th className="p-4 font-medium text-gray-300">Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={inv.id} 
                    className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="p-4 font-medium text-[#00f3ff] flex items-center space-x-2">
                      <MdReceipt />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-300">₹{inv.netAmount.toFixed(2)}</td>
                    <td className="p-4 text-gray-300">₹{inv.gstAmount.toFixed(2)}</td>
                    <td className="p-4 font-bold">₹{inv.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs bg-[rgba(0,255,0,0.1)] text-green-400">
                        {inv.paymentMode}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <MdReceipt size={64} className="opacity-20" />
              <p>No invoices found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
