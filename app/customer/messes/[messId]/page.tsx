import MessDetailPage from "@/components/customer/mess-page";

export default async function MessPage({
  params,
}: {
  params: { messId: string };
}) {
  return <MessDetailPage messId={(await params).messId} />;
}
