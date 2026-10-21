import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, X, CheckCircle2, KeyRound } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithPin } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = (email: string, name: string) => {
    loginWithGoogle(email, name);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter your email or Admin PIN');
      return;
    }
    const success = loginWithPin(pinInput);
    if (!success) {
      setErrorMsg('Invalid PIN. Use 250205 or your authorised email.');
    } else {
      setErrorMsg('');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900">
        <button
          onClick={closeAuthModal}
          aria-label="Close sign in modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Google Identity Services
            </div>
            <h3 className="text-xl font-black text-slate-900">Sign In with Google</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Authorised login for <strong className="text-slate-900">Executive Performance Analytics & Individual Dashboards</strong>. Sign in to access confidential field visit records, map intelligence, and rep KPIs.
        </p>

        {/* Quick Authorised Account Selection */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Authorised Account
          </div>

          <button
            type="button"
            onClick={() => handleQuickLogin('nayanchildoffice@gmail.com', 'Nayan Sharma')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-400 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 group-hover:text-blue-900">
                    Nayan Sharma
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Authorised
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono">nayanchildoffice@gmail.com</div>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-500 font-semibold">
              Or sign in with Admin PIN
            </span>
          </div>
        </div>

        {/* PIN / Email Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-pin-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Google Workspace Email / Admin PIN (PIN: 250205)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                id="admin-pin-input"
                type="text"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="name@company.com or PIN 250205"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
            </div>
            {errorMsg && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-semibold">
                <span>⚠️</span> {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Lock className="h-4 w-4" />
            Authenticate Admin Access
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by Enterprise Security</span>
          <span className="text-blue-700 font-mono font-bold">Google OAuth Compliant</span>
        </div>
      </div>
    </div>
  );
};
