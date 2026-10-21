import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Users2,
  Calendar,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Filter,
  BarChart3,
} from 'lucide-react';
import { VisitRecord, TimePeriod } from '../types';
import {
  calculateTeamSummary,
  calculateSalespersonAnalytics,
  formatINR,
} from '../utils/analytics';
import { LeafletMap } from './LeafletMap';

interface TeamAnalyticsProps {
  records: VisitRecord[];
  onSelectRep: (repName: string) => void;
  onOpenDetailsModal?: (record: VisitRecord) => void;
  onSimulateLiveCheckIn?: () => void;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({
  records,
  onSelectRep,
  onOpenDetailsModal,
  onSimulateLiveCheckIn,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  const summary = useMemo(() => calculateTeamSummary(records, selectedPeriod), [records, selectedPeriod]);

  // Unique reps analytics for the period
  const reps = useMemo(() => {
    const list = Array.from(
      new Set([
        'Nayan Sharma',
        'Rahul Verma',
        'Priya Patel',
        'Amit Singh',
        ...records.map((r) => r.salespersonName?.trim()).filter(Boolean),
      ])
    );
    return list.map((repName) => calculateSalespersonAnalytics(repName, records, selectedPeriod));
  }, [records, selectedPeriod]);

  // Sort reps by total volume
  const sortedReps = useMemo(() => {
    return [...reps].sort((a, b) => {
      const volA = a.totalLumpsum + a.totalSip * 12;
      const volB = b.totalLumpsum + b.totalSip * 12;
      return volB - volA;
    });
  }, [reps]);

  // Periodic team report comparison
  const teamReportBreakdown = useMemo(() => {
    const periods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
    return periods.map((p) => {
      const s = calculateTeamSummary(records, p);
      return {
        period: p,
        label: p === 'daily' ? 'Daily (Today)' : p === 'weekly' ? 'Weekly (7 Days)' : p === 'monthly' ? 'Monthly' : 'Yearly',
        visits: s.totalVisits,
        physical: s.totalPhysical,
        calls: s.totalCalls,
        lumpsum: s.totalLumpsum,
        sip: s.totalSip,
        totalVolume: s.totalLumpsum + s.totalSip * 12,
        activeReps: s.activeRepsCount,
        topPerformer: s.topPerformer,
      };
    });
  }, [records]);

  const periodOptions: { label: string; value: TimePeriod }[] = [
    { label: 'Daily (Today)', value: 'daily' },
    { label: 'Weekly (7 Days)', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'All-Time', value: 'all' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 sm:pb-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Operations Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Performance Analytics & Conversion Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit intelligence, deal velocity, team leaderboard, and certified GPS telemetry verification.
          </p>
        </div>

        {onSimulateLiveCheckIn && (
          <button
            type="button"
            onClick={onSimulateLiveCheckIn}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all shadow-2xs cursor-pointer min-h-[44px]"
          >
            <Zap className="w-4 h-4 text-blue-600" />
            Simulate Real-time Check-In
          </button>
        )}
      </div>

      {/* Report Analysis Period Filter Tabs */}
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

      {/* Top 4 Global KPI Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Scheduled */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total Scheduled ({selectedPeriod})
          </div>
          <div className="text-3xl font-black text-slate-900 mb-2">{summary.totalVisits}</div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-emerald-700 font-bold">{summary.totalPhysical} Physical</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{summary.totalCalls} Calls</span>
          </div>
        </div>

        {/* GPS Verified */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            GPS Verified
          </div>
          <div className="text-3xl font-black text-emerald-700 mb-2">
            {summary.overallGpsRate}%
          </div>
          <div className="text-xs text-emerald-700 font-bold">
            Precise Coordinates Logged
          </div>
        </div>

        {/* Lumpsum Business */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Lumpsum Business ({selectedPeriod})
          </div>
          <div className="text-3xl font-black text-emerald-700 mb-2">
            {formatINR(summary.totalLumpsum)}
          </div>
          <div className="text-xs text-slate-500 font-medium">Recorded across scheduled deals</div>
        </div>

        {/* SIP Business */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            SIP Business ({selectedPeriod})
          </div>
          <div className="text-3xl font-black text-purple-700 mb-2">
            {formatINR(summary.totalSip)}
            <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">Monthly recurring commitments</div>
        </div>
      </div>

      {/* Team Report Analysis Breakdown (Daily, Weekly, Monthly, Yearly) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Team Periodic Report Analysis (Daily, Weekly, Monthly & Yearly)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of team deal flow, field volume, and top producers across key operating horizons.
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
                <th className="pb-3 font-bold">Horizon</th>
                <th className="pb-3 font-bold">Visits Logged</th>
                <th className="pb-3 font-bold">Physical / Call</th>
                <th className="pb-3 font-bold">Lumpsum Deals</th>
                <th className="pb-3 font-bold">Monthly SIP Book</th>
                <th className="pb-3 font-bold">Combined Volume</th>
                <th className="pb-3 font-bold text-right">Leading Performer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamReportBreakdown.map((row) => {
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
                    <td className="py-3.5 pr-3 font-bold text-slate-800">
                      {row.visits} visits
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
                      {row.topPerformer || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Rep Performance Leaderboard */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Sales Representative Performance Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by total booked volume for {selectedPeriod}. Click any rep to open their individual performance dashboard.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Active Reps: <strong className="text-slate-900">{sortedReps.length}</strong>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Rank & Rep</th>
                <th className="pb-3 font-bold">Visits (Phys / Call)</th>
                <th className="pb-3 font-bold">Schedule Closure</th>
                <th className="pb-3 font-bold">Lumpsum Deals</th>
                <th className="pb-3 font-bold">Monthly SIP</th>
                <th className="pb-3 font-bold">GPS Accuracy</th>
                <th className="pb-3 font-bold">Performance Tier</th>
                <th className="pb-3 font-bold text-right">Individual Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedReps.map((rep, idx) => {
                const totalVol = rep.totalLumpsum + rep.totalSip * 12;
                return (
                  <tr
                    key={rep.name}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectRep(rep.name)}
                  >
                    <td className="py-3.5 pr-3 font-medium">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {rep.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium">
                            Vol: {formatINR(totalVol)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-slate-900">{rep.totalVisits} visits</div>
                      <div className="text-[10px] text-slate-500">
                        {rep.physicalVisits} Phys • {rep.callVisits} Calls
                      </div>
                    </td>

                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rep.completionRate}%</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${rep.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold text-emerald-700">
                      {formatINR(rep.totalLumpsum)}
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold text-purple-700">
                      {formatINR(rep.totalSip)}
                      <span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </td>

                    <td className="py-3.5 pr-3">
                      <span className="font-mono font-bold text-blue-700">
                        {rep.gpsComplianceRate}%
                      </span>
                    </td>

                    <td className="py-3.5 pr-3">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          rep.tier === 'Top Producer'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : rep.tier === 'Strong Performer'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : rep.tier === 'Active Performer'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {rep.tier}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRep(rep.name);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer min-h-[36px]"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Rep KPIs
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Friendly Cards for Phone */}
        <div className="md:hidden space-y-3">
          {sortedReps.map((rep, idx) => {
            const totalVol = rep.totalLumpsum + rep.totalSip * 12;
            return (
              <div
                key={rep.name}
                onClick={() => onSelectRep(rep.name)}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 space-y-2.5 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">{rep.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rep.tier === 'Top Producer'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {rep.tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px]">Total Volume:</span>
                    <div className="font-mono font-bold text-slate-900">{formatINR(totalVol)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Visits ({selectedPeriod}):</span>
                    <div className="font-bold text-slate-900">{rep.totalVisits} visits</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Lumpsum:</span>
                    <div className="font-mono font-bold text-emerald-700">{formatINR(rep.totalLumpsum)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">SIP:</span>
                    <div className="font-mono font-bold text-purple-700">{formatINR(rep.totalSip)}/mo</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>View Full Performance Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Interactive Team Field Map */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Team GPS Telemetry & Geographic Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Interactive map of all field visits certified by Google Maps Grounding.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ● Live GPS Grounding Active
          </span>
        </div>

        <LeafletMap
          center={[28.6139, 77.209]}
          zoom={5}
          markers={records}
          className="h-80 w-full rounded-xl border border-slate-200"
          onSelectVisit={onOpenDetailsModal}
        />
      </div>
    </div>
  );
};
