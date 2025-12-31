import { ReportDashboard } from "@/features/admin/components/dashboard/reports/report-dashboard";

export default function CustomReportPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <ReportDashboard period="custom" title="Laporan Kustom" />
    </div>
  );
}


