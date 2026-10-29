
import React, { useState } from 'react';
import { Shield, Lock, X, User } from 'lucide-react';
import { storage } from '../storage';
import { supabase } from '../lib/supabaseClient';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError('Email ya password galat hai. Dobara check karein.');
        return;
      }

      storage.setAdminLoggedIn(true);
      setEmail('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } catch {
      setError('Login nahi hua. Internet aur Supabase settings check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Administrator Login
              </h3>
              <p className="text-[10px] text-gray-400">
                PC TECHNO TUNER
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Admin Email
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Supabase account email"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Supabase account password"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          {error && (
            <p role="alert" className="text-rose-400 text-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
