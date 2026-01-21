import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, ShoppingBag, ReceiptText, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Stock Entry', path: '/stock', icon: Layers },
        { name: 'Sales', path: '/sales', icon: ShoppingBag },
        { name: 'Expenses', path: '/expenses', icon: ReceiptText },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const BrandLogo = () => (
        <div className="flex items-center gap-3 px-2">
            <div className="bg-emerald-100 p-2.5 rounded-xl shadow-sm">
                <Leaf className="h-6 w-6 text-emerald-600 fill-emerald-600" />
            </div>
            <div>
                <h1 className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight">SEKHAR<span className="text-emerald-600">.</span></h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hybrid Seeds</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-[2px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
                <div className="flex items-center h-24 px-8 border-b border-gray-50">
                    <BrandLogo />
                </div>
                <nav className="flex-1 overflow-y-auto py-8 px-6">
                    <div className="space-y-2">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Overview</p>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                                            ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`mr-3.5 h-5 w-5 transition-transform duration-200 ${isActive ? 'text-emerald-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile / Admin Badge Section (Mock) */}
                <div className="p-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="bg-gradient-to-br from-emerald-200 to-emerald-400 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm">A</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500 font-medium">Sekhar Seeds</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <div className="md:hidden flex items-center justify-between h-16 bg-white border-b border-gray-100 px-4 shadow-sm z-10">
                    <BrandLogo />
                    <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-40 flex md:hidden">
                        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
                        <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white shadow-2xl">
                            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                                <BrandLogo />
                                <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            <nav className="flex-1 px-4 py-6 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={toggleSidebar}
                                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium ${isActive
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-8 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
