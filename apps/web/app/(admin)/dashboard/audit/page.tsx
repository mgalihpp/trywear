import { AuditLogTable } from "@/features/admin/components/audit/audit-log-table";

export default function AuditLogsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Log Audit</h1>
          <p className="text-muted-foreground mt-2">
            Riwayat aktivitas pengguna dan sistem
          </p>
        </div>
      </div>

      <AuditLogTable />
    </div>
  );
}
