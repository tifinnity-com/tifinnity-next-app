import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default async function LoyaltyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: points } = await supabase
    .from("loyalty_points")
    .select("id, points, reason, created_at")
    .eq("user_id", user?.id);
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, points_awarded, created_at")
    .eq("referrer_id", user?.id);
  const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Your Rewards</h1>
      <Card className="mb-6 bg-orange-50">
        <CardHeader>
          <CardTitle>Total Points: {totalPoints}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Earn points with every tiffin order and referral!</p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Points</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {points?.map((point) => (
                <tr key={point.id}>
                  <td className="border p-2">{point.points}</td>
                  <td className="border p-2">{point.reason}</td>
                  <td className="border p-2">{point.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Points Awarded</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals?.map((referral) => (
                <tr key={referral.id}>
                  <td className="border p-2">{referral.points_awarded}</td>
                  <td className="border p-2">{referral.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
