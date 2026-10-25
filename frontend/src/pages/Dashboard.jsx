import React from 'react';
import { MdTrendingUp, MdAttachMoney, MdShoppingCart } from 'react-icons/md';

const Dashboard = () => {
  const stats = [
    { title: "Today's Sales", value: "₹0.00", icon: <MdAttachMoney size={30} className="text-[#00f3ff]" />, change: "+0%" },
    { title: "Total Orders", value: "0", icon: <MdShoppingCart size={30} className="text-[#bd00ff]" />, change: "+0%" },
    { title: "Monthly Revenue", value: "₹0.00", icon: <MdTrendingUp size={30} className="text-[#00f3ff]" />, change: "+0%" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your billing system</p>
        </div>
        <div className="glass-card px-4 py-2">
          <span className="text-sm font-medium neon-text-blue">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="bg-[rgba(255,255,255,0.05)] p-3 rounded-xl">
                {stat.icon}
              </div>
              <span className="text-green-400 text-sm font-medium bg-[rgba(74,222,128,0.1)] px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <h2 className="text-3xl font-bold mt-1">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 min-h-[300px]">
          <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
          <div className="flex items-center justify-center h-48 text-gray-500">
            No recent invoices
          </div>
        </div>
        <div className="glass-card p-6 min-h-[300px]">
          <h3 className="text-xl font-semibold mb-4">Top Products</h3>
          <div className="flex items-center justify-center h-48 text-gray-500">
            No data available
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
