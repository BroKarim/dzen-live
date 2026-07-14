import { getAllProfiles } from "@/server/admin/queries";
import { ProfileTable } from "@/components/admin/profile-table";

export const metadata = {
  title: "Admin — Profiles",
};

export default async function AdminProfilesPage() {
  const profiles = await getAllProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All user profiles across the platform
        </p>
      </div>
      <ProfileTable profiles={profiles} />
    </div>
  );
}
