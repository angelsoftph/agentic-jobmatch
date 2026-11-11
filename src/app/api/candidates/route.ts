import { connection, NextResponse } from "next/server"
import { loadCandidates } from "../../../lib/data/load"
import { seedInvalidResponse } from "../respond"

export async function GET(): Promise<NextResponse> {
  await connection()
  try {
    return NextResponse.json(loadCandidates())
  } catch {
    return seedInvalidResponse()
  }
}
