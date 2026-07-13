import { getAdminStats } from "@/server/admin/queries";
import { StatsCard } from "@/components/admin/stats-card";

export const metadata = {
  title: "Admin — Overview",
};

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Users" value={stats.totalUsers} />
        <StatsCard label="Total Profiles" value={stats.totalProfiles} />
        <StatsCard label="Total Links" value={stats.totalLinks} />
        <StatsCard label="Total Clicks" value={stats.totalClicks} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="Published"
          value={stats.publishedProfiles}
          secondary={`${stats.totalProfiles > 0 ? Math.round((stats.publishedProfiles / stats.totalProfiles) * 100) : 0}% of all profiles`}
        />
        <StatsCard
          label="Unpublished"
          value={stats.unpublishedProfiles}
        />
        <StatsCard
          label="Onboarded Users"
          value={stats.onboaredUsers}
          secondary={`${stats.totalUsers > 0 ? Math.round((stats.onboaredUsers / stats.totalUsers) * 100) : 0}% completion rate`}
        />
      </div>
    </div>
  );
}
