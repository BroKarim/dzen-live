import { getAllProfiles } from "@/server/admin/queries";

export const metadata = {
  title: "Admin — Profiles",
};

export default async function AdminProfilesPage() {
  const profiles = await getAllProfiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Username</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Display Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Published</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Background</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Links</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Clicks</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No profiles found
                </td>
              </tr>
            )}
            {profiles.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <a
                    href={`/${p.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    @{p.username}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.displayName ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.userName}</td>
                <td className="px-4 py-3">
                  {p.isPublished
                    ? <span className="text-green-600 dark:text-green-400">Yes</span>
                    : <span className="text-muted-foreground">No</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{p.bgType}</td>
                <td className="px-4 py-3 tabular-nums">{p.linkCount}</td>
                <td className="px-4 py-3 tabular-nums">{p.clickCount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
