import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TInvoiceStatus } from "@/app/lib/definitions";
import clsx from "clsx";

export default function InvoiceStatus({ status }: { status: TInvoiceStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs",
        {
          "bg-gray-100 text-gray-500": status === "pending",
          "bg-green-500 text-white": status === "paid",
          "bg-red-500 text-white": status === "canceled",
          "bg-yellow-500 text-white": status === "overdue",
        }
      )}
    >
      {status === "pending" ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === "paid" ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === "canceled" ? (
        <>
          Canceled
          <XMarkIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === "overdue" ? (
        <>
          Overdue
          <ExclamationTriangleIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
