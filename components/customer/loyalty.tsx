import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Gift, Medal, Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function LoyaltyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: points } = await supabase
    .from("loyalty_points")
    .select("id, points, reason, created_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, points_awarded, created_at")
    .eq("referrer_id", user?.id)
    .order("created_at", { ascending: false });

  const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Rewards</h1>
        <p className="text-muted-foreground">Track your points and referral bonuses.</p>
      </div>
      <Card className="mb-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy /> Total Points</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold">{totalPoints}</p>
          <p className="mt-2 text-primary-foreground/80">Earn points with every tiffin order and referral!</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Medal /> Points History</CardTitle>
            <CardDescription>Detailed log of your earned points.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Points</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points?.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-bold">{point.points}</TableCell>
                    <TableCell>{point.reason}</TableCell>
                    <TableCell className="text-right">{new Date(point.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift /> Referrals</CardTitle>
            <CardDescription>Bonuses from your referred friends.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Points Awarded</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals?.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-bold">{referral.points_awarded}</TableCell>
                    <TableCell className="text-right">{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}