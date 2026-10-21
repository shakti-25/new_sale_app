import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UserCheck,
  TrendingUp,
  Award,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  Users2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Search,
  ChevronDown,
  Filter,
  BarChart3,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { VisitRecord, TimePeriod } from '../types';
import {
  calculateSalespersonAnalytics,
  formatINR,
  filterRecordsByPeriod,
} from '../utils/analytics';
import { LeafletMap } from './LeafletMap';

interface IndividualDashboardProps {
  records: VisitRecord[];
  initialSalesperson?: string;
  onOpenDetailsModal?: (record: VisitRecord) => void;
}

export const IndividualDashboard: React.FC<IndividualDashboardProps> = ({
  records,
  initialSalesperson,
  onOpenDetailsModal,
}) => {
  // Extract all unique sales reps
  const allReps = useMemo(() => {
    const repsSet = new Set<string>();
    ['Nayan Sharma', 'Rahul Verma', 'Priya Patel', 'Amit Singh'].forEach((r) => repsSet.add(r));
    records.forEach((r) => {
      if (r.salespersonName?.trim()) {
        repsSet.add(r.salespersonName.trim());
      }
    });
    return Array.from(repsSet);
  }, [records]);

  const [selectedRep, setSelectedRep] = useState<string>(
    initialSalesperson || allReps[0] || 'Nayan Sharma'
  );

  // Time Period state: daily | weekly | monthly | yearly | all
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  // Search & Dropdown State
  const [searchRepQuery, setSearchRepQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered reps for dropdown search
  const filteredReps = useMemo(() => {
    if (!searchRepQuery.trim()) return allReps;
    return allReps.filter((r) =>
      r.toLowerCase().includes(searchRepQuery.toLowerCase())
    );
  }, [allReps, searchRepQuery]);

  // Calculate analytics for selected rep and period
  const analytics = useMemo(() => {
    return calculateSalespersonAnalytics(selectedRep, records, selectedPeriod);
  }, [selectedRep, records, selectedPeriod]);

  // Multi-period comparison for Report Analysis (Daily, Weekly, Monthly, Yearly)
  const reportBreakdown = useMemo(() => {
    const periods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
    return periods.map((p) => {
      const a = calculateSalespersonAnalytics(selectedRep, records, p);
      return {
        period: p,
        label: p === 'daily' ? 'Daily (Today)' : p === 'weekly' ? 'Weekly (7 Days)' : p === 'monthly' ? 'Monthly' : 'Yearly',
        visits: a.totalVisits,
        physical: a.physicalVisits,
        calls: a.callVisits,
        lumpsum: a.totalLumpsum,
        sip: a.totalSip,
        totalVolume: a.totalLumpsum + a.totalSip * 12,
        completionRate: a.completionRate,
      };
    });
  }, [selectedRep, records]);

  // Filter records specifically for this rep and period
  const repRecords = useMemo(() => {
    const filteredByTime = filterRecordsByPeriod(records, selectedPeriod);
    return filteredByTime.filter(
      (r) => r.salespersonName?.trim().toLowerCase() === selectedRep.trim().toLowerCase()
    );
  }, [selectedRep, records, selectedPeriod]);

  const tierColors = {
    'Top Producer': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Strong Performer': 'bg-blue-100 text-blue-800 border-blue-300',
    'Active Performer': 'bg-amber-100 text-amber-800 border-amber-300',
    'Getting Started': 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const periodOptions: { label: string; value: TimePeriod }[] = [
    { label: 'Daily (Today)', value: 'daily' },
    { label: 'Weekly (7 Days)', value: 'weekly' },
    { label: 'Monthly (This Month)', value: 'monthly' },
    { label: 'Yearly (Annual)', value: 'yearly' },
    { label: 'All-Time', value: 'all' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 sm:pb-8 animate-in fade-in duration-300">
      {/* Top Header & Search Bar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Restricted Executive Management Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Individual Salesperson Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time individual performance analytics, periodic report evaluation, and certified GPS audit logging.
          </p>
        </div>

        {/* Dropdown & Search Bar for Representative */}
        <div className="relative w-full lg:w-96" ref={dropdownRef}>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
            Select / Search Salesperson
          </label>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-blue-500 shadow-2xs transition-all cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {selectedRep[0]}
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold text-slate-900 text-sm">{selectedRep}</span>
                <span className="block text-[10px] text-slate-500">Representative Profile</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Search Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2 animate-in fade-in zoom-in-95">
              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchRepQuery}
                  onChange={(e) => setSearchRepQuery(e.target.value)}
                  placeholder="Type name to search representative..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Rep List */}
              <div className="max-h-56 overflow-y-auto space-y-1 pt-1">
                {filteredReps.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No representative found</div>
                ) : (
                  filteredReps.map((rep) => {
                    const isSelected = rep.toLowerCase() === selectedRep.toLowerCase();
                    const repRecordCount = records.filter(
                      (r) => r.salespersonName?.trim().toLowerCase() === rep.trim().toLowerCase()
                    ).length;

                    return (
                      <button
                        key={rep}
                        type="button"
                        onClick={() => {
                          setSelectedRep(rep);
                          setIsDropdownOpen(false);
                          setSearchRepQuery('');
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                            {rep[0]}
                          </div>
                          <span className="font-medium text-slate-900">{rep}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {repRecordCount} total visits
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Analysis Period Filter Bar (Daily, Weekly, Monthly, Yearly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Report Analysis Period:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedPeriod(opt.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                selectedPeriod === opt.value
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rep Overview Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20 shrink-0">
              {selectedRep[0]}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedRep}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${
                    tierColors[analytics.tier]
                  }`}
                >
                  {analytics.tier}
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
                  ID: ST-REP-{selectedRep.replace(/\s+/g, '').slice(0, 3).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Territory: North & West Strategic Corporate Accounts • Field Operations Active
              </p>
            </div>
          </div>

          {/* Quick Metrics In Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Period Total Volume
              </div>
              <div className="text-lg font-black text-emerald-700">
                {formatINR(analytics.totalLumpsum + analytics.totalSip * 12)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Lumpsum + Annualized SIP</div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Schedule Closure
              </div>
              <div className="text-lg font-black text-slate-900">
                {analytics.completionRate}%
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                {analytics.completedSchedules}/{analytics.totalVisits} Done
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                GPS Audit Score
              </div>
              <div className="text-lg font-black text-blue-700">
                {analytics.gpsComplianceRate}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {analytics.gpsVerifiedCount} Satellite Locked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Visits & Ratio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider">Field Visits ({selectedPeriod})</span>
            <Users2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{analytics.totalVisits}</div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {analytics.physicalVisits} Physical
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
              <PhoneCall className="w-3 h-3" />
              {analytics.callVisits} Calls
            </span>
          </div>
        </div>

        {/* KPI 2: Total Lumpsum Generated */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider">Lumpsum Deals Closed</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mb-1">
            {formatINR(analytics.totalLumpsum)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Avg Deal: <strong className="text-slate-800">{formatINR(analytics.avgLumpsumDeal)}</strong> ({analytics.lumpsumDealsCount} deals)
          </div>
        </div>

        {/* KPI 3: Monthly SIP Book */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider">SIP Book ({selectedPeriod})</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700 mb-1">
            {formatINR(analytics.totalSip)}
            <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Annualized: <strong className="text-slate-800">{formatINR(analytics.totalSip * 12)}</strong> ({analytics.sipDealsCount} SIPs)
          </div>
        </div>

        {/* KPI 4: Schedule Completion & Efficiency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider">Closure Efficiency</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600 mb-1">
            {analytics.completionRate}%
          </div>
          <div className="text-xs text-slate-600 flex items-center justify-between">
            <span>Meetings Done: <strong className="text-slate-900">{analytics.completedSchedules}/{analytics.totalVisits}</strong></span>
            <span>GPS Locked: <strong className="text-slate-900">{analytics.gpsVerifiedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Monthly, Weekly, Daily and Yearly Report Analysis Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Daily, Weekly, Monthly & Yearly Report Analysis for {selectedRep}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive periodic performance breakdown across key sales metrics and closed volume.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            Live Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Report Period</th>
                <th className="pb-3 font-bold">Visits Logged</th>
                <th className="pb-3 font-bold">Physical / Call</th>
                <th className="pb-3 font-bold">Lumpsum Closed</th>
                <th className="pb-3 font-bold">SIP Book (Monthly)</th>
                <th className="pb-3 font-bold">Total Period Volume</th>
                <th className="pb-3 font-bold text-right">Schedule Closure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportBreakdown.map((row) => {
                const isActive = selectedPeriod === row.period;
                return (
                  <tr
                    key={row.period}
                    onClick={() => setSelectedPeriod(row.period)}
                    className={`transition-colors cursor-pointer ${
                      isActive ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                        <span className="font-bold text-slate-900">{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-800 font-bold">
                      {row.visits} {row.visits === 1 ? 'visit' : 'visits'}
                    </td>
                    <td className="py-3.5 pr-3 text-slate-600">
                      <span className="text-emerald-700 font-medium">{row.physical} Phys</span> •{' '}
                      <span className="text-blue-700 font-medium">{row.calls} Calls</span>
                    </td>
                    <td className="py-3.5 pr-3 font-mono font-bold text-emerald-700">
                      {formatINR(row.lumpsum)}
                    </td>
                    <td className="py-3.5 pr-3 font-mono font-bold text-purple-700">
                      {formatINR(row.sip)}/mo
                    </td>
                    <td className="py-3.5 pr-3 font-mono font-black text-slate-900">
                      {formatINR(row.totalVolume)}
                    </td>
                    <td className="py-3.5 text-right font-bold text-blue-700">
                      {row.completionRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Performance Insights & Diagnostics */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Field Diagnostics & Diagnostic Summary ({selectedPeriod.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-600">
              Automated behavioral diagnostics computed from {selectedRep}&apos;s verified field scheduling telemetry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {analytics.aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rep's Field Map & Visit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Rep's Field Map */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {selectedRep}&apos;s Coordinates Map
                </h3>
                <p className="text-xs text-slate-500">
                  {repRecords.length} certified visit locations on record ({selectedPeriod})
                </p>
              </div>
            </div>

            {repRecords.length > 0 ? (
              <LeafletMap
                center={[
                  repRecords[0].location.latitude,
                  repRecords[0].location.longitude,
                ]}
                zoom={12}
                markers={repRecords}
                className="h-72 w-full rounded-xl border border-slate-200"
              />
            ) : (
              <div className="h-64 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-500 bg-slate-50">
                No GPS records logged for {selectedRep} in this time period.
              </div>
            )}
            <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between">
              <span>All physical visits locked with GPS audit accuracy</span>
              <span className="text-emerald-700 font-mono font-bold">100% Certified</span>
            </div>
          </div>
        </div>

        {/* Right: Rep's Detailed Visit History */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Visit Log for {selectedRep}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {repRecords.length} recorded client meetings ({selectedPeriod})
                </p>
              </div>
            </div>

            {repRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No visit records found for {selectedRep} in this time period.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mobile Cards View & Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Serial / Date</th>
                        <th className="pb-3 font-bold">Client Name</th>
                        <th className="pb-3 font-bold">Type</th>
                        <th className="pb-3 font-bold">Business</th>
                        <th className="pb-3 font-bold">Location</th>
                        <th className="pb-3 font-bold text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repRecords.map((visit) => (
                        <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-2">
                            <span className="font-mono font-bold text-blue-700">{visit.serialNo}</span>
                            <div className="text-[11px] text-slate-500">
                              {visit.date} • {visit.time}
                            </div>
                          </td>

                          <td className="py-3 pr-2 font-bold text-slate-900 max-w-[150px] truncate" title={visit.clientName}>
                            {visit.clientName}
                          </td>

                          <td className="py-3 pr-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                visit.meetingType === 'Physical'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {visit.meetingType}
                            </span>
                          </td>

                          <td className="py-3 pr-2 font-mono">
                            <div className="text-emerald-700 font-bold">
                              {visit.businessLumpsum > 0 ? formatINR(visit.businessLumpsum) : '—'}
                            </div>
                            {visit.businessSip > 0 && (
                              <div className="text-[10px] text-purple-700 font-bold">
                                + {formatINR(visit.businessSip)}/mo
                              </div>
                            )}
                          </td>

                          <td className="py-3 pr-2 text-slate-700 max-w-[180px]">
                            <div className="truncate font-semibold text-slate-800" title={visit.location.locationName}>
                              {visit.location.locationName}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate" title={visit.location.formattedAddress}>
                              {visit.location.landmark || visit.location.formattedAddress}
                            </div>
                          </td>

                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => onOpenDetailsModal?.(visit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-700 hover:text-blue-700 font-bold cursor-pointer shadow-2xs"
                            >
                              View
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Friendly Cards for Phone */}
                <div className="sm:hidden space-y-2.5">
                  {repRecords.map((visit) => (
                    <div
                      key={visit.id}
                      onClick={() => onOpenDetailsModal?.(visit)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 space-y-2 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {visit.serialNo}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            visit.meetingType === 'Physical'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {visit.meetingType}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">{visit.clientName}</div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="font-mono text-emerald-700 font-bold">
                          {visit.businessLumpsum > 0 ? formatINR(visit.businessLumpsum) : 'No Lump'}
                        </div>
                        {visit.businessSip > 0 && (
                          <div className="font-mono text-purple-700 text-xs font-bold">
                            SIP: {formatINR(visit.businessSip)}/mo
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">
                        📍 {visit.location.locationName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
