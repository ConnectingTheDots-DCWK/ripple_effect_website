import { NextResponse } from "next/server";

import { signedAssetUrl } from "@/lib/releases";

export const runtime = "nodejs";
// Never cached: the URL this hands back is signed and expires within minutes,
// so a cached redirect is a broken download a few minutes later.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Not a valid asset." }, { status: 400 });
  }

  const url = await signedAssetUrl(Number(id));
  if (!url) {
    return NextResponse.json(
      { error: "That download is not part of the current release." },
      { status: 404 }
    );
  }

  return NextResponse.redirect(url, 302);
}
