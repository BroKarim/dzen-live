import { getAllUsers } from "@/server/admin/queries";
import { UserTable } from "@/components/admin/user-table";
import { UserTableToolbar } from "@/components/admin/user-table-toolbar";
import { Pagination } from "@/components/admin/pagination";

export const metadata = {
  title: "Admin — Users",
};

interface Props {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage(props: Props) {
  const sp = await props.searchParams;
  const search = sp.q || "";
  const role = sp.role === "ADMIN" ? "ADMIN" : sp.role === "USER" ? "USER" : null;
  const page = parseInt(sp.page || "1", 10);

  const result = await getAllUsers({ search, role, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform users
        </p>
      </div>
      <UserTableToolbar
        initialSearch={search}
        initialRole={role}
      />
      <UserTable users={result.users} />
      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
