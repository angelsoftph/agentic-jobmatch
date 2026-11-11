import { NextResponse } from "next/server"
import type { ErrorBody } from "../../types/domain"

export function seedInvalidResponse(): NextResponse<ErrorBody> {
  const body: ErrorBody = {
    error: "Seed data is invalid",
    code: "seed_invalid",
  }
  return NextResponse.json(body, { status: 500 })
}

export function badRequestResponse(): NextResponse<ErrorBody> {
  const body: ErrorBody = {
    error: "Bad request",
    code: "bad_request",
  }
  return NextResponse.json(body, { status: 400 })
}

export function notFoundResponse(error: string): NextResponse<ErrorBody> {
  const body: ErrorBody = {
    error,
    code: "not_found",
  }
  return NextResponse.json(body, { status: 404 })
}
