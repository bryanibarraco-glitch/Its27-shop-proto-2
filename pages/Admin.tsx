import React from 'react';
import { LayoutDashboard, Package, Users, Settings } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <button className="bg-black text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
                Log Out
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <Package className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Products</p>
                    <p className="text-2xl font-bold">124</p>
                </div>
            </div>
            <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <Users className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Active Customers</p>
                    <p className="text-2xl font-bold">1,092</p>
                </div>
            </div>
             <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <LayoutDashboard className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Pending Orders</p>
                    <p className="text-2xl font-bold">8</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <Settings className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Configuration</h2>
            <p className="text-gray-500">This area is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;