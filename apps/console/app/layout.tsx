import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  BarChart3,
  ShieldCheck,
  Palette,
  FileText,
  Image,
  ClipboardList,
  Settings,
} from "lucide-react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kyra — Brand Intelligence",
  description: "Brand state management, compliance validation, and governance console",
};

const NAV = [
  { label: "Activity", href: "/", Icon: BarChart3 },
  { label: "Compliance", href: "/compliance", Icon: ShieldCheck },
  { label: "Tokens", href: "/tokens", Icon: Palette },
  { label: "Voice", href: "/voice", Icon: FileText },
  { label: "Assets", href: "/assets", Icon: Image },
  { label: "Audit", href: "/audit", Icon: ClipboardList },
  { label: "Settings", href: "/settings", Icon: Settings },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex">
        {/* Sidebar */}
        <nav className="w-56 bg-gray-950 text-white flex flex-col flex-shrink-0">
          <div className="px-5 py-5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-950 text-sm font-bold">K</span>
            </div>
            <div>
              <div className="text-base font-semibold">Kyra</div>
              <div className="text-[10px] text-gray-400 tracking-wide uppercase">Brand Intelligence</div>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-0.5 px-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <item.Icon size={16} strokeWidth={1.75} />
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-auto px-4 py-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">v0.1.0 · Brand Core API</div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
