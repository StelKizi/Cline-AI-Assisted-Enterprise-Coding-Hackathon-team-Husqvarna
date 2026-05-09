import type { Metadata } from "next";
import Link from "next/link";
import { buildKyraLandingDocument } from "@/lib/kyra/build-landing-document";

export const metadata: Metadata = {
  title: "Kyra — Landing",
  description: "Marketing landing rendered from Kyra design tokens and component contracts",
};

export default async function LandingPage() {
  const srcDoc = await buildKyraLandingDocument();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">Kyra landing</h1>
          <p className="text-xs text-gray-500 truncate">
            Token preview · same document builder as generated previews
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <Link href="/studio" className="text-gray-600 hover:text-black">
            Studio
          </Link>
          <Link href="/" className="text-gray-600 hover:text-black">
            Home
          </Link>
        </div>
      </header>

      <iframe
        title="Kyra marketing landing (token-driven HTML)"
        className="flex-1 w-full min-h-[calc(100vh-52px)] border-0 bg-gray-100"
        sandbox="allow-same-origin allow-top-navigation-by-user-activation"
        srcDoc={srcDoc}
      />
    </div>
  );
}
