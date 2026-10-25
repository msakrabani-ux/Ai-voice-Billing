import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VoiceBilling from './pages/VoiceBilling';
import ManualBilling from './pages/ManualBilling';
import Products from './pages/Products';
import History from './pages/History';
// Placeholder components for missing pages
const Settings = () => <div className="p-6"><h1 className="text-3xl font-bold neon-text-blue">Settings</h1><p>Coming Soon...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="voice-billing" element={<VoiceBilling />} />
          <Route path="manual-billing" element={<ManualBilling />} />
          <Route path="products" element={<Products />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
