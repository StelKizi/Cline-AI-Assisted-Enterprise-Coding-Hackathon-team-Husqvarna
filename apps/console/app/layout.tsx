import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kyra Console",
  description: "Brand intelligence governance console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, -apple-system, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar */}
          <nav style={{
            width: 240,
            background: "#111",
            color: "#fff",
            padding: "24px 0",
            flexShrink: 0,
          }}>
            <div style={{ padding: "0 20px 24px", fontSize: 18, fontWeight: 700 }}>
              Kyra
            </div>
            {[
              { label: "Activity", href: "/activity", icon: "📊" },
              { label: "Rules", href: "/rules", icon: "📋" },
              { label: "Assets", href: "/assets", icon: "🖼️" },
              { label: "Audit", href: "/audit", icon: "📝" },
              { label: "Settings", href: "/settings", icon: "⚙️" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  color: "#ccc",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Main content */}
          <main style={{ flex: 1, padding: 32, background: "#fafafa" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
