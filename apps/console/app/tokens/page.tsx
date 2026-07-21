import { ClipboardCopy } from "lucide-react";
import { fetchTokens } from "../api";

export const revalidate = 0;

interface Token {
  name: string;
  value: string;
}

export default async function TokensPage() {
  let tokenGroups: Array<{ name: string; tokens: Token[] }> = [];

  try {
    const data = await fetchTokens();
    const rawGroups = data.groups || {};

    // Group 1: Colors
    const colorsList: Token[] = [];
    if (rawGroups.color) {
      const walk = (obj: any, path: string = "") => {
        if (!obj || typeof obj !== "object") return;
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v)) {
            colorsList.push({ name: path ? `color.${path}.${k}` : `color.${k}`, value: v });
          } else if (typeof v === "object") {
            walk(v, path ? `${path}.${k}` : k);
          }
        }
      };
      walk(rawGroups.color);
    }
    
    if (colorsList.length > 0) {
      tokenGroups.push({ name: "Colors (Husqvarna Adjusted Colors +10% Black Mixed)", tokens: colorsList });
    }

    // Group 2: Spacing & Layout
    const spacingList: Token[] = [];
    if (rawGroups.spacing) {
      for (const [k, v] of Object.entries(rawGroups.spacing)) {
        if (v && typeof v === "object" && "$value" in v) {
          spacingList.push({ name: `spacing.${k}`, value: String((v as any).$value) });
        } else if (typeof v === "string" || typeof v === "number") {
          spacingList.push({ name: `spacing.${k}`, value: String(v) });
        }
      }
    }
    if (spacingList.length > 0) {
      tokenGroups.push({ name: "Spacing & Layout", tokens: spacingList });
    }

    // Group 3: Typography
    const typographyList: Token[] = [];
    if (rawGroups.typography) {
      for (const [k, v] of Object.entries(rawGroups.typography)) {
        if (v && typeof v === "object" && "$value" in v) {
          const valObj = (v as any).$value;
          const desc = `${valObj.fontFamily || "Inter"} | ${valObj.fontSize || "14px"} | weight ${valObj.fontWeight || "400"}`;
          typographyList.push({ name: `typography.${k}`, value: desc });
        }
      }
    }
    if (typographyList.length > 0) {
      tokenGroups.push({ name: "Typography Styles", tokens: typographyList });
    }
  } catch (err) {
    // Fallback if API fails
    tokenGroups = [
      {
        name: "Colors (Husqvarna Fallback)",
        tokens: [
          { name: "color.husqvarna.blue", value: "#00468C" },
          { name: "color.husqvarna.orange", value: "#C45A00" },
          { name: "color.functional.active-green", value: "#3A7D00" },
          { name: "color.functional.warning-red", value: "#B30000" },
        ],
      },
    ];
  }

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Design Tokens</h1>
        <p className="text-sm text-gray-500 mt-1">W3C Design Tokens parsed dynamically from Husqvarna's brand specifications</p>
      </div>

      <div className="space-y-8">
        {tokenGroups.map((group) => (
          <div key={group.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-4">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.tokens.map((t) => {
                const isColor = t.value.startsWith("#");
                return (
                  <div key={t.name} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    {isColor && (
                      <div
                        className="w-10 h-10 rounded-lg border border-gray-200 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: t.value }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-medium text-gray-800 truncate" title={t.name}>{t.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">{t.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
