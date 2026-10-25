import React, { useState, useEffect, useRef } from 'react';
import { MdMic, MdMicOff, MdDelete, MdAdd, MdRemove, MdPrint, MdPictureAsPdf, MdCheckCircle } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { parseVoiceCommand } from '../utils/nlp';
import { jsPDF } from 'jspdf';

const VoiceBilling = () => {
  const { 
    products, setProducts, 
    cart, addToCart, updateCartItemQty, removeFromCart, clearCart, getTotals,
    isVoiceActive, setVoiceActive, transcript, setTranscript
  } = useStore();
  
  const [lang, setLang] = useState('ta-IN'); 
  const recognitionRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => { if(data.data) setProducts(data.data); })
        .catch(err => console.error(err));
    }
  }, [products, setProducts]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Changed to false for faster finalization
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);
        
        // Fast-path: Instantly detect "save invoice" from interim results
        const lowerText = currentText.toLowerCase();
        if (lowerText.includes("save invoice") || lowerText.includes("save the invoice")) {
           handleVoiceCommand(currentText);
           if (recognitionRef.current) recognitionRef.current.stop();
           return;
        }

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setVoiceActive(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isVoiceActive) {
            try { recognitionRef.current.start(); } catch(e) {}
        }
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceActive, products, lang]); 

  useEffect(() => {
      if(recognitionRef.current) {
          recognitionRef.current.lang = lang;
          if(isVoiceActive) {
              recognitionRef.current.stop();
              setTimeout(() => {
                  try { recognitionRef.current.start(); } catch(e){}
              }, 100);
          }
      }
  }, [lang]);

  const toggleVoice = () => {
    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setVoiceActive(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleVoiceCommand = (text) => {
    setIsProcessing(true);

    if (text.toLowerCase().includes("save invoice") || text.toLowerCase().includes("save the invoice")) {
      handleSaveInvoice();
      setTimeout(() => setTranscript(''), 2000);
      setIsProcessing(false);
      return;
    }

    const parsedItems = parseVoiceCommand(text, products);
    
    if (parsedItems.length > 0) {
      parsedItems.forEach(item => addToCart(item));
      setTimeout(() => setTranscript(''), 2000);
    }
    setIsProcessing(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const { netAmount, gstAmount, totalAmount } = getTotals();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("MS SAKRA", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text("AI Voice Billing Invoice", 105, 28, null, null, "center");
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
    if (isGeneratingRef.current) return;
    
    isGeneratingRef.current = true;
    const { totalAmount, gstAmount, netAmount } = getTotals();
    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount, gstAmount, netAmount, paymentMode: 'CASH', items: cart })
      });
      if (res.ok) {
        alert("Invoice Saved Successfully!");
        generatePDF();
        clearCart();
        setTranscript('');
      } else {
        alert("Error saving invoice");
      }
    } catch (err) {
      alert("Network error. Saved to offline queue (mock).");
      generatePDF();
      clearCart();
      setTranscript('');
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const { netAmount, gstAmount, totalAmount } = getTotals();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button onClick={() => setLang('ta-IN')} className={`px-2 py-1 text-xs rounded ${lang === 'ta-IN' ? 'bg-[#00f3ff] text-black font-bold' : 'bg-[rgba(255,255,255,0.1)]'}`}>TA</button>
            <button onClick={() => setLang('en-IN')} className={`px-2 py-1 text-xs rounded ${lang === 'en-IN' ? 'bg-[#00f3ff] text-black font-bold' : 'bg-[rgba(255,255,255,0.1)]'}`}>EN</button>
          </div>

          <h2 className="text-xl font-semibold mb-8 neon-text-blue text-center">Speak to add items!</h2>
          
          <motion.button
            onClick={toggleVoice}
            animate={{ 
              scale: isVoiceActive ? [1, 1.1, 1] : 1,
              boxShadow: isVoiceActive ? "0 0 40px rgba(0, 243, 255, 0.6)" : "0 0 0px rgba(0,0,0,0)"
            }}
            transition={{ repeat: isVoiceActive ? Infinity : 0, duration: 1.5 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 ${isVoiceActive ? 'bg-gradient-to-r from-[#00f3ff] to-[#bd00ff] text-white' : 'glass-card text-gray-400 hover:text-white border border-[rgba(255,255,255,0.2)]'}`}
          >
            {isVoiceActive ? <MdMic size={60} /> : <MdMicOff size={60} />}
          </motion.button>
          
          <div className="w-full min-h-[100px] bg-[rgba(0,0,0,0.3)] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] relative">
            <p className="text-sm text-gray-400 mb-2">Live Transcript</p>
            <p className={`text-lg font-medium ${isProcessing ? 'text-[#00f3ff] animate-pulse' : 'text-white'}`}>
              {transcript || "Listening for products..."}
            </p>
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
                <MdMic size={64} className="mb-4 opacity-20" />
                <p>No items added yet.</p>
                <p className="text-sm">Speak to add items to the bill.</p>
              </div>
            )}
          </div>

          <div className="bg-[rgba(0,0,0,0.4)] p-6 border-t border-[rgba(255,255,255,0.1)]">
            <div className="flex justify-between mb-2 text-gray-300"><span>Subtotal</span><span>₹{netAmount.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-300"><span>GST (5%)</span><span>₹{gstAmount.toFixed(2)}</span></div>
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-[rgba(255,255,255,0.1)]"><span className="text-xl font-bold">Total Amount</span><span className="text-3xl font-bold neon-text-blue">₹{totalAmount.toFixed(2)}</span></div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => window.print()} className="flex items-center justify-center space-x-2 py-3 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"><MdPrint size={20} /><span>Print</span></button>
              <button onClick={generatePDF} className="flex items-center justify-center space-x-2 py-3 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"><MdPictureAsPdf size={20} /><span>PDF</span></button>
              <button onClick={handleSaveInvoice} className="flex items-center justify-center space-x-2 py-3 rounded-lg btn-neon-blue font-bold shadow-lg"><MdCheckCircle size={20} /><span>Save Invoice</span></button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .glass-card { visibility: hidden; } }`}</style>
    </div>
  );
};

export default VoiceBilling;
