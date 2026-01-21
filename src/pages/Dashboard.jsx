import React, { useState, useMemo } from 'react';
import { Wallet, Warehouse, PiggyBank, CheckCircle2, Plus, CheckSquare, Trash2, X, MoveUpRight, Pencil, Save, Eye, Search, Filter, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const Dashboard = () => {

    const { stats, stock, sales, expenses, addPayment, deleteSale, deleteStock, deleteExpense, updateSale, updateStock, updateExpense } = useData();
    const [activeTab, setActiveTab] = useState('sales');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedEntity, setSelectedEntity] = useState(''); // Customer, Supplier, or Category
    const [paymentAmounts, setPaymentAmounts] = useState({});

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'view' or 'edit'
        dataType: null, // 'sale', 'stock', 'expense'
        item: null
    });

    const [editForm, setEditForm] = useState({});

    // Get Unique Entities for Dropdown
    const uniqueEntities = useMemo(() => {
        if (activeTab === 'sales') return [...new Set(sales.map(s => s.customer_name))].sort();
        if (activeTab === 'stock') return [...new Set(stock.map(s => s.supplier_name))].sort();
        if (activeTab === 'expenses') return [...new Set(expenses.map(e => e.category))].sort();
        return [];
    }, [activeTab, sales, stock, expenses]);

    // Reset filters on tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        setDateRange({ start: '', end: '' });
        setSelectedEntity('');
    };

    // Filter Logic
    const getFilteredData = () => {
        let data = [];
        if (activeTab === 'sales') data = sales;
        else if (activeTab === 'stock') data = stock;
        else if (activeTab === 'expenses') data = expenses;

        return data.filter(item => {
            // 1. Text Search
            const query = searchQuery.toLowerCase();
            let matchesSearch = false;

            if (activeTab === 'sales') {
                matchesSearch = item.customer_name.toLowerCase().includes(query);
            } else if (activeTab === 'stock') {
                matchesSearch = item.supplier_name.toLowerCase().includes(query) ||
                    item.seed_name.toLowerCase().includes(query) ||
                    item.lot_no.includes(query);
            } else if (activeTab === 'expenses') {
                matchesSearch = item.category.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query));
            }

            if (!matchesSearch) return false;

            // 2. Entity Filter
            if (selectedEntity) {
                if (activeTab === 'sales' && item.customer_name !== selectedEntity) return false;
                if (activeTab === 'stock' && item.supplier_name !== selectedEntity) return false;
                if (activeTab === 'expenses' && item.category !== selectedEntity) return false;
            }

            // 3. Date Range Filter
            if (dateRange.start || dateRange.end) {
                const itemDate = new Date(item.sale_date || item.arrival_date || item.expense_date);
                // Reset time part for accurate date comparison
                itemDate.setHours(0, 0, 0, 0);

                if (dateRange.start) {
                    const startDate = new Date(dateRange.start);
                    startDate.setHours(0, 0, 0, 0);
                    if (itemDate < startDate) return false;
                }

                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    if (itemDate > endDate) return false;
                }
            }

            return true;
        });
    };

    const filteredData = getFilteredData();

    const handlePaymentChange = (id, value) => {
        setPaymentAmounts({ ...paymentAmounts, [id]: value });
    };

    const submitPayment = (id) => {
        const amount = paymentAmounts[id];
        if (!amount || amount <= 0) return;
        addPayment(id, amount);
        setPaymentAmounts({ ...paymentAmounts, [id]: '' });
    };

    const settlePayment = (sale) => {
        const remaining = sale.total_amount_due - sale.amount_paid;
        if (remaining > 0) {
            addPayment(sale.id, remaining);
        }
    };

    const openModal = (item, dataType, type = 'view') => {
        setModalConfig({ isOpen: true, type, dataType, item });
        if (type === 'edit') {
            setEditForm({ ...item });
        }
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, dataType: null, item: null });
        setEditForm({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
        if (modalConfig.dataType === 'sale') {
            updateSale(editForm);
        } else if (modalConfig.dataType === 'stock') {
            updateStock(editForm);
        } else if (modalConfig.dataType === 'expense') {
            updateExpense(editForm);
        }
        closeModal();
    };

    const statCards = [
        {
            title: 'Money Received',
            // Update: Show Received / Total Bill
            value: (
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{stats.totalCollection.toLocaleString()}</span>
                    <span className="text-sm font-medium text-gray-400">/ ₹{stats.totalSalesValue.toLocaleString()}</span>
                </div>
            ),
            icon: Wallet,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            // Calculate percentage for change
            change: stats.totalSalesValue > 0 ? `${Math.round((stats.totalCollection / stats.totalSalesValue) * 100)}% Coll.` : '0%',
            changeType: 'positive'
        },
        {
            title: 'Stock Purchased',
            value: <span className="text-3xl font-bold text-gray-900">₹{stats.stockPurchasedValue.toLocaleString()}</span>,
            icon: Warehouse,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            change: `${stock.length} Batches`,
            changeType: 'neutral'
        },
        {
            title: 'Home Expenses',
            value: <span className="text-3xl font-bold text-gray-900">₹{stats.homeExpenses.toLocaleString()}</span>,
            icon: PiggyBank,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            change: `${expenses.length} Txns`,
            changeType: 'negative'
        },
    ];

    return (
        <div className="space-y-8 relative">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
                    <p className="text-sm text-gray-500 font-medium">Business Overview & Quick Actions</p>
                </div>
                <div className="text-xs font-semibold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm uppercase tracking-wide">
                    {formatDate(new Date().toISOString())}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col justify-between h-36 group hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.title}</p>
                                {stat.value}
                            </div>
                            <div className={`p-3.5 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : stat.changeType === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area with Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
                <div className="border-b border-gray-100 px-8 flex flex-col items-start bg-white sticky top-0 z-10 pt-4 pb-0">
                    <div className="flex space-x-10 w-full overflow-x-auto no-scrollbar mb-4">
                        {['sales', 'stock', 'expenses'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`pb-4 text-sm font-bold border-b-[3px] transition-all capitalize tracking-wide whitespace-nowrap ${activeTab === tab
                                    ? 'border-emerald-500 text-emerald-700'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'sales' ? 'Sales Tracker' : tab === 'stock' ? 'Inventory Status' : 'Expense Log'}
                            </button>
                        ))}
                    </div>

                    {/* Filters Bar */}
                    <div className="w-full flex flex-col md:flex-row gap-4 mb-6 pt-2 items-center">
                        {/* Search */}
                        <div className="relative flex-grow w-full md:w-auto">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Entity Filter (Customer/Supplier/Category) */}
                        <div className="relative w-full md:w-48">
                            <select
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer text-gray-600 font-medium"
                            >
                                <option value="">All {activeTab === 'sales' ? 'Customers' : activeTab === 'stock' ? 'Suppliers' : 'Categories'}</option>
                                {uniqueEntities.map(entity => (
                                    <option key={entity} value={entity}>{entity}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Date Range */}
                        <div className="flex gap-2 items-center w-full md:w-auto">
                            <div className="relative w-full md:w-36">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm text-gray-600 uppercase"
                                />
                                <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <span className="text-gray-300 font-bold">-</span>
                            <div className="relative w-full md:w-36">
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm text-gray-600 uppercase"
                                />
                                <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || selectedEntity || dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedEntity(''); setDateRange({ start: '', end: '' }) }}
                                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Clear Filters"
                            >
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-0">
                    {activeTab === 'sales' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-400 font-bold uppercase bg-gray-50/50 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-6 py-5">Customer</th>
                                        <th className="px-6 py-5">Total</th>
                                        <th className="px-6 py-5">Paid</th>
                                        <th className="px-6 py-5">Due</th>
                                        <th className="px-6 py-5">Fast Action</th>
                                        <th className="px-6 py-5 text-center">Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="7" className="px-8 py-10 text-center text-gray-400">No active sales found matching filters.</td></tr>
                                    ) : (
                                        filteredData.map((sale) => (
                                            <tr key={sale.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                                                <td className="px-8 py-5 text-gray-500 font-mono text-xs">{formatDate(sale.sale_date)}</td>
                                                <td className="px-6 py-5 font-bold text-gray-900">{sale.customer_name}</td>
                                                <td className="px-6 py-5 text-gray-600 font-medium">₹{sale.total_amount_due}</td>
                                                <td className="px-6 py-5 text-emerald-600 font-bold">+₹{sale.amount_paid}</td>
                                                <td className="px-6 py-5">
                                                    {sale.total_amount_due - sale.amount_paid > 0 ? (
                                                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded text-xs">₹{sale.total_amount_due - sale.amount_paid}</span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {sale.is_fully_paid ? (
                                                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                                            <CheckCircle2 size={14} className="mr-1.5" strokeWidth={3} /> Paid
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 h-9">
                                                            <div className="relative flex items-center h-full">
                                                                <input
                                                                    type="number"
                                                                    className="w-24 pl-3 pr-2 h-full text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-300 font-medium"
                                                                    placeholder="Amount"
                                                                    value={paymentAmounts[sale.id] || ''}
                                                                    onChange={(e) => handlePaymentChange(sale.id, e.target.value)}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => submitPayment(sale.id)}
                                                                className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                                title="Add Partial Payment"
                                                            >
                                                                <Plus size={18} strokeWidth={3} />
                                                            </button>
                                                            <div className="h-5 w-px bg-gray-100 mx-1"></div>
                                                            <button
                                                                onClick={() => settlePayment(sale)}
                                                                className="h-9 w-9 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                                title="Mark Fully Paid"
                                                            >
                                                                <CheckSquare size={20} strokeWidth={2} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <button onClick={() => openModal(sale, 'sale', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                                        <button onClick={() => openModal(sale, 'sale', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                        <button onClick={() => deleteSale(sale.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'stock' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-400 font-bold uppercase bg-gray-50/50 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Supplier</th>
                                        <th className="px-6 py-5">Seed (Lot)</th>
                                        <th className="px-6 py-5">Arrival</th>
                                        <th className="px-6 py-5">Stock Level</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="6" className="px-8 py-10 text-center text-gray-400">No stock found matching filters.</td></tr>
                                    ) : (
                                        filteredData.map((batch) => (
                                            <tr key={batch.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                                                <td className="px-8 py-5 text-gray-900 font-bold">{batch.supplier_name}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium">{batch.seed_name}</span>
                                                        <span className="text-xs text-gray-400 font-mono">#{batch.lot_no}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-gray-500">{formatDate(batch.arrival_date)}</td>
                                                <td className="px-6 py-5 font-mono text-gray-700 font-medium">{batch.packets_available} pkts</td>
                                                <td className="px-6 py-5">
                                                    {batch.packets_available > 0 ? (
                                                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs font-bold border border-emerald-100">In Stock</span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2.5 py-1 rounded text-xs font-bold">Empty</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <button onClick={() => openModal(batch, 'stock', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                                        <button onClick={() => openModal(batch, 'stock', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                        <button onClick={() => deleteStock(batch.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-400 font-bold uppercase bg-gray-50/50 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-6 py-5">Category</th>
                                        <th className="px-6 py-5">Description</th>
                                        <th className="px-6 py-5">Amount</th>
                                        <th className="px-6 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-10 text-center text-gray-400">No expenses found matching filters.</td></tr>
                                    ) : (
                                        filteredData.map((exp) => (
                                            <tr key={exp.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                                                <td className="px-8 py-5 text-gray-600 font-mono text-xs font-medium">{formatDate(exp.expense_date)}</td>
                                                <td className="px-6 py-5">
                                                    <span className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 uppercase tracking-wide">{exp.category}</span>
                                                </td>
                                                <td className="px-6 py-5 text-gray-400 italic text-xs">{exp.description || '-'}</td>
                                                <td className="px-6 py-5 font-bold text-gray-900">₹{exp.amount}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <button onClick={() => openModal(exp, 'expense', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                                        <button onClick={() => openModal(exp, 'expense', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                        <button onClick={() => deleteExpense(exp.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reusable Modal for View and Edit */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                                    {modalConfig.type === 'edit' ? 'Edit ' : ''}
                                    {modalConfig.dataType === 'sale' ? 'Sale Details' : modalConfig.dataType === 'stock' ? 'Stock Batch' : 'Expense Record'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Make changes or view details below.</p>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* VIEW MODE */}
                            {modalConfig.type === 'view' && (
                                <>
                                    {modalConfig.dataType === 'sale' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Date" value={formatDate(modalConfig.item.sale_date)} />
                                            <DetailRow label="Customer Name" value={modalConfig.item.customer_name} />
                                            <DetailRow label="Packets Sold" value={modalConfig.item.packets_sold} />
                                            <div className="h-px bg-gray-100 my-2"></div>
                                            <DetailRow label="Total Amount Due" value={`₹${modalConfig.item.total_amount_due}`} highlight />
                                            <DetailRow label="Total Paid" value={`₹${modalConfig.item.amount_paid}`} color="text-emerald-600" />
                                            <DetailRow label="Remaining Due" value={`₹${modalConfig.item.total_amount_due - modalConfig.item.amount_paid}`} color="text-rose-600" />
                                        </div>
                                    )}
                                    {modalConfig.dataType === 'stock' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Supplier" value={modalConfig.item.supplier_name} />
                                            <DetailRow label="Seed Name" value={modalConfig.item.seed_name} highlight />
                                            <DetailRow label="Lot Number" value={modalConfig.item.lot_no} />
                                            <div className="h-px bg-gray-100 my-2"></div>
                                            <DetailRow label="Total Packets" value={modalConfig.item.total_packets_initial} />
                                            <DetailRow label="Avail" value={modalConfig.item.packets_available} color="text-emerald-600" />
                                        </div>
                                    )}
                                    {modalConfig.dataType === 'expense' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Category" value={modalConfig.item.category} highlight />
                                            <DetailRow label="Amount" value={`₹${modalConfig.item.amount}`} />
                                            <DetailRow label="Description" value={modalConfig.item.description || '-'} />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* EDIT MODE */}
                            {modalConfig.type === 'edit' && (
                                <div className="space-y-5">
                                    {modalConfig.dataType === 'sale' && (
                                        <>
                                            <Input label="Customer Name" name="customer_name" value={editForm.customer_name} onChange={handleEditChange} />
                                            <Input label="Packets Sold" name="packets_sold" type="number" value={editForm.packets_sold} onChange={handleEditChange} />
                                            <Input label="Total Amount (₹)" name="total_amount_due" type="number" value={editForm.total_amount_due} onChange={handleEditChange} />
                                            <Input label="Paid So Far (₹)" name="amount_paid" type="number" value={editForm.amount_paid} onChange={handleEditChange} />
                                        </>
                                    )}
                                    {modalConfig.dataType === 'stock' && (
                                        <>
                                            <Input label="Supplier" name="supplier_name" value={editForm.supplier_name} onChange={handleEditChange} />
                                            <Input label="Seed Name" name="seed_name" value={editForm.seed_name} onChange={handleEditChange} />
                                            <Input label="Lot Number" name="lot_no" value={editForm.lot_no} onChange={handleEditChange} />
                                            <Input label="Initial Packets (Tracked)" name="total_packets_initial" type="number" value={editForm.total_packets_initial} onChange={handleEditChange} />
                                            <Input label="Packets Available" name="packets_available" type="number" value={editForm.packets_available} onChange={handleEditChange} />
                                        </>
                                    )}
                                    {modalConfig.dataType === 'expense' && (
                                        <>
                                            <Input label="Category" name="category" value={editForm.category} onChange={handleEditChange} />
                                            <Input label="Amount" name="amount" type="number" value={editForm.amount} onChange={handleEditChange} />
                                            <Input label="Description" name="description" value={editForm.description} onChange={handleEditChange} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm">
                                Close
                            </button>
                            {modalConfig.type === 'edit' && (
                                <button onClick={saveEdit} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center shadow-lg shadow-emerald-200">
                                    <Save size={18} className="mr-2" /> Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const DetailRow = ({ label, value, highlight = false, color = 'text-gray-900' }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">{label}</span>
        <span className={`font-semibold ${highlight ? 'text-lg ' : 'text-sm '} ${color} ${highlight ? 'text-gray-900' : ''}`}>
            {value}
        </span>
    </div>
);

const Input = ({ label, name, type = "text", value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-900 shadow-sm"
        />
    </div>
);

export default Dashboard;
