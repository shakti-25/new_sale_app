import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSalespersonAnalytics,
  calculateTeamSummary,
  filterRecordsByPeriod,
  formatINR,
  type VisitRecord,
} from './analytics.ts';

const mockRecords: VisitRecord[] = [
  {
    id: 'rec-1',
    serialNo: 'DS-001',
    date: '2026-10-19',
    time: '11:15',
    salespersonName: 'Nayan Sharma',
    clientName: 'Tata Consultancy Services',
    meetingType: 'Physical',
    scheduleDone: true,
    followUpDate: '2026-10-26',
    businessLumpsum: 750000,
    businessSip: 25000,
    remarks: 'Verified client requirement for equity growth portfolio',
    location: {
      latitude: 28.62892,
      longitude: 77.20653,
      accuracy: 12,
      locationName: 'Barakhamba Road, Connaught Place',
      formattedAddress: 'Barakhamba Road, Connaught Place, New Delhi, Delhi 110001',
      landmark: 'Statesman House',
      timestamp: '2026-10-19T11:15:00Z',
    },
    verifiedAt: '2026-10-19T11:15:30Z',
    status: 'Verified & Synced',
  },
  {
    id: 'rec-2',
    serialNo: 'DS-002',
    date: '2026-10-19',
    time: '14:30',
    salespersonName: 'Nayan Sharma',
    clientName: 'Religare Broking Corp',
    meetingType: 'Call',
    scheduleDone: true,
    followUpDate: '2026-10-28',
    businessLumpsum: 250000,
    businessSip: 15000,
    remarks: 'Virtual review call with finance director',
    location: {
      latitude: 28.535517,
      longitude: 77.391029,
      accuracy: 10,
      locationName: 'Sector 62, Noida',
      formattedAddress: 'Sector 62, Noida, Uttar Pradesh 201309',
      landmark: 'Electronic City',
      timestamp: '2026-10-19T14:30:00Z',
    },
    verifiedAt: '2026-10-19T14:30:15Z',
    status: 'Verified & Synced',
  },
  {
    id: 'rec-3',
    serialNo: 'DS-003',
    date: '2026-10-19',
    time: '16:00',
    salespersonName: 'Rahul Verma',
    clientName: 'HCL Technologies Campus',
    meetingType: 'Physical',
    scheduleDone: false,
    followUpDate: '2026-10-22',
    businessLumpsum: 400000,
    businessSip: 20000,
    remarks: 'Preliminary meeting with HR operations for corporate SIPs',
    location: {
      latitude: 28.5355,
      longitude: 77.391,
      accuracy: 15,
      locationName: 'Sector 126, Noida Expressway',
      formattedAddress: 'Sector 126, Noida, Uttar Pradesh 201303',
      landmark: 'HCL Towers',
      timestamp: '2026-10-19T16:00:00Z',
    },
    verifiedAt: '2026-10-19T16:00:05Z',
    status: 'Verified & Synced',
  },
];

test('calculateSalespersonAnalytics computes actual totals for Nayan Sharma', () => {
  const analytics = calculateSalespersonAnalytics('Nayan Sharma', mockRecords);

  assert.equal(analytics.name, 'Nayan Sharma');
  assert.equal(analytics.totalVisits, 2);
  assert.equal(analytics.physicalVisits, 1);
  assert.equal(analytics.callVisits, 1);
  assert.equal(analytics.completedSchedules, 2);
  assert.equal(analytics.completionRate, 100);
  assert.equal(analytics.totalLumpsum, 1000000);
  assert.equal(analytics.totalSip, 40000);
  assert.equal(analytics.avgLumpsumDeal, 500000);
  assert.equal(analytics.tier, 'Top Producer');
  assert.ok(analytics.aiInsights.length > 0);
});

test('filterRecordsByPeriod correctly filters daily, weekly, monthly and yearly records', () => {
  const refDate = new Date(2026, 9, 19); // Oct 19, 2026
  const daily = filterRecordsByPeriod(mockRecords, 'daily', refDate);
  assert.equal(daily.length, 3);

  const weekly = filterRecordsByPeriod(mockRecords, 'weekly', refDate);
  assert.equal(weekly.length, 3);

  const monthly = filterRecordsByPeriod(mockRecords, 'monthly', refDate);
  assert.equal(monthly.length, 3);

  const yearly = filterRecordsByPeriod(mockRecords, 'yearly', refDate);
  assert.equal(yearly.length, 3);
});

test('calculateSalespersonAnalytics handles zero-record salesperson gracefully', () => {
  const analytics = calculateSalespersonAnalytics('Unknown Rep', mockRecords);

  assert.equal(analytics.name, 'Unknown Rep');
  assert.equal(analytics.totalVisits, 0);
  assert.equal(analytics.totalLumpsum, 0);
  assert.equal(analytics.totalSip, 0);
  assert.equal(analytics.completionRate, 0);
  assert.equal(analytics.tier, 'Getting Started');
});

test('calculateTeamSummary calculates aggregate actual performance across all reps', () => {
  const summary = calculateTeamSummary(mockRecords);

  assert.equal(summary.totalVisits, 3);
  assert.equal(summary.totalPhysical, 2);
  assert.equal(summary.totalCalls, 1);
  assert.equal(summary.totalLumpsum, 1400000);
  assert.equal(summary.totalSip, 60000);
  assert.equal(summary.activeRepsCount, 2);
  assert.equal(summary.topPerformer, 'Nayan Sharma');
});

test('formatINR formats currency numbers properly', () => {
  assert.equal(formatINR(750000), 'Rs. 7,50,000');
  assert.equal(formatINR(0), 'Rs. 0');
});
