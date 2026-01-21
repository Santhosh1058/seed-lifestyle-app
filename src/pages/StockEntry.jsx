import React, { useState } from 'react';
import { Save, Loader, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';

const StockEntry = () => {
    const { addStock } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        supplier_name: '',
        seed_name: '',
        lot_no: '',
        arrival_date: new Date().toISOString().split('T')[0],
        total_packets_initial: '',
        cost_per_packet: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData({
            supplier_name: '',
            seed_name: '',
            lot_no: '',
            arrival_date: new Date().toISOString().split('T')[0],
            total_packets_initial: '',
            cost_per_packet: ''
        });
        setShowSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            addStock(formData);
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to save stock');
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SuccessScreen
                    title="Stock Entry Added!"
                    message={`Successfully logged ${formData.total_packets_initial} packets of ${formData.seed_name} from ${formData.supplier_name}.`}
                    onReset={handleReset}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <Layers className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Stock Entry</h2>
                    <p className="text-sm text-gray-500 font-medium">Record incoming inventory from suppliers.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supplier Name</label>
                        <input
                            type="text"
                            name="supplier_name"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.supplier_name}
                            onChange={handleChange}
                            placeholder="e.g. Denova"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seed Name</label>
                        <input
                            type="text"
                            name="seed_name"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.seed_name}
                            onChange={handleChange}
                            placeholder="e.g. Tomato Hybrid"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lot Number</label>
                    <input
                        type="text"
                        name="lot_no"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                        value={formData.lot_no}
                        onChange={handleChange}
                        placeholder="Batch ID"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Arrival Date</label>
                        <input
                            type="date"
                            name="arrival_date"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.arrival_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Packets</label>
                        <input
                            type="number"
                            name="total_packets_initial"
                            required
                            min="1"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.total_packets_initial}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cost / Packet (₹)</label>
                        <input
                            type="number"
                            name="cost_per_packet"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                            value={formData.cost_per_packet}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 shadow-lg shadow-emerald-200"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Stock Entry
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StockEntry;
