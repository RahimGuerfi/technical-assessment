import { InvoiceAuditLog } from "@/app/lib/definitions";
import { formatDateToLocal } from "@/app/lib/utils";
import React from "react";
import { RestoreInvoiceState } from "./buttons";

type Props = {
  auditLogs: InvoiceAuditLog[];
};

export default function AuditLogsList({ auditLogs }: Props) {
  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6 mt-6 space-y-2">
      <p className="font-medium">Audit logs</p>
      {auditLogs.map((item) => (
        <AuditLogsListItem key={item.date} item={item} />
      ))}

      {auditLogs.length === 0 && (
        <p className="text-sm">No audit logs found!</p>
      )}
    </div>
  );
}

function AuditLogsListItem({ item }: { item: InvoiceAuditLog }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-[14px] py-3">
      <p className="text-sm">
        <span className="font-medium">{item.name}</span> performed a{" "}
        <span className="font-medium">{item.action_type}</span> action on{" "}
        <span className="font-medium">{formatDateToLocal(item.date)}</span> from{" "}
        <span className="capitalize font-medium">{item.old_status}</span> to{" "}
        <span className="capitalize font-medium">{item.new_status}</span>.
      </p>

      <RestoreInvoiceState
        id={item.invoice_id}
        newStatus={item.old_status}
        oldStatus={item.new_status}
      />
    </div>
  );
}
