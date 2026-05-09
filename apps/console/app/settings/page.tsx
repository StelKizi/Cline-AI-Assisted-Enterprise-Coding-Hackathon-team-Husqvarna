import { CircleCheck, Circle } from "lucide-react";
export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">API keys, plan limits, and integrations</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* API Key */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-700 mb-3">API Key</div>
          <div className="flex items-center gap-3">
            <input
              readOnly
              value="kyra_live_••••••••••••••••"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-mono text-gray-500"
            />
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Reveal
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-700 mb-3">Plan</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">Pro</div>
              <div className="text-xs text-gray-500">50,000 API calls / month</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700 tabular-nums">12,847 / 50,000</div>
              <div className="w-32 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "25.7%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-700 mb-3">Integrations</div>
          <div className="space-y-3">
            {[
              { name: "Figma Plugin", status: "connected" },
              { name: "MCP Server", status: "connected" },
              { name: "Canva Plugin", status: "not connected" },
              { name: "GitHub Action", status: "connected" },
            ].map((int) => (
              <div key={int.name} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{int.name}</span>
                <span className={`text-xs font-medium ${
                  int.status === "connected" ? "text-green-600" : "text-gray-400"
                }`}>
                  {int.status === "connected" ? (<><CircleCheck size={14} className="inline mr-1" /> Connected</>) : (<><Circle size={14} className="inline mr-1" /> Not connected</>)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
