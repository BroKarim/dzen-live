import { Palette, BarChart3, Settings, User, LucideIcon } from "lucide-react";

export type TabType = "profile" | "design" | "analytic" | "setting";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabType; icon: LucideIcon; label: string }[] = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "design", icon: Palette, label: "Design" },
    { id: "analytic", icon: BarChart3, label: "Analytics" },
    { id: "setting", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex justify-center px-6 w-full border-b">
      <div className="flex flex-1 justify-between gap-2 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={` flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${activeTab === tab.id ? "bg-black" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              title={tab.label}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
