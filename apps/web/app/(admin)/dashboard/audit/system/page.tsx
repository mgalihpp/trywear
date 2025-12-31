import { AuditLogTable } from "@/features/admin/components/audit/audit-log-table";

export default function SystemEventsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Sistem</h1>
          <p className="text-muted-foreground mt-2">
            Riwayat event sistem otomatis
          </p>
        </div>
      </div>

      <AuditLogTable type="system" />
    </div>
  );
}
