"use client"

import { useEffect, useState } from "react"
import {
  EXPERIENCE_WEIGHT,
  SCORE_SCALE,
  SKILL_WEIGHT,
  type Candidate,
  type Job,
  type Match,
  type MatchResponse,
} from "@/types/domain"

const DISCLAIMER =
  "Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision."

type MatchState =
  | { status: "loading" }
  | { status: "ready"; data: MatchResponse }
  | { status: "error"; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isCandidate(value: unknown): value is Candidate {
  if (!isRecord(value)) {
    return false
  }
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isStringArray(value.skills) &&
    typeof value.yearsExperience === "number"
  )
}

function isJob(value: unknown): value is Job {
  if (!isRecord(value)) {
    return false
  }
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isStringArray(value.requiredSkills) &&
    typeof value.minYearsExperience === "number"
  )
}

function isMatch(value: unknown): value is Match {
  if (!isRecord(value)) {
    return false
  }
  return (
    typeof value.candidateId === "string" &&
    typeof value.jobId === "string" &&
    typeof value.candidateName === "string" &&
    typeof value.jobTitle === "string" &&
    typeof value.overall === "string" &&
    typeof value.skill === "string" &&
    typeof value.experience === "string" &&
    (value.label === "Strong" ||
      value.label === "Partial" ||
      value.label === "Weak") &&
    isStringArray(value.missingSkills)
  )
}

function isMatchResponse(value: unknown): value is MatchResponse {
  if (!isRecord(value) || !isRecord(value.formula) || !Array.isArray(value.matches)) {
    return false
  }
  return (
    value.formula.skillWeight === SKILL_WEIGHT &&
    value.formula.experienceWeight === EXPERIENCE_WEIGHT &&
    value.formula.scale === SCORE_SCALE &&
    value.matches.every(isMatch)
  )
}

function matchesPath(candidateId: string, jobId: string): string {
  const params = new URLSearchParams()
  if (candidateId !== "") {
    params.set("candidateId", candidateId)
  }
  if (jobId !== "") {
    params.set("jobId", jobId)
  }
  const query = params.toString()
  if (query === "") {
    return "/api/matches"
  }
  return `/api/matches?${query}`
}

async function failureText(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (isRecord(body) && typeof body.code === "string" && body.code !== "") {
      return body.code
    }
  } catch {
    // The body was not JSON.
  }
  return "Request failed"
}

export default function Page() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidateId, setCandidateId] = useState("")
  const [jobId, setJobId] = useState("")
  const [attempt, setAttempt] = useState(0)
  const [matchState, setMatchState] = useState<MatchState>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadCatalogs() {
      try {
        const [candidatesResponse, jobsResponse] = await Promise.all([
          fetch("/api/candidates", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/jobs", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ])
        if (!active) {
          return
        }
        if (candidatesResponse.ok) {
          const body: unknown = await candidatesResponse.json()
          if (active && Array.isArray(body) && body.every(isCandidate)) {
            setCandidates(body)
          }
        }
        if (!active) {
          return
        }
        if (jobsResponse.ok) {
          const body: unknown = await jobsResponse.json()
          if (active && Array.isArray(body) && body.every(isJob)) {
            setJobs(body)
          }
        }
      } catch {
        // Catalog requests that fail leave the selects on All.
      }
    }

    void loadCatalogs()
    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setMatchState({ status: "loading" })

    async function loadMatches() {
      try {
        const response = await fetch(matchesPath(candidateId, jobId), {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!active) {
          return
        }
        if (!response.ok) {
          const message = await failureText(response)
          if (active) {
            setMatchState({ status: "error", message })
          }
          return
        }
        const body: unknown = await response.json()
        if (!active) {
          return
        }
        if (!isMatchResponse(body)) {
          setMatchState({ status: "error", message: "Request failed" })
          return
        }
        setMatchState({ status: "ready", data: body })
      } catch {
        if (active) {
          setMatchState({ status: "error", message: "Request failed" })
        }
      }
    }

    void loadMatches()
    return () => {
      active = false
      controller.abort()
    }
  }, [attempt, candidateId, jobId])

  return (
    <main>
      <h1>Job Match</h1>
      <p>{DISCLAIMER}</p>
      <div className="filters">
        <label>
          Candidate
          <select
            value={candidateId}
            onChange={(event) => {
              setCandidateId(event.target.value)
            }}
          >
            <option value="">All</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Job
          <select
            value={jobId}
            onChange={(event) => {
              setJobId(event.target.value)
            }}
          >
            <option value="">All</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {matchState.status === "loading" ? <p>Loading matches</p> : null}
      {matchState.status === "error" ? (
        <div>
          <p>{matchState.message}</p>
          <button
            type="button"
            onClick={() => {
              setAttempt((current) => current + 1)
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
      {matchState.status === "ready" ? (
        <p>
          Skills weight {matchState.data.formula.skillWeight}. Experience weight{" "}
          {matchState.data.formula.experienceWeight}.
        </p>
      ) : null}
      {matchState.status === "ready" && matchState.data.matches.length === 0 ? (
        <p>No matches</p>
      ) : null}
      {matchState.status === "ready" && matchState.data.matches.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Candidate</th>
                <th scope="col">Job</th>
                <th scope="col">Overall</th>
                <th scope="col">Skill</th>
                <th scope="col">Experience</th>
                <th scope="col">Label</th>
                <th scope="col">Missing skills</th>
              </tr>
            </thead>
            <tbody>
              {matchState.data.matches.map((match) => (
                <tr key={`${match.candidateId}:${match.jobId}`}>
                  <td>{match.candidateName}</td>
                  <td>{match.jobTitle}</td>
                  <td>{match.overall}</td>
                  <td>{match.skill}</td>
                  <td>{match.experience}</td>
                  <td>{match.label}</td>
                  <td>{match.missingSkills.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  )
}
