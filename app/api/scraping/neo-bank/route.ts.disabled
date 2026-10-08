import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncTool } from "@/services/sync.service";
import { apiError, AppError } from "@/lib/utils/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  try {
    const session = await getSession();
    if (!session) throw new AppError("UNAUTHORIZED", "Log in first.", 401);
    return NextResponse.json({ success: true, data: await syncTool(session, "neo") });
  } catch (error) { return apiError(error); }
}
