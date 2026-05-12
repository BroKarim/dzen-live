"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CountryItem {
  name: string;
  value: number;
}

interface VisitorLocationsProps {
  data: CountryItem[];
}

const getCountryCode = (countryInput: string): string => {
  const trimmed = countryInput.trim().toUpperCase();

  if (trimmed.length === 2) {
    return trimmed;
  }

  const countryMap: Record<string, string> = {
    "united states": "US",
    usa: "US",
    "united kingdom": "GB",
    uk: "GB",
    india: "IN",
    bangladesh: "BD",
    nigeria: "NG",
    turkey: "TR",
    canada: "CA",
    australia: "AU",
    germany: "DE",
    france: "FR",
    japan: "JP",
    china: "CN",
    brazil: "BR",
    russia: "RU",
    "south korea": "KR",
    spain: "ES",
    italy: "IT",
    mexico: "MX",
    indonesia: "ID",
    philippines: "PH",
    vietnam: "VN",
    thailand: "TH",
    pakistan: "PK",
    egypt: "EG",
    "south africa": "ZA",
    poland: "PL",
    netherlands: "NL",
    belgium: "BE",
    sweden: "SE",
    norway: "NO",
    denmark: "DK",
    finland: "FI",
    switzerland: "CH",
    austria: "AT",
    portugal: "PT",
    greece: "GR",
    ireland: "IE",
    "new zealand": "NZ",
    singapore: "SG",
    malaysia: "MY",
    argentina: "AR",
    chile: "CL",
    colombia: "CO",
    peru: "PE",
    venezuela: "VE",
  };

  const lower = countryInput.toLowerCase().trim();
  return countryMap[lower] || trimmed.substring(0, 2);
};

const getCountryName = (countryCode: string, originalName: string): string => {
  const codeMap: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    IN: "India",
    BD: "Bangladesh",
    NG: "Nigeria",
    TR: "Turkey",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    CN: "China",
    BR: "Brazil",
    RU: "Russia",
    KR: "South Korea",
    ES: "Spain",
    IT: "Italy",
    MX: "Mexico",
    ID: "Indonesia",
    PH: "Philippines",
    VN: "Vietnam",
    TH: "Thailand",
    PK: "Pakistan",
    EG: "Egypt",
    ZA: "South Africa",
    PL: "Poland",
    NL: "Netherlands",
    BE: "Belgium",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    CH: "Switzerland",
    AT: "Austria",
    PT: "Portugal",
    GR: "Greece",
    IE: "Ireland",
    NZ: "New Zealand",
    SG: "Singapore",
    MY: "Malaysia",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colombia",
    PE: "Peru",
    VE: "Venezuela",
  };

  return codeMap[countryCode] || originalName;
};

const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function VisitorLocations({ data }: VisitorLocationsProps) {
  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  const getShare = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(0) : "0";
  };

  const sortedData = data.toSorted((a, b) => b.value - a.value).slice(0, 10);

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Countries</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1">
          <div className="grid grid-cols-[30px_1fr_50px_60px] gap-2 p-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider border-b border-white/5 mb-1">
            <div className="text-center">#</div>
            <div>Country</div>
            <div className="text-right">Clicks</div>
            <div className="text-right">Share</div>
          </div>
          {sortedData.map((item) => {
            const countryCode = getCountryCode(item.name);
            const countryName = getCountryName(countryCode, item.name);
            const flag = getCountryFlag(countryCode);
            const share = getShare(item.value, total);

            return (
              <div key={item.name} className="grid grid-cols-[30px_1fr_50px_60px] gap-2 items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="text-lg text-center shrink-0 opacity-80">{flag}</div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{countryName}</div>
                </div>
                <div className="text-[11px] font-bold text-right text-muted-foreground">{item.value.toLocaleString()}</div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-md min-w-[35px] inline-block text-center">{share}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
