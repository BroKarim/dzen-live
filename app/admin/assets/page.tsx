import { getAssetSummary, getAllAssets } from "@/server/admin/queries";
import { AssetTable } from "@/components/admin/asset-table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Admin — Assets",
};

export default async function AdminAssetsPage() {
  const [summary, assets] = await Promise.all([
    getAssetSummary(),
    getAllAssets(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage uploaded images across the platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Total Assets</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Active</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-emerald-500">{summary.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Orphaned</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-amber-500">{summary.orphaned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">By Type</p>
            <div className="mt-2 space-y-1">
              {summary.byType.map((b) => (
                <div key={b.type} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{b.type}</span>
                  <span className="font-medium tabular-nums">{b.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AssetTable assets={assets} />
    </div>
  );
}
