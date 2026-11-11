import { connection, NextResponse } from "next/server"
import { loadJobs } from "../../../lib/data/load"
import { seedInvalidResponse } from "../respond"

export async function GET(): Promise<NextResponse> {
  await connection()
  try {
    return NextResponse.json(loadJobs())
  } catch {
    return seedInvalidResponse()
  }
}
