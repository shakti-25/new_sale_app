import React from 'react';
import { ShieldAlert, LogIn, ArrowLeft, Users, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

interface RestrictedAccessViewProps {
  tabName: string;
  onNavigate: (tab: ActiveTab) => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  tabName,
  onNavigate,
}) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="mx-auto max-w-4xl py-10 px-4 sm:px-6 pb-24 sm:pb-12">
      <div className="rounded-2xl border border-amber-200 bg-white p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-6 shadow-xs">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
          <Lock className="w-3.5 h-3.5" />
          Restricted Corporate Area
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          {tabName} Access Restricted
        </h2>

        <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base mb-8 leading-relaxed">
          Executive conversion summaries, individual salesperson progress dashboards, Lumpsum and SIP deal metrics, and team-wide field scheduling audit trails are restricted to authorised management personnel.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Google to Unlock
          </button>

          <button
            type="button"
            onClick={() => onNavigate('field-entry')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Field Visit Entry
          </button>
        </div>

        {/* Roles information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left border-t border-slate-100 pt-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Field Sales Representatives
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your daily sales visit schedules freely without logging in. Your GPS coordinates are certified automatically with each field submission.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              Authorised Managers & Supervisors
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized personnel (<span className="text-blue-700 font-mono font-bold">nayanchildoffice@gmail.com</span> or PIN <span className="text-blue-700 font-mono font-bold">250205</span>) can sign in to view complete visit coordinates, GPS maps, and performance KPIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
