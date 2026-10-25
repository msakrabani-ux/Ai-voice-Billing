import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MdDashboard, MdInventory, MdHistory, MdSettings, MdMic, MdPointOfSale } from 'react-icons/md';
import { motion } from 'framer-motion';

const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard size={24} /> },
    { name: 'Voice Billing', path: '/voice-billing', icon: <MdMic size={24} /> },
    { name: 'Manual Billing', path: '/manual-billing', icon: <MdPointOfSale size={24} /> },
    { name: 'Products', path: '/products', icon: <MdInventory size={24} /> },
    { name: 'History', path: '/history', icon: <MdHistory size={24} /> },
    { name: 'Settings', path: '/settings', icon: <MdSettings size={24} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center justify-center border-b border-[rgba(255,255,255,0.1)]">
            <h1 className="text-2xl font-bold tracking-wider">
              <span className="neon-text-blue">MS</span> <span className="neon-text-purple">SAKRA</span>
            </h1>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-[rgba(0,243,255,0.1)] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-6 border-t border-[rgba(255,255,255,0.1)] text-center text-sm text-gray-500">
          AI Voice POS v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
