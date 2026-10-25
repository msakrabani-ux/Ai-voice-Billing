import React, { useEffect } from 'react';
import { MdDelete, MdAdd, MdRemove, MdPrint, MdPictureAsPdf, MdCheckCircle, MdPointOfSale } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { jsPDF } from 'jspdf';

const ManualBilling = () => {
  const { 
    products, setProducts, 
    cart, addToCart, updateCartItemQty, removeFromCart, clearCart, getTotals
  } = useStore();
  
  useEffect(() => {
    if (products.length === 0) {
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => { if(data.data) setProducts(data.data); })
        .catch(err => console.error(err));
    }
  }, [products, setProducts]);

  const handleManualAdd = (e) => {
    const productId = parseInt(e.target.value);
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: 1
      });
    }
    e.target.value = ""; 
  };

  const handleQuickAdd = (product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    });
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const { netAmount, gstAmount, totalAmount } = getTotals();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("MS SAKRA", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text("Manual Billing Invoice", 105, 28, null, null, "center");
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
    doc.line(20, 45, 190, 45);
    doc.text("Item", 20, 52); doc.text("Qty", 100, 52); doc.text("Price", 130, 52); doc.text("Total", 170, 52);
    doc.line(20, 55, 190, 55);
    let y = 62;
    cart.forEach(item => {
      doc.setFont("helvetica", "normal");
      doc.text(item.name, 20, y); doc.text(item.qty.toString(), 100, y);
      doc.text(item.price.toFixed(2), 130, y); doc.text(item.total.toFixed(2), 170, y);
      y += 8;
    });
    doc.line(20, y, 190, y); y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: ${netAmount.toFixed(2)}`, 130, y); y += 8;
    doc.text(`GST (5%): ${gstAmount.toFixed(2)}`, 130, y); y += 8;
    doc.text(`Total: ${totalAmount.toFixed(2)}`, 130, y);
    doc.save("invoice.pdf");
  };

  const handleSaveInvoice = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    const { totalAmount, gstAmount, netAmount } = getTotals();
    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount, gstAmount, netAmount, paymentMode: 'CASH', items: cart })
      });
      if (res.ok) {
        alert("Invoice Saved Successfully!");
        clearCart();
      } else {
        alert("Error saving invoice");
      }
    } catch (err) {
      alert("Network error. Saved to offline queue (mock).");
      clearCart();
    }
  };

  const { netAmount, gstAmount, totalAmount } = getTotals();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 neon-text-purple">Search & Add</h3>
          <select 
            onChange={handleManualAdd}
            defaultValue=""
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#bd00ff] text-white appearance-none"
          >
            <option value="" disabled>Select a product to add...</option>
            {products.map(p => (
              <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                {p.name} - ₹{p.price}
              </option>
            ))}
          </select>
        </div>
        
        <div className="glass-card p-6 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Quick Add Catalog</h3>
            <div className="grid grid-cols-2 gap-3">
                {products.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => handleQuickAdd(p)}
                        className="p-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(189,0,255,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl flex flex-col items-center justify-center transition-colors"
                    >
                        <span className="font-medium text-center">{p.name}</span>
                        <span className="text-[#bd00ff] text-sm mt-1">₹{p.price}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center bg-[rgba(25,26,35,0.8)]">
            <h2 className="text-xl font-semibold">Current Bill</h2>
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300">Clear All</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence>
              {cart.map(item => (
                <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-between items-center p-3 mb-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-400">₹{item.price.toFixed(2)} / unit</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 mx-4">
                    <button onClick={() => item.qty > 1 ? updateCartItemQty(item.productId, item.qty - 1) : removeFromCart(item.productId)} className="p-1 rounded bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"><MdRemove size={16} /></button>
                    <span className="w-8 text-center font-medium">{item.qty}</span>
                    <button onClick={() => updateCartItemQty(item.productId, item.qty + 1)} className="p-1 rounded bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"><MdAdd size={16} /></button>
                  </div>

                  <div className="w-24 text-right font-medium">₹{item.total.toFixed(2)}</div>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-4 p-2 text-red-400 hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"><MdDelete size={20} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                <MdPointOfSale size={64} className="mb-4 opacity-20" />
                <p>No items added yet.</p>
                <p className="text-sm">Use search or quick add to start billing.</p>
              </div>
            )}
          </div>

          <div className="bg-[rgba(0,0,0,0.4)] p-6 border-t border-[rgba(255,255,255,0.1)]">
            <div className="flex justify-between mb-2 text-gray-300"><span>Subtotal</span><span>₹{netAmount.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-300"><span>GST (5%)</span><span>₹{gstAmount.toFixed(2)}</span></div>
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-[rgba(255,255,255,0.1)]"><span className="text-xl font-bold">Total Amount</span><span className="text-3xl font-bold neon-text-purple">₹{totalAmount.toFixed(2)}</span></div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => window.print()} className="flex items-center justify-center space-x-2 py-3 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"><MdPrint size={20} /><span>Print</span></button>
              <button onClick={generatePDF} className="flex items-center justify-center space-x-2 py-3 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"><MdPictureAsPdf size={20} /><span>PDF</span></button>
              <button onClick={handleSaveInvoice} className="flex items-center justify-center space-x-2 py-3 rounded-lg btn-neon-purple font-bold shadow-lg"><MdCheckCircle size={20} /><span>Save Invoice</span></button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .glass-card { visibility: hidden; } }`}</style>
    </div>
  );
};

export default ManualBilling;
