import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      {/* Add today's check-ins, check-outs, occupancy percentage, and quick navigation here */}
    </div>
  );
}
