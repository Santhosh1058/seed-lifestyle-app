import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader, Sprout } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser } = useAuth(); // Get currentUser
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-100 p-3 rounded-xl mb-4">
                        <Sprout className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Sign in to manage your seed business</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center border border-rose-100">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium text-gray-900"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 shadow-lg shadow-emerald-200 mt-2"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : 'Sign In'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-400 font-medium">Secured by Firebase Authentication</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
