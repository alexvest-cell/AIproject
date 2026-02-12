import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Verify password with backend
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem('adminToken', token);
                onLogin(token);
            } else {
                setError('Invalid password');
                setPassword('');
            }
        } catch (err) {
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <h1 className="text-3xl font-serif font-bold tracking-tighter uppercase mb-2">
                            <span className="text-news-accent">Planetary</span>
                            <span className="text-white">Brief</span>
                        </h1>
                        <div className="h-0.5 bg-gradient-to-r from-transparent via-news-accent to-transparent"></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 font-mono">Content Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-2xl">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-news-accent/10 mb-6 mx-auto">
                        <Lock className="text-news-accent" size={24} />
                    </div>

                    <h2 className="text-xl font-bold text-white text-center mb-2">Admin Access</h2>
                    <p className="text-gray-400 text-sm text-center mb-6">Enter your password to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-news-accent focus:ring-1 focus:ring-news-accent transition-all"
                                placeholder="Enter admin password"
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-news-accent hover:bg-emerald-600 text-black font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Lock size={20} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-xs text-gray-500 text-center">
                            For security reasons, admin access is restricted.
                            <br />
                            Contact your administrator if you need access.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-600 font-mono">
                        Secured by token-based authentication
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
