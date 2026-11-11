import { connection, NextResponse } from "next/server"
import { isWellFormedId, loadSeed } from "../../../lib/data/load"
import { scoreMatches } from "../../../lib/match/score"
import { badRequestResponse, notFoundResponse, seedInvalidResponse } from "../respond"

const ALLOWED_QUERY_KEYS = new Set(["candidateId", "jobId"])

function readOptionalId(
  params: URLSearchParams,
  key: "candidateId" | "jobId",
): string | null | "invalid" {
  if (!params.has(key)) {
    return null
  }
  const value = params.get(key)
  if (value === null || value.length === 0 || !isWellFormedId(value)) {
    return "invalid"
  }
  return value
}

function missingMessage(
  candidateId: string | null,
  jobId: string | null,
  candidateMissing: boolean,
  jobMissing: boolean,
): string {
  if (candidateMissing && jobMissing) {
    return `Candidate ${candidateId} and job ${jobId} were not found`
  }
  if (candidateMissing) {
    return `Candidate ${candidateId} was not found`
  }
  return `Job ${jobId} was not found`
}

export async function GET(request: Request): Promise<NextResponse> {
  await connection()
  const params = new URL(request.url).searchParams
  for (const key of params.keys()) {
    if (!ALLOWED_QUERY_KEYS.has(key)) {
      return badRequestResponse()
    }
  }

  const candidateId = readOptionalId(params, "candidateId")
  const jobId = readOptionalId(params, "jobId")
  if (candidateId === "invalid" || jobId === "invalid") {
    return badRequestResponse()
  }

  try {
    const { candidates, jobs } = loadSeed()
    const candidateMissing =
      candidateId !== null && !candidates.some((candidate) => candidate.id === candidateId)
    const jobMissing = jobId !== null && !jobs.some((job) => job.id === jobId)
    if (candidateMissing || jobMissing) {
      return notFoundResponse(missingMessage(candidateId, jobId, candidateMissing, jobMissing))
    }

    const selectedCandidates =
      candidateId === null
        ? candidates
        : candidates.filter((candidate) => candidate.id === candidateId)
    const selectedJobs = jobId === null ? jobs : jobs.filter((job) => job.id === jobId)
    return NextResponse.json(scoreMatches(selectedCandidates, selectedJobs))
  } catch {
    return seedInvalidResponse()
  }
}
