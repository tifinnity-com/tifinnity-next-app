"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl mb-6">Mess Owner Dashboard</h2>
      <nav>
        <Link
          href="/partner/dashboard/mess"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Mess Profile
        </Link>
        <Link
          href="/partner/dashboard/menu"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Menu Management
        </Link>
        <Link
          href="/partner/dashboard/orders"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Orders
        </Link>
        <Link
          href="/partner/dashboard/subscriptions"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Subscriptions
        </Link>
        <Link
          href="/partner/dashboard/payments"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Payments
        </Link>
        <Link
          href="/partner/dashboard/reviews"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Reviews
        </Link>
        <Link
          href="/partner/dashboard/coupons"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Coupons
        </Link>
        <Link
          href="/partner/dashboard/analytics"
          className="block py-2 px-4 hover:bg-gray-700"
        >
          Analytics
        </Link>
      </nav>
    </div>
  );
}
