"use client";

import { useState } from "react";
import { TabNavigation, TabType, ProfileTab, DesignTab, AnalyticsTab, SettingsTab } from "@/components/control-panel";
// import { AnalyticsTabSoon } from "@/components/control-panel/analytics-tab-soon";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface ControlPanelProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export default function ControlPanel({ profile, onUpdate }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [mountedTabs, setMountedTabs] = useState<Partial<Record<TabType, boolean>>>({
    profile: true,
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMountedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  return (
    <div className="hidden w-[500px] flex-col gap-4 overflow-y-auto bg-[#181819] shadow-dzenn border-none rounded-2xl lg:flex no-scrollbar">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1">
        <div className={activeTab === "profile" ? "block" : "hidden"}>{mountedTabs.profile && <ProfileTab profile={profile} onUpdate={onUpdate} />}</div>
        <div className={activeTab === "design" ? "block" : "hidden"}>{mountedTabs.design && <DesignTab profile={profile} onUpdate={onUpdate} />}</div>
        <div className={activeTab === "analytic" ? "block" : "hidden"}>{mountedTabs.analytic && <AnalyticsTab links={profile.links} />}</div>
        <div className={activeTab === "setting" ? "block" : "hidden"}>{mountedTabs.setting && <SettingsTab profile={profile} />}</div>
      </div>
    </div>
  );
}
