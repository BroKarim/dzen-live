"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty, EmptyIcon, EmptyTitle } from "@/components/ui/empty";
import { Globe } from "lucide-react";
import { getReferrerIcon } from "./analytics-icons";

interface TrafficSource {
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  clicks: number;
}

interface TrafficSourcesSectionProps {
  referrers?: TrafficSource[];
  utmSources?: TrafficSource[];
  utmMediums?: TrafficSource[];
  utmCampaigns?: TrafficSource[];
}

const EMPTY_SOURCES: TrafficSource[] = [];

interface TrafficSourceListProps {
  data: TrafficSource[];
  getLabel: (item: TrafficSource) => string;
  getIcon?: (item: TrafficSource) => React.ReactNode;
}

function TrafficSourceList({ data, getLabel, getIcon }: TrafficSourceListProps) {
  const totalForShare = (data: TrafficSource[]) => {
    return data.reduce((sum, item) => sum + item.clicks, 0) || 1;
  };

  const getShare = (clicks: number, total: number) => {
    return total > 0 ? ((clicks / total) * 100).toFixed(2) : "0";
  };

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyIcon>
          <Globe />
        </EmptyIcon>
        <EmptyTitle>No data available</EmptyTitle>
      </Empty>
    );
  }

  const total = totalForShare(data);

  return (
    <div className="space-y-1">
      {data.map((item) => {
        const share = getShare(item.clicks, total);
        const label = getLabel(item);
        const IconComponent = getIcon ? getIcon(item) : null;
        const ReferrerIcon = item.referrer ? getReferrerIcon(item.referrer) : null;

        return (
          <div key={label} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {IconComponent || (ReferrerIcon && <ReferrerIcon className="size-3.5 opacity-70" />)}
              <span className="text-xs font-medium truncate">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-muted-foreground">{item.clicks}</span>
              <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-md min-w-[35px] text-center">{share}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrafficSourcesSection({ referrers = EMPTY_SOURCES, utmSources = EMPTY_SOURCES, utmMediums = EMPTY_SOURCES, utmCampaigns = EMPTY_SOURCES }: TrafficSourcesSectionProps) {
  const [activeTab, setActiveTab] = useState("referrers");

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/5 gap-0.5">
            <TabsTrigger value="referrers" className="p-1 h-7 text-[9px] leading-tight">
              Referrers
            </TabsTrigger>
            <TabsTrigger value="utm-sources" className="p-1 h-7 text-[9px] leading-tight">
              UTM Source
            </TabsTrigger>
            <TabsTrigger value="utm-mediums" className="p-1 h-7 text-[9px] leading-tight">
              UTM Medium
            </TabsTrigger>
            <TabsTrigger value="utm-campaigns" className="p-1 h-7 text-[9px] leading-tight">
              Campaign
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="referrers" className="m-0">
              <TrafficSourceList data={referrers} getLabel={(item) => item.referrer || "Unknown"} />
            </TabsContent>

            <TabsContent value="utm-sources" className="m-0">
              <TrafficSourceList data={utmSources} getLabel={(item) => item.source || "Unknown"} />
            </TabsContent>

            <TabsContent value="utm-mediums" className="m-0">
              <TrafficSourceList data={utmMediums} getLabel={(item) => item.medium || "Unknown"} />
            </TabsContent>

            <TabsContent value="utm-campaigns" className="m-0">
              <TrafficSourceList data={utmCampaigns} getLabel={(item) => item.campaign || "Unknown"} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
