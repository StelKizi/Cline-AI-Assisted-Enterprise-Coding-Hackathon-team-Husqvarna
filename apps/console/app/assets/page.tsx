import { fetchAssets } from "../api";

export const revalidate = 0;

export default async function AssetsPage() {
  let assets: any[] = [];

  try {
    assets = await fetchAssets();
  } catch (err) {
    assets = [];
  }

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-gray-900">Brand Assets Library</h1>
        <p className="text-sm text-gray-500 mt-1">Official logo marks, logotypes, and guidelines for Husqvarna Forest &amp; Garden</p>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <span className="text-4xl">🖼️</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">No Assets Found</h3>
          <p className="text-sm text-gray-500 mt-2">Connect the API server or check seed logs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-44 bg-gray-50 border-b border-gray-100 flex items-center justify-center p-6 relative">
                  <span className="absolute top-3 right-3 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {asset.type}
                  </span>
                  
                  {/* Serves the live logo directly from Hono API backend */}
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-h-24 max-w-full object-contain"
                    onError={(e) => {
                      // fallback representation if the server image doesn't render
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900">{asset.name}</h3>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {asset.dimensions ? `${asset.dimensions.width}x${asset.dimensions.height}px` : "Vector"} · {Math.round(asset.fileSizeBytes / 1024)}KB
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3 mb-4">
                    {asset.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {asset.prohibitedUses && asset.prohibitedUses.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1.5">Usage Constraints</div>
                      <ul className="list-disc pl-4 text-[11px] text-gray-600 space-y-1">
                        {asset.prohibitedUses.map((use: string, idx: number) => (
                          <li key={idx}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Uploaded {new Date(asset.uploadedAt).toLocaleDateString()}</span>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Download 📥
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
