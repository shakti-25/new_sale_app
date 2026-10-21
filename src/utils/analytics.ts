export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  locationName: string;
  formattedAddress: string;
  landmark: string;
  timestamp: string;
}

export type MeetingType = 'Physical' | 'Call';
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export interface VisitRecord {
  id: string;
  serialNo: string;
  date: string;
  time: string;
  salespersonName: string;
  clientName: string;
  meetingType: MeetingType;
  scheduleDone: boolean;
  followUpDate: string;
  businessLumpsum: number; // in INR
  businessSip: number; // monthly in INR
  remarks: string;
  location: GeoLocation;
  verifiedAt: string;
  status: 'Verified & Synced' | 'Pending Sync' | 'GPS Flagged';
}

export interface SalespersonAnalytics {
  name: string;
  period: TimePeriod;
  totalVisits: number;
  physicalVisits: number;
  callVisits: number;
  completedSchedules: number;
  completionRate: number; // 0 to 100
  totalLumpsum: number;
  totalSip: number;
  lumpsumDealsCount: number;
  sipDealsCount: number;
  avgLumpsumDeal: number;
  gpsVerifiedCount: number;
  gpsComplianceRate: number; // 0 to 100
  tier: 'Top Producer' | 'Strong Performer' | 'Active Performer' | 'Getting Started';
  aiInsights: string[];
}

export interface TeamAnalyticsSummary {
  period: TimePeriod;
  totalVisits: number;
  totalPhysical: number;
  totalCalls: number;
  totalLumpsum: number;
  totalSip: number;
  overallCompletionRate: number;
  overallGpsRate: number;
  activeRepsCount: number;
  topPerformer: string;
}

/**
 * Filter records by Daily, Weekly, Monthly, Yearly, or All
 */
export function filterRecordsByPeriod(
  records: VisitRecord[],
  period: TimePeriod,
  referenceDate = new Date()
): VisitRecord[] {
  if (period === 'all') return records;

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  const todayStart = new Date(refYear, refMonth, refDay);
  const todayEnd = new Date(refYear, refMonth, refDay, 23, 59, 59, 999);

  return records.filter((r) => {
    if (!r.date) return false;
    const [yStr, mStr, dStr] = r.date.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const d = parseInt(dStr, 10);
    const recordDate = new Date(y, m, d);

    switch (period) {
      case 'daily':
        return recordDate >= todayStart && recordDate <= todayEnd;
      case 'weekly': {
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(todayStart.getDate() - 7);
        return recordDate >= sevenDaysAgo && recordDate <= todayEnd;
      }
      case 'monthly':
        return y === refYear && m === refMonth;
      case 'yearly':
        return y === refYear;
      default:
        return true;
    }
  });
}

/**
 * Calculate individual salesperson performance analytics based purely on actual performance
 */
