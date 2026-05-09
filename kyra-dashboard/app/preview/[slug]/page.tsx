import { Suspense } from "react";
import { PreviewWorkspace } from "./PreviewWorkspace";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Loading preview…
        </div>
      }
    >
      <PreviewWorkspace slug={slug} />
    </Suspense>
  );
}
