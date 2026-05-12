"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty, EmptyIcon, EmptyTitle } from "@/components/ui/empty";
import { Clock } from "lucide-react";

interface Page {
  title: string;
  url: string;
  clicks?: number;
  sessions?: number;
}

interface TimeAnalysisItem {
  date: string;
  clicks: number;
  sessions: number;
  visitors: number;
}

interface PagesSectionProps {
  link?: Page;
  timeAnalysis?: TimeAnalysisItem[];
}

const EMPTY_TIME_ANALYSIS: TimeAnalysisItem[] = [];

export function PagesSection({ link, timeAnalysis = EMPTY_TIME_ANALYSIS }: PagesSectionProps) {
  if (!link) return null;

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Pages</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Tabs defaultValue="top-pages">
          <TabsList className="grid w-full grid-cols-2 text-[10px] h-auto p-1 bg-white/5">
            <TabsTrigger value="top-pages" className="py-1 px-2 h-7">
              Top Pages
            </TabsTrigger>
            <TabsTrigger value="time-analysis" className="py-1 px-2 h-7">
              Time Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-pages" className="mt-4 m-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-xs font-medium truncate">{link.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate opacity-70">{link.url}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-muted-foreground">{link.clicks || 0}</span>
                  <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-md min-w-[35px] text-center">100%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time-analysis" className="mt-4 m-0">
            {timeAnalysis.length > 0 ? (
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {timeAnalysis.map((item) => (
                  <div key={item.date} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{item.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{item.clicks} clk</span>
                        <span className="text-[10px] text-muted-foreground">{item.sessions} ses</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="py-8">
                <EmptyIcon>
                  <Clock className="size-8 opacity-20" />
                </EmptyIcon>
                <EmptyTitle className="text-sm">No analysis data</EmptyTitle>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
