import { createClient } from "@/utils/supabase/client";

export default async function StudentDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id , subscription_type, status")
    .eq("user_id", user?.id)
    .eq("status", "active");

  return (
    <div className="container max-w-7xl mx-auto">
      <h1 className="text-3xl mb-6">Welcome, {user?.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="text-xl">Recent Orders</h2>
          <ul>
            {orders?.map((order) => (
              <li key={order.id}>
                Order #{order.id} - {order.status} - ₹{order.total_amount}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h2 className="text-xl">Active Subscriptions</h2>
          <ul>
            {subscriptions?.map((sub) => (
              <li key={sub.id}>
                {sub.subscription_type} - {sub.status}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
