import { getAllUsers } from "@/server/admin/queries";
import { UserTable } from "@/components/admin/user-table";

export const metadata = {
  title: "Admin — Users",
};

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform users
        </p>
      </div>
      <UserTable users={users} />
    </div>
  );
}
