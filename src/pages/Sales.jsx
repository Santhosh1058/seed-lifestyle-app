import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader, Sprout } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';

const Sales = () => {
    const { stock, addSale } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastSaleResult, setLastSaleResult] = useState(null);

    // Filter only available stock
    const availableStock = stock.filter(item => item.packets_available > 0);

    const [formData, setFormData] = useState({
        customer_name: '',
        stock_batch_id: '',
        packets_sold: '',
        price_per_packet: '',
        amount_paid_now: ''
    });

    const [calculatedTotal, setCalculatedTotal] = useState(0);

    useEffect(() => {
        const packets = parseFloat(formData.packets_sold) || 0;
        const price = parseFloat(formData.price_per_packet) || 0;
        setCalculatedTotal(packets * price);
    }, [formData.packets_sold, formData.price_per_packet]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData({
            customer_name: '',
            stock_batch_id: '',
            packets_sold: '',
            price_per_packet: '',
            amount_paid_now: ''
        });
        setCalculatedTotal(0);
        setShowSuccess(false);
        setLastSaleResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const saleData = { ...formData, total_amount_due: calculatedTotal };
            const result = addSale(saleData);
            setLastSaleResult({ ...saleData, amount_paid: formData.amount_paid_now }); // Mock result for display
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedStock = stock.find(s => s.id === parseInt(formData.stock_batch_id));

    if (showSuccess) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SuccessScreen
                    title="Sale Recorded!"
                    message={`Sold ${lastSaleResult?.packets_sold} pkts to ${lastSaleResult?.customer_name}. Received ₹${lastSaleResult?.amount_paid}.`}
                    onReset={handleReset}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <ShoppingBag className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Log New Sale</h2>
                    <p className="text-sm text-gray-500 font-medium">Record a new transaction with a farmer.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</label>
                        <input
                            type="text"
                            name="customer_name"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.customer_name}
                            onChange={handleChange}
                            placeholder="Enter Farmer Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seed Selection</label>
                        <div className="relative">
                            <select
                                name="stock_batch_id"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none font-medium"
                                value={formData.stock_batch_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Seed Lot...</option>
                                {availableStock.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.seed_name} - {item.lot_no} ({item.packets_available} pkts avail)
                                    </option>
                                ))}
                            </select>
                            <Sprout className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                        <input
                            type="number"
                            name="packets_sold"
                            required
                            min="1"
                            max={selectedStock ? selectedStock.packets_available : undefined}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.packets_sold}
                            onChange={handleChange}
                            placeholder="Packets"
                        />
                        {selectedStock && <p className="text-xs text-emerald-600 mt-1.5 font-bold">Available: {selectedStock.packets_available}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price / Pkt (₹)</label>
                        <input
                            type="number"
                            name="price_per_packet"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.price_per_packet}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-sm font-semibold text-gray-600">Total Sale Amount</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">₹{calculatedTotal.toLocaleString()}</span>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Initial Payment Recieved (₹)</label>
                        <input
                            type="number"
                            name="amount_paid_now"
                            required
                            min="0"
                            max={calculatedTotal}
                            step="0.01"
                            placeholder="Amount Received Now"
                            className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-300 font-bold"
                            value={formData.amount_paid_now}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 shadow-lg shadow-emerald-200"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <ShoppingBag className="mr-2 h-5 w-5" />}
                        Record Transaction
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium">Securely recorded in local storage.</p>
                </div>
            </form>
        </div>
    );
};

export default Sales;
