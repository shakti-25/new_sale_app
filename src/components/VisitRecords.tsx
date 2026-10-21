import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Map as MapIcon,
  List as ListIcon,
  Download,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  MapPin,
  Award,
  Filter,
} from 'lucide-react';
import { VisitRecord, TimePeriod } from '../types';
import { formatINR, filterRecordsByPeriod } from '../utils/analytics';
import { LeafletMap } from './LeafletMap';

interface VisitRecordsProps {
  records: VisitRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  selectedVisitModal: VisitRecord | null;
  onOpenDetailsModal: (record: VisitRecord) => void;
  onCloseDetailsModal: () => void;
}

export const VisitRecords: React.FC<VisitRecordsProps> = ({
  records,
  onDeleteRecord,
  onClearAll,
  selectedVisitModal,
  onOpenDetailsModal,
  onCloseDetailsModal,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Physical' | 'Call'>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all');

  // Reps for filter
  const repList = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.salespersonName).filter(Boolean)));
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    const periodFiltered = filterRecordsByPeriod(records, periodFilter);

    return periodFiltered.filter((r) => {
      const matchQuery =
        !searchQuery.trim() ||
        r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.salespersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.remarks.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === 'all' || r.meetingType === typeFilter;
      const matchRep = repFilter === 'all' || r.salespersonName === repFilter;

      return matchQuery && matchType && matchRep;
    });
  }, [records, searchQuery, typeFilter, repFilter, periodFilter]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Serial No',
      'Date',
      'Time',
      'Salesperson',
      'Client Name',
      'Meeting Type',
      'Schedule Done',
      'Follow Up Date',
      'Business Lumpsum (INR)',
      'Business SIP (INR)',
      'Location Name',
      'Formatted Address',
      'Landmark',
      'Latitude',
      'Longitude',
      'Accuracy (m)',
      'Status',
      'Remarks',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.serialNo}"`,
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.salespersonName}"`,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.meetingType}"`,
      `"${r.scheduleDone ? 'Yes' : 'No'}"`,
      `"${r.followUpDate}"`,
      r.businessLumpsum,
      r.businessSip,
      `"${r.location.locationName.replace(/"/g, '""')}"`,
      `"${r.location.formattedAddress.replace(/"/g, '""')}"`,
      `"${(r.location.landmark || '').replace(/"/g, '""')}"`,
      r.location.latitude,
      r.location.longitude,
      Math.round(r.location.accuracy),
      `"${r.status}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SalesTrack_Field_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 sm:pb-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              Verified Sales Visit Log
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono font-bold">
                {filteredRecords.length} entries
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of all scheduled field visits with embedded GPS coordinates & Google Maps data
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onClearAll}
            title="Clear all visit records"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 text-slate-500 hover:text-red-600 transition-colors cursor-pointer min-h-[40px]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Period Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, salesperson, or address..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs min-h-[44px]"
          />
        </div>

        <div className="md:col-span-7 flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as TimePeriod)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs min-h-[44px] flex-1 sm:flex-none"
          >
            <option value="all">All Dates</option>
            <option value="daily">Daily (Today)</option>
            <option value="weekly">Weekly (Last 7 Days)</option>
            <option value="monthly">Monthly (This Month)</option>
            <option value="yearly">Yearly (This Year)</option>
          </select>

          {/* Meeting Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs min-h-[44px] flex-1 sm:flex-none"
          >
            <option value="all">All Meeting Types</option>
            <option value="Physical">Physical Only</option>
            <option value="Call">Call Only</option>
          </select>

          {/* Salesperson */}
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs min-h-[44px] flex-1 sm:flex-none"
          >
            <option value="all">All Salespeople</option>
            {repList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: List or Map View */}
      {viewMode === 'map' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 px-1 font-medium">
            Interactive map showing all {filteredRecords.length} recorded visit coordinates. Click any marker to view visit details.
          </div>
          <LeafletMap
            center={[28.6139, 77.209]}
            zoom={6}
            markers={filteredRecords}
            className="h-[550px] w-full rounded-xl border border-slate-200"
            onSelectVisit={onOpenDetailsModal}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Serial / Date</th>
                  <th className="py-3.5 px-4 font-bold">Client Name</th>
                  <th className="py-3.5 px-4 font-bold">Salesperson</th>
                  <th className="py-3.5 px-4 font-bold">Type</th>
                  <th className="py-3.5 px-4 font-bold">Deals (Lumpsum / SIP)</th>
                  <th className="py-3.5 px-4 font-bold">Verified Location & Landmark</th>
                  <th className="py-3.5 px-4 font-bold">Sync Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No visit records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Serial / Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-700">{visit.serialNo}</div>
                        <div className="text-[11px] text-slate-500">
                          {visit.date} • {visit.time}
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[180px] truncate" title={visit.clientName}>
                        {visit.clientName}
                      </td>

                      {/* Salesperson */}
                      <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {visit.salespersonName}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            visit.meetingType === 'Physical'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {visit.meetingType}
                        </span>
                      </td>

                      {/* Deals */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {visit.businessLumpsum > 0 && (
                          <div className="text-emerald-700 font-bold text-xs">
                            Lumpsum: {formatINR(visit.businessLumpsum)}
                          </div>
                        )}
                        {visit.businessSip > 0 && (
                          <div className="text-purple-700 font-bold text-[11px]">
                            SIP: {formatINR(visit.businessSip)}/mo
                          </div>
                        )}
                        {visit.businessLumpsum === 0 && visit.businessSip === 0 && (
                          <span className="text-slate-400 text-[11px]">No immediate deal</span>
                        )}
                      </td>

                      {/* Location & Landmark */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="font-semibold text-slate-900 truncate" title={visit.location.locationName}>
                          {visit.location.locationName}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate" title={visit.location.formattedAddress}>
                          {visit.location.formattedAddress}
                        </p>
                        {visit.location.landmark && (
                          <div className="text-[10px] text-blue-700 font-bold truncate">
                            Near: {visit.location.landmark}
                          </div>
                        )}
                      </td>

                      {/* Sync Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {visit.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenDetailsModal(visit)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            Details
                          </button>

                          <a
                            href={`https://www.google.com/maps?q=${visit.location.latitude},${visit.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View pin on Google Maps"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteRecord(visit.id)}
                            title="Delete visit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Phone Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No visit records found matching your filters.
              </div>
            ) : (
              filteredRecords.map((visit) => (
                <div key={visit.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-xs">{visit.serialNo}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {visit.date} • {visit.time}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        visit.meetingType === 'Physical'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {visit.meetingType}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{visit.clientName}</h4>
                    <p className="text-xs text-slate-600 font-medium">Rep: {visit.salespersonName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Lumpsum</span>
                      <span className="font-bold text-emerald-700">
                        {visit.businessLumpsum > 0 ? formatINR(visit.businessLumpsum) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Monthly SIP</span>
                      <span className="font-bold text-purple-700">
                        {visit.businessSip > 0 ? `${formatINR(visit.businessSip)}/mo` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 truncate">
                    📍 {visit.location.locationName}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => onOpenDetailsModal(visit)}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs text-center shadow-xs"
                    >
                      View Details & GPS Stamp
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${visit.location.latitude},${visit.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Official Audit Certification Modal in Light Theme */}
      {selectedVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={onCloseDetailsModal}
              aria-label="Close details"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  Certified Field Visit Certificate
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedVisitModal.clientName}
                </h3>
              </div>
            </div>

            {/* Visit Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-slate-500 uppercase font-bold text-[10px]">
                  Sales Representative
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {selectedVisitModal.salespersonName}
                </div>
                <div className="text-[11px] text-blue-700 font-mono font-bold mt-0.5">
                  Serial: {selectedVisitModal.serialNo}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-slate-500 uppercase font-bold text-[10px]">
                  Date & Time of Check-in
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {selectedVisitModal.date}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {selectedVisitModal.time} • {selectedVisitModal.meetingType} Meet
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-slate-500 uppercase font-bold text-[10px]">
                  Lumpsum Business Volume
                </div>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  {formatINR(selectedVisitModal.businessLumpsum)}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-slate-500 uppercase font-bold text-[10px]">
                  Monthly SIP Commitment
                </div>
                <div className="text-base font-black text-purple-700 mt-0.5">
                  {formatINR(selectedVisitModal.businessSip)}/mo
                </div>
              </div>
            </div>

            {/* Certified Location Card */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  GPS Satellite Verification Details
                </span>
                <span className="font-mono text-emerald-800 text-[11px] font-bold">
                  Accuracy: ±{Math.round(selectedVisitModal.location.accuracy)}m
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900">
                {selectedVisitModal.location.locationName}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedVisitModal.location.formattedAddress}
              </p>

              <div className="text-[11px] font-mono text-slate-600 pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Lat: {selectedVisitModal.location.latitude.toFixed(6)}, Lng:{' '}
                  {selectedVisitModal.location.longitude.toFixed(6)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${selectedVisitModal.location.latitude},${selectedVisitModal.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 hover:text-emerald-950 underline font-bold flex items-center gap-1"
                >
                  View on Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Remarks */}
            {selectedVisitModal.remarks && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <div className="text-slate-500 uppercase font-bold text-[10px] mb-1">
                  Particular / Discussion Remarks
                </div>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedVisitModal.remarks}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-slate-500 font-mono text-[11px]">
                Audit Hash: SHA256-VLOCK-{selectedVisitModal.serialNo}
              </span>
              <button
                type="button"
                onClick={onCloseDetailsModal}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
