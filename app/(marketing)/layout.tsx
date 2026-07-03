export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
