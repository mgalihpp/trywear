import { ReportDashboard } from "@/features/admin/components/dashboard/reports/report-dashboard";

export default function MonthlyReportPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <ReportDashboard period="monthly" title="Laporan Bulanan" />
    </div>
  );
}


