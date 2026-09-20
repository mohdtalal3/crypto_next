import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
  }
}

export function apiError(error: unknown) {
  const appError = error instanceof AppError
    ? error
    : new AppError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  return NextResponse.json(
    { success: false, error: { code: appError.code, message: appError.message } },
    { status: appError.status },
  );
}
