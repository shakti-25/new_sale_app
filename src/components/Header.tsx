import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, GeoLocation } from '../types';
import {
  MapPin,
  LogIn,
  LogOut,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  UserCheck,
  Building2,
  Navigation,
  Menu,
  X,
  RefreshCw,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentLocation: GeoLocation;
  totalVisitsCount: number;
  onRefreshLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentLocation,
  totalVisitsCount,
  onRefreshLocation,
}) => {
  const { isAdmin, adminUser, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        {/* Top Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3">
              {/* Menu toggle button (Mobile & Quick Drawer) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => handleNavClick('field-entry')}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-extrabold text-lg sm:text-xl tracking-tight shrink-0">
                  ST
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                      SalesTrack Enterprise
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md">
                      Live GPS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 hidden md:block">
                    Field Operations Web Portal • Google Maps Grounding • Pin 250205
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section: GPS Pill, Refetch & Auth Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live GPS Telemetry Pill */}
              <div
                onClick={onRefreshLocation}
                title="Tap to refresh live satellite GPS coordinates"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 shadow-2xs cursor-pointer transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold truncate max-w-[170px]" title={currentLocation.locationName}>
                  {currentLocation.locationName || 'Field Visit Site'}
                </span>
                <span className="text-slate-500 text-[10px] font-mono">
                  (±{Math.round(currentLocation.accuracy)}m)
                </span>
                {onRefreshLocation && (
                  <RefreshCw className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                )}
              </div>

              {/* Auth Buttons */}
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-95 min-h-[40px]"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Google Sign In</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 border border-emerald-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {adminUser?.avatar || 'N'}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <div className="font-semibold text-slate-900 max-w-[120px] truncate">
                      {adminUser?.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">Authorised Manager</div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign out / Lock manager access"
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation Row for Desktop & Tablets */}
          <nav className="hidden sm:flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none text-xs font-semibold pt-1">
            <button
              type="button"
              onClick={() => onTabChange('field-entry')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer min-h-[42px] ${
                activeTab === 'field-entry'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Field Visit Entry
            </button>

            <button
              type="button"
              onClick={() => onTabChange('visit-records')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer min-h-[42px] ${
                activeTab === 'visit-records'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Visit Records & Maps</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isAdmin
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                }`}
              >
                {isAdmin ? totalVisitsCount : 'Admin'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('performance-analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer min-h-[42px] ${
                activeTab === 'performance-analytics'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Team Performance</span>
              {!isAdmin && (
                <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('individual-dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer min-h-[42px] ${
                activeTab === 'individual-dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Rep KPI Dashboards</span>
              {!isAdmin ? (
                <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                  Admin Only
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                  1-on-1 Dashboards
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Slide-Down Navigation Menu (Activated by Menu Button) */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Operations Navigation Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                >
                  Close Menu
                </button>
              </div>

              {/* Navigation Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleNavClick('field-entry')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'field-entry'
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <div>
                      <div>Field Visit Entry</div>
                      <div className="text-[11px] font-normal text-slate-500">Live GPS scheduling & form certification</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('visit-records')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'visit-records'
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Visit Records & Maps</span>
                        {!isAdmin && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">Admin</span>}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500">Audit trail, CSV export, interactive map</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('performance-analytics')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'performance-analytics'
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Team Performance</span>
                        {!isAdmin && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">Admin</span>}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500">Leaderboard, report analysis & deals</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('individual-dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'individual-dashboard'
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Rep KPI Dashboards</span>
                        {!isAdmin && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">Admin Only</span>}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500">Search rep, daily/weekly/monthly/yearly reports</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Live Location and Admin Status inside Menu */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">
                    Current Location: <strong>{currentLocation.locationName}</strong>
                  </span>
                  {onRefreshLocation && (
                    <button
                      type="button"
                      onClick={onRefreshLocation}
                      className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer ml-1"
                    >
                      Refetch GPS
                    </button>
                  )}
                </div>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In with Google (PIN: 250205)
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">● Admin Verified: {adminUser?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-red-600 hover:text-red-800 underline font-bold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Operations Portal Subheader Bar */}
        <div className="bg-slate-100/80 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                Official Operations Portal
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-700 truncate max-w-xs sm:max-w-sm">
                Verified: <strong className="text-slate-900">{currentLocation.locationName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Access:</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white text-slate-700 border border-slate-300 shadow-2xs'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Authorised Manager (PIN: 250205)
                  </>
                ) : (
                  'Field Representative'
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Phone Friendly Bottom Navigation Bar for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        <button
          type="button"
          onClick={() => onTabChange('field-entry')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold min-w-[65px] min-h-[44px] ${
            activeTab === 'field-entry' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          Field Entry
        </button>

        <button
          type="button"
          onClick={() => onTabChange('visit-records')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold min-w-[65px] min-h-[44px] ${
            activeTab === 'visit-records' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          Records
        </button>

        <button
          type="button"
          onClick={() => onTabChange('performance-analytics')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold min-w-[65px] min-h-[44px] ${
            activeTab === 'performance-analytics' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          Team
        </button>

        <button
          type="button"
          onClick={() => onTabChange('individual-dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold min-w-[65px] min-h-[44px] ${
            activeTab === 'individual-dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          Rep KPIs
        </button>
      </nav>
    </>
  );
};
