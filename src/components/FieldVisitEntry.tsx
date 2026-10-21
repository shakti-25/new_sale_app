import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle,
  FileText,
  PhoneCall,
  Users2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  Compass,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeoLocation, MeetingType, VisitRecord } from '../types';
import { LeafletMap } from './LeafletMap';

interface FieldVisitEntryProps {
  currentLocation: GeoLocation;
  onRefreshLocation: () => void;
  onSelectPresetLocation?: (loc: Partial<GeoLocation> & { name?: string; address?: string }) => void;
  onSubmitVisit: (record: Omit<VisitRecord, 'id' | 'verifiedAt' | 'status'>) => void;
  nextSerialNo: string;
}

const SUGGESTED_REPS = ['Nayan Sharma', 'Rahul Verma', 'Priya Patel', 'Amit Singh'];

export const FieldVisitEntry: React.FC<FieldVisitEntryProps> = ({
  currentLocation,
  onRefreshLocation,
  onSelectPresetLocation,
  onSubmitVisit,
  nextSerialNo,
}) => {
  const [salespersonName, setSalespersonName] = useState('Nayan Sharma');
  const [serialNo, setSerialNo] = useState(nextSerialNo);
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [meetingType, setMeetingType] = useState<MeetingType>('Physical');
  const [scheduleDone, setScheduleDone] = useState(true);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [businessLumpsum, setBusinessLumpsum] = useState<string>('');
  const [businessSip, setBusinessSip] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  const [showTechCoords, setShowTechCoords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Verification flag: Is location active and valid?
  const isLocationLocked =
    currentLocation &&
    Boolean(currentLocation.latitude && currentLocation.longitude) &&
    currentLocation.accuracy <= 250;

  React.useEffect(() => {
    setSerialNo(nextSerialNo);
  }, [nextSerialNo]);

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(currentLocation.locationName || currentLocation.formattedAddress);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  const handleClear = () => {
    setClientName('');
    setBusinessLumpsum('');
    setBusinessSip('');
    setRemarks('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Location Enforcement
    if (!isLocationLocked) {
      setLocationError(
        'Location is strictly REQUIRED to certify this field visit. Please tap "Fetch Live Device Location" to lock GPS coordinates.'
      );
      return;
    }

    if (!salespersonName.trim()) {
      setLocationError('Please select or enter the sales representative name.');
      return;
    }
    if (!clientName.trim()) {
      setLocationError('Please enter the client or organization name.');
      return;
    }

    setLocationError(null);
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onSubmitVisit({
        serialNo: serialNo || nextSerialNo,
        date,
        time,
        salespersonName: salespersonName.trim(),
        clientName: clientName.trim(),
        meetingType,
        scheduleDone,
        followUpDate,
        businessLumpsum: Number(businessLumpsum) || 0,
        businessSip: Number(businessSip) || 0,
        remarks: remarks.trim(),
        location: {
          ...currentLocation,
          timestamp: new Date().toISOString(),
        },
      });

      setIsSubmitting(false);
      setSuccessToast(`Visit for "${clientName.trim()}" certified with GPS stamp!`);
      handleClear();

      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    }, 600);
  };

  const certifiedStampText = `--- VERIFIED VISIT LOCATION AUDIT ---
Location Name: ${currentLocation.locationName}
GPS Verification: Certified Location (±${Math.round(currentLocation.accuracy)}m)
Recorded At: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${new Date().toLocaleTimeString()}
Google Maps: https://www.google.com/maps?q=${currentLocation.latitude.toFixed(6)},${currentLocation.longitude.toFixed(6)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-24 sm:pb-8">
      {/* Mandatory GPS Status Notice Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
          isLocationLocked
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isLocationLocked
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-500 text-white shadow-xs'
            }`}
          >
            {isLocationLocked ? <Compass className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>{isLocationLocked ? 'GPS Location Locked & Required' : 'Location Required to Submit'}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isLocationLocked ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {isLocationLocked ? `±${Math.round(currentLocation.accuracy)}m Accuracy` : 'Action Required'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isLocationLocked
                ? `Location verification active: ${currentLocation.locationName}. Field certification will be stamped upon submit.`
                : 'Real-time device satellite location is mandatory for field visit certification. Tap below to fetch coordinates.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshLocation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer min-h-[42px]"
        >
          <Navigation className="w-4 h-4 animate-spin-once" />
          Fetch Live Device Location
        </button>
      </div>

      {/* Location Error Warning if submitted without location */}
      {locationError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed font-medium">
            <strong className="block text-sm font-bold text-red-700">Location Check Failed</strong>
            {locationError}
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm">Visit Certified & Synced Successfully</div>
              <div className="text-xs text-emerald-800">{successToast}</div>
            </div>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Telemetry & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: GPS Telemetry & Maps Grounding */}
        <div className="lg:col-span-5 space-y-5">
          {/* Map Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <h2 className="text-base font-bold text-slate-900">Fetched Real-Time Location</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Live satellite GPS audit lock from device telemetry
                </p>
              </div>

              <button
                type="button"
                onClick={onRefreshLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer min-h-[36px]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                Refetch
              </button>
            </div>

            {/* Interactive Leaflet Pin Map */}
            <div className="relative mb-4">
              <LeafletMap
                center={[currentLocation.latitude, currentLocation.longitude]}
                zoom={14}
                interactivePin={{
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                  label: currentLocation.locationName,
                }}
                className="h-56 w-full rounded-xl border border-slate-200"
              />
              <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-700 flex items-center gap-1.5 shadow-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                GPS Locked (±{Math.round(currentLocation.accuracy)}m)
              </div>
            </div>

            {/* Location Details Card */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Verified Location Name
                </span>
                <button
                  type="button"
                  onClick={handleCopyLocation}
                  className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedName ? 'Copied!' : 'Copy Name'}
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {currentLocation.locationName || 'Field Visit Location'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {currentLocation.formattedAddress}
                </p>
                {currentLocation.landmark && (
                  <div className="text-[11px] text-blue-800 font-medium mt-1">
                    Landmark: <span className="text-slate-900 font-semibold">{currentLocation.landmark}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-blue-100">
                <span className="font-mono text-[11px]">
                  Timestamp: {new Date().toLocaleTimeString()}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-bold"
                >
                  Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Technical Audit Coordinates Disclosure */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowTechCoords(!showTechCoords)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                <span>Technical Audit Coordinates (IT Reference)</span>
                {showTechCoords ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showTechCoords && (
                <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>Latitude: <span className="text-emerald-700 font-bold">{currentLocation.latitude.toFixed(6)}</span></div>
                  <div>Longitude: <span className="text-emerald-700 font-bold">{currentLocation.longitude.toFixed(6)}</span></div>
                  <div>Audit Accuracy: <span className="text-blue-700 font-bold">±{Math.round(currentLocation.accuracy)}m</span></div>
                  <div>Audit ISO Time: <span className="text-slate-500">{new Date().toISOString()}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Daily Sales Scheduling Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Verified Field Operations
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  DAILY SALES SCHEDULING DATA
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Entries will be recorded with real-time fetched location and certified GPS audit stamps.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                GPS Stamping Enforced
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Salesperson Name & Serial No */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label htmlFor="salesperson-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    SALE_PERSON_NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="salesperson-input"
                    type="text"
                    required
                    value={salespersonName}
                    onChange={(e) => setSalespersonName(e.target.value)}
                    placeholder="Enter sales representative name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                  {/* Quick Rep Suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUGGESTED_REPS.map((rep) => (
                      <button
                        key={rep}
                        type="button"
                        onClick={() => setSalespersonName(rep)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                          salespersonName === rep
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {rep}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="serial-no-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    SERIAL_NO. <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="serial-no-input"
                    type="text"
                    required
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    placeholder="e.g. DS-001"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-mono font-bold text-blue-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Date, Time & Client Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label htmlFor="date-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="time-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    TIME <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="time-input"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label htmlFor="client-name-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    CLIENT_NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: Meeting Type & Schedule Done */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Meeting Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    CALL / PHYSICAL MEET
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMeetingType('Physical')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                        meetingType === 'Physical'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Users2 className="w-4 h-4 text-emerald-600" />
                      <span>Physical Meet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMeetingType('Call')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                        meetingType === 'Call'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                      <span>Phone Call</span>
                    </button>
                  </div>
                  {meetingType === 'Physical' && (
                    <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                      <span>✓</span> GPS Satellite Certification Required & Active
                    </div>
                  )}
                </div>

                {/* Schedule Done & Follow-up */}
                <div>
                  <label htmlFor="followup-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    FOLLOW_UP_DATE & SCHEDULE_DONE
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="followup-input"
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                    />

                    <button
                      type="button"
                      onClick={() => setScheduleDone(!scheduleDone)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                        scheduleDone
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {scheduleDone ? 'Done' : 'Pending'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Business Lumpsum & Business SIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lumpsum */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="lumpsum-input" className="text-xs font-bold text-slate-800">
                      BUSSINESS_LUMPSUM (Rs.)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">One-time Deal</span>
                  </div>
                  <input
                    id="lumpsum-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={businessLumpsum}
                    onChange={(e) => setBusinessLumpsum(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBusinessLumpsum(String(amt))}
                        className="text-[10px] px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold shadow-2xs"
                      >
                        Rs. {(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIP */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="sip-input" className="text-xs font-bold text-slate-800">
                      BUSSINESS_SIP (Rs./mo)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Monthly Recurring</span>
                  </div>
                  <input
                    id="sip-input"
                    type="number"
                    min="0"
                    step="500"
                    value={businessSip}
                    onChange={(e) => setBusinessSip(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[5000, 10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBusinessSip(String(amt))}
                        className="text-[10px] px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold shadow-2xs"
                      >
                        Rs. {(amt / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Particular / Remarks */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="remarks-input" className="text-xs font-bold text-slate-700">
                    PATICULAR / REMARKS
                  </label>
                  <span className="text-[11px] text-slate-500">
                    GPS verification stamp will be appended automatically
                  </span>
                </div>
                <textarea
                  id="remarks-input"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter client discussion notes, product interest, proposal submitted, or next steps..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
                />
              </div>

              {/* Certified Audit Stamp Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Live Submission Location Audit (Certified GPS & Maps Stamp):
                  </span>
                  <span className="text-emerald-700 font-mono text-[11px] font-bold">
                    GPS Verified (±{Math.round(currentLocation.accuracy)}m)
                  </span>
                </div>
                <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200 leading-relaxed overflow-x-auto shadow-2xs">
                  {certifiedStampText}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors cursor-pointer min-h-[44px]"
                >
                  Clear Client
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isLocationLocked}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Certifying Location...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      Submit & Certify Visit Location
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
