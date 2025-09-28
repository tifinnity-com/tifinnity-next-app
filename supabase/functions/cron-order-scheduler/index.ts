
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient }  from "jsr:@supabase/supabase-js@2"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } })

    const today = new Date().toISOString().split('T')[0];

    const { data: subscriptions, error : subError } = await supabase.from("subscriptions").select("*").eq("status", "active").lte("end_date", today).gte("start_date", today);

    if (subError) { 
      throw error;
    }

    const orders = [];

    for (const subscription of subscriptions) { 
      const {data: menus, error: menuError} = await supabase.from("mess_menus").select("id, price").eq("mess_id", subscription.mess_id).eq("menu_date", today).eq("available", true).limit(1);

      if (menuError || !menus.length) { 
        console.log(`No available menu for mess ${subscription.mess_id} on ${today}`);
        continue;
      
      }

      //Insert Order
      const { data: order, error: orderError } = await supabase.from("orders").insert({
      
        user_id: subscription.user_id,
        mess_id: subscription.mess_id,
        menu_id: menus.id,
        subscription_id: subscription.id,
        order_date: new Date().toISOString(),
        status: "placed",
        total_amount: menus.price,
        created_at: new Date().toISOString(),
      }).select().single();

      orders.push(order);


    }
    
    return new Response(JSON.stringify({ message: 'Subscription orders generated', orders }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
 }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cron-order-scheduler' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
