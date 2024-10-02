import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  cancelInvoice,
  deleteInvoice,
  updateInvoiceStatusAndCreateAuditLog,
} from "@/app/lib/actions";
import { TInvoiceStatus } from "@/app/lib/definitions";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function CancelInvoice({ id }: { id: string }) {
  const cancelInvoiceWithId = cancelInvoice.bind(null, id);

  return (
    <form action={cancelInvoiceWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Cancel</span>
        <XMarkIcon className="w-5" />
      </button>
    </form>
  );
}

export function RestoreInvoiceState({
  id,
  oldStatus,
  newStatus,
}: {
  id: string;
  oldStatus: TInvoiceStatus;
  newStatus: TInvoiceStatus;
}) {
  const action = updateInvoiceStatusAndCreateAuditLog.bind(null, {
    action_type: "restore",
    invoice_id: id,
    old_status: oldStatus,
    new_status: newStatus,
  });

  return (
    <form action={action}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Restore</span>
        <ArrowPathIcon className="w-5" />
      </button>
    </form>
  );
}
