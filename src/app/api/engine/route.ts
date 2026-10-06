import { NextResponse } from "next/server";

import { offerEngine } from "@/lib/engine";

export const runtime = "nodejs";

/**
 * The newest engine patch an installed editor may take — discovery only;
 * the bytes come from GitHub through `/go/engine`. See `src/lib/engine.ts`.
 *
 * `?contract=1.5&target=<rust triple>&bridge=<hash>&current=<version>`, and
 * `&channel=rc` from a build made to test the patch path, which is offered
 * release candidates too. Anything else is the stable channel.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const bridge = Number(query.get("bridge"));
  if (!Number.isInteger(bridge)) {
    return NextResponse.json(
      { available: false, problem: "bridge" },
      { status: 400 },
    );
  }
  return NextResponse.json(
    await offerEngine({
      contract: query.get("contract") ?? "",
      target: query.get("target") ?? "",
      bridge,
      current: query.get("current") ?? "",
      channel: query.get("channel") === "rc" ? "rc" : "stable",
    }),
  );
}
