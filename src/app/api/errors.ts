import { NextResponse } from "next/server";

export type ErrorResponse = NextResponse<{
  error: true;
  code: number;
  detail: string;
}>;

export class HttpError {
  constructor(public code: number, public detail?: string) {}

  toResponse(): ErrorResponse {
    return NextResponse.json(
      { error: true, code: this.code, detail: this.detail ?? "unknown" },
      { status: this.code }
    );
  }

  static mapErr(error: unknown): HttpError {
    return error instanceof HttpError
      ? error
      : new HttpError(500, `unknown: ${error}`);
  }

  static badRequest(detail?: string): HttpError {
    return new HttpError(400, detail);
  }

  static unauthorized(detail?: string): HttpError {
    return new HttpError(401, detail);
  }

  static notFound(detail?: string): HttpError {
    return new HttpError(404, detail);
  }
}
