import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { TInvoiceStatus } from "@/app/lib/definitions";
import InvoiceStatus from "./status";
import {
  createAuditLog,
  updateInvoiceStatus,
  updateInvoiceStatusAndCreateAuditLog,
} from "@/app/lib/actions";

type StatusDropdownItem = {
  label: string;
  status: TInvoiceStatus;
};

const STATUS_DROPDOWN_ITEMS: StatusDropdownItem[] = [
  {
    label: "Mark as Paid",
    status: "paid",
  },
  {
    label: "Mark as Pending",
    status: "pending",
  },
  {
    label: "Mark as Canceled",
    status: "canceled",
  },
  {
    label: "Mark as Overdue",
    status: "overdue",
  },
];

type Props = {
  id: string;
  currentStatus: TInvoiceStatus;
};

export default function StatusDropdown({ id, currentStatus }: Props) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton>
          <InvoiceStatus status={currentStatus} />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          {STATUS_DROPDOWN_ITEMS.filter(
            (item) => item.status !== currentStatus
          ).map((item) => {
            const action = updateInvoiceStatusAndCreateAuditLog.bind(null, {
              action_type: "change",
              invoice_id: id,
              old_status: currentStatus,
              new_status: item.status,
            });

            return (
              <StatusDropdownItem
                key={item.status}
                label={item.label}
                action={action}
              />
            );
          })}
        </div>
      </MenuItems>
    </Menu>
  );
}

function StatusDropdownItem({
  label,
  action,
}: {
  label: string;
  action: () => void;
}) {
  return (
    <form action={action}>
      <MenuItem>
        <button
          className="block w-full px-4 py-2 text-left text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
          type="submit"
        >
          {label}
        </button>
      </MenuItem>
    </form>
  );
}
