import { POST as sync } from "@/app/api/sync/route";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Compatibility alias for the former Flask POST /sync endpoint. */
export async function POST(request: Request) {
  return sync(request);
}
