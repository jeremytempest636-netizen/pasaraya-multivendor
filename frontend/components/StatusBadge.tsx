import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/types";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  PAID: "bg-blue-50 text-blue-800 ring-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${styles[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
