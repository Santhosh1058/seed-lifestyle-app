import React, { useEffect, useState } from 'react';
import { Check, Plus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessScreen = ({ title, message, onReset }) => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center animate-in fade-in duration-500">
            <div className={`w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${animate ? 'scale-100 rotate-0' : 'scale-50 rotate-[-45deg]'}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Check className={`w-10 h-10 text-white ${animate ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300`} strokeWidth={4} />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h2>
            <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">{message}</p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button
                    onClick={onReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    Add Another
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                    <LayoutDashboard size={20} strokeWidth={2.5} />
                    Dashboard
                </button>
            </div>
        </div>
    );
};

export default SuccessScreen;
