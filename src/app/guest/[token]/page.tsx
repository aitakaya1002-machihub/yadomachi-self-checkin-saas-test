import { redirect } from "next/navigation";

type LegacyGuestPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LegacyGuestPage({ params }: LegacyGuestPageProps) {
  const { token } = await params;
  redirect(`/guest/checkin/${token}`);
}