export function calculateSalespersonAnalytics(
  salespersonName: string,
  records: VisitRecord[],
  period: TimePeriod = 'all'
): SalespersonAnalytics {
  const periodRecords = filterRecordsByPeriod(records, period);
  const repRecords = periodRecords.filter(
    (r) => r.salespersonName.trim().toLowerCase() === salespersonName.trim().toLowerCase()
  );

  const totalVisits = repRecords.length;
  const physicalVisits = repRecords.filter((r) => r.meetingType === 'Physical').length;
  const callVisits = repRecords.filter((r) => r.meetingType === 'Call').length;
  const completedSchedules = repRecords.filter((r) => r.scheduleDone).length;
  const completionRate = totalVisits > 0 ? Math.round((completedSchedules / totalVisits) * 100) : 0;

  const totalLumpsum = repRecords.reduce((sum, r) => sum + (Number(r.businessLumpsum) || 0), 0);
  const totalSip = repRecords.reduce((sum, r) => sum + (Number(r.businessSip) || 0), 0);

  const lumpsumDealsCount = repRecords.filter((r) => (Number(r.businessLumpsum) || 0) > 0).length;
  const sipDealsCount = repRecords.filter((r) => (Number(r.businessSip) || 0) > 0).length;
  const avgLumpsumDeal = lumpsumDealsCount > 0 ? Math.round(totalLumpsum / lumpsumDealsCount) : 0;

  const gpsVerifiedCount = repRecords.filter(
    (r) => r.location && r.location.accuracy > 0 && r.location.accuracy <= 100
  ).length;
  const physicalCount = physicalVisits || 1;
  const gpsComplianceRate = Math.min(100, Math.round((gpsVerifiedCount / physicalCount) * 100));

  // Determine production tier purely from actual closed volume
  const totalRevenue = totalLumpsum + totalSip * 12;
  let tier: 'Top Producer' | 'Strong Performer' | 'Active Performer' | 'Getting Started' = 'Getting Started';
  if (totalRevenue >= 1000000 || totalVisits >= 5) {
    tier = 'Top Producer';
  } else if (totalRevenue >= 500000 || totalVisits >= 3) {
    tier = 'Strong Performer';
  } else if (totalVisits >= 1) {
    tier = 'Active Performer';
  } else {
    tier = 'Getting Started';
  }

  // Generate actionable AI insights based on real performance
  const aiInsights: string[] = [];
  const periodLabel =
    period === 'daily'
      ? 'today'
      : period === 'weekly'
      ? 'this week'
      : period === 'monthly'
      ? 'this month'
      : period === 'yearly'
      ? 'this year'
      : 'overall';

  if (totalLumpsum > 0) {
    aiInsights.push(
      `Closed Rs. ${totalLumpsum.toLocaleString('en-IN')} across ${lumpsumDealsCount} lumpsum deal${
        lumpsumDealsCount === 1 ? '' : 's'
      } (${periodLabel}).`
    );
  }

  if (totalSip > 0) {
    aiInsights.push(
      `Built Rs. ${totalSip.toLocaleString('en-IN')}/mo in recurring SIP commitments (Annualized: Rs. ${(
        totalSip * 12
      ).toLocaleString('en-IN')}).`
    );
  }

  if (physicalVisits > 0) {
    aiInsights.push(
      `Logged ${physicalVisits} verified in-person field check-ins with ${gpsComplianceRate}% satellite GPS precision.`
    );
  } else if (totalVisits > 0) {
    aiInsights.push(`Handled ${callVisits} remote/phone client interactions during this period.`);
  } else {
    aiInsights.push(`No field check-ins or meetings recorded for ${periodLabel}.`);
  }

  if (completionRate >= 80 && totalVisits > 0) {
    aiInsights.push(`High operational discipline with ${completionRate}% client meetings marked completed.`);
  }

  return {
    name: salespersonName,
    period,
    totalVisits,
    physicalVisits,
    callVisits,
    completedSchedules,
    completionRate,
    totalLumpsum,
    totalSip,
    lumpsumDealsCount,
    sipDealsCount,
    avgLumpsumDeal,
    gpsVerifiedCount,
    gpsComplianceRate,
    tier,
    aiInsights,
  };
}

/**
 * Pure function to aggregate overall team analytics
 */
export function calculateTeamSummary(
  records: VisitRecord[],
  period: TimePeriod = 'all'
): TeamAnalyticsSummary {
  const periodRecords = filterRecordsByPeriod(records, period);
  const totalVisits = periodRecords.length;
  const totalPhysical = periodRecords.filter((r) => r.meetingType === 'Physical').length;
  const totalCalls = periodRecords.filter((r) => r.meetingType === 'Call').length;
  const totalLumpsum = periodRecords.reduce((sum, r) => sum + (Number(r.businessLumpsum) || 0), 0);
  const totalSip = periodRecords.reduce((sum, r) => sum + (Number(r.businessSip) || 0), 0);

  const completed = periodRecords.filter((r) => r.scheduleDone).length;
  const overallCompletionRate = totalVisits > 0 ? Math.round((completed / totalVisits) * 100) : 0;

  const gpsCertified = periodRecords.filter((r) => r.status === 'Verified & Synced').length;
  const overallGpsRate = totalVisits > 0 ? Math.round((gpsCertified / totalVisits) * 100) : 100;

  const reps = Array.from(new Set(periodRecords.map((r) => r.salespersonName.trim()).filter(Boolean)));
  const activeRepsCount = reps.length;

  let topPerformer = reps[0] || 'None';
  let maxVolume = -1;
  for (const rep of reps) {
    const repSum = periodRecords
      .filter((r) => r.salespersonName.trim().toLowerCase() === rep.toLowerCase())
      .reduce((acc, curr) => acc + (Number(curr.businessLumpsum) || 0) + (Number(curr.businessSip) || 0) * 12, 0);
    if (repSum > maxVolume) {
      maxVolume = repSum;
      topPerformer = rep;
    }
  }

  return {
    period,
    totalVisits,
    totalPhysical,
    totalCalls,
    totalLumpsum,
    totalSip,
    overallCompletionRate,
    overallGpsRate,
    activeRepsCount,
    topPerformer,
  };
}

/**
 * Format currency in Indian Rupee standard format
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return 'Rs. 0';
  return 'Rs. ' + Number(val).toLocaleString('en-IN');
}
