import { fetchWamoconAppByPublicId } from "@/lib/actions";
import { WamoconAppDetail } from "./detail";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ publicId: string }> },
): Promise<Metadata> {
  const { publicId } = await params;
  const result = await fetchWamoconAppByPublicId(publicId);
  return {
    title: result ? `${result.app.name} — WAMOCON 50 Apps` : "App nicht gefunden",
  };
}

export default async function WamoconAppPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await fetchWamoconAppByPublicId(publicId);

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">App nicht gefunden</h1>
          <p className="text-gray-400">Die angeforderte WAMOCON App existiert nicht.</p>
        </div>
      </div>
    );
  }

  return <WamoconAppDetail app={result.app} waves={result.waves} users={result.users} />;
}
