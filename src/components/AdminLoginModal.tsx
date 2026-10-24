import React, { useState } from 'react';
import { Shield, Lock, X, User } from 'lucide-react';
import { storage } from '../storage';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actualUser = storage.getAdminUsername().trim().toLowerCase();
    const actualPass = storage.getAdminPassword();

    if (username.trim().toLowerCase() === actualUser && password === actualPass) {
      storage.setAdminLoggedIn(true);
      setError(false);
      setUsername('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Administrator Access</h3>
              <p className="text-[10px] text-gray-400">PC TECHNO TUNER Ahmedabad</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-semibold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>User ID</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              autoCapitalize="none"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              placeholder="Default: admin"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Default: admin123"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            {error && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">
                User ID ya password galat hai. Default: <span className="font-mono">admin / admin123</span>
              </p>
            )}
          </div>

          <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800/80 text-[11px] text-gray-400">
            <span className="text-gray-300 font-semibold">Authorized Access:</span> Financial ledger, cost prices, technician assignments, and billing controls are restricted to the business owner.
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition"
          >
            Authenticate & Open Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
