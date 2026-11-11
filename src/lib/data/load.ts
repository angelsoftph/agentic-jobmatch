import { readFileSync } from "node:fs"
import path from "node:path"
import type { Candidate, Job } from "../../types/domain"
import { uniqueSkills } from "../match/normalize"

const ID_PATTERN = /^[a-z0-9-]{1,64}$/
const MIN_RECORDS = 1
const MAX_RECORDS = 20
const MAX_LABEL_LENGTH = 80
const MAX_SKILL_LENGTH = 40
const MIN_YEARS = 0
const MAX_YEARS = 60

export class SeedInvalidError extends Error {
  readonly code = "seed_invalid" as const

  constructor() {
    super("Seed data is invalid")
    this.name = "SeedInvalidError"
  }
}

function reject(): never {
  throw new SeedInvalidError()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isWellFormedId(value: string): boolean {
  return ID_PATTERN.test(value)
}

function parseId(value: unknown, seen: Set<string>): string {
  if (typeof value !== "string" || !ID_PATTERN.test(value) || seen.has(value)) {
    reject()
  }
  seen.add(value)
  return value
}

function parseLabel(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_LABEL_LENGTH) {
    reject()
  }
  return value
}

function parseYears(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < MIN_YEARS ||
    value > MAX_YEARS
  ) {
    reject()
  }
  return value
}

function parseSkillList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    reject()
  }
  const skills: string[] = []
  for (const skill of value) {
    if (typeof skill !== "string" || skill.length === 0 || skill.length > MAX_SKILL_LENGTH) {
      reject()
    }
    skills.push(skill)
  }
  return skills
}

export function parseCandidates(value: unknown): Candidate[] {
  if (!Array.isArray(value) || value.length < MIN_RECORDS || value.length > MAX_RECORDS) {
    reject()
  }
  const seen = new Set<string>()
  const candidates: Candidate[] = []
  for (const item of value) {
    if (!isRecord(item)) {
      reject()
    }
    const skills = parseSkillList(item.skills)
    candidates.push({
      id: parseId(item.id, seen),
      name: parseLabel(item.name),
      skills,
      yearsExperience: parseYears(item.yearsExperience),
    })
  }
  return candidates
}

export function parseJobs(value: unknown): Job[] {
  if (!Array.isArray(value) || value.length < MIN_RECORDS || value.length > MAX_RECORDS) {
    reject()
  }
  const seen = new Set<string>()
  const jobs: Job[] = []
  for (const item of value) {
    if (!isRecord(item)) {
      reject()
    }
    const requiredSkills = parseSkillList(item.requiredSkills)
    if (uniqueSkills(requiredSkills).length === 0) {
      reject()
    }
    jobs.push({
      id: parseId(item.id, seen),
      title: parseLabel(item.title),
      requiredSkills,
      minYearsExperience: parseYears(item.minYearsExperience),
    })
  }
  return jobs
}

function readSeedDocument(fileName: "candidates.json" | "jobs.json"): unknown {
  const filePath = path.join(process.cwd(), "data", fileName)
  let text: string
  try {
    text = readFileSync(filePath, "utf8")
  } catch {
    reject()
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    reject()
  }
}

export function loadCandidates(): Candidate[] {
  return parseCandidates(readSeedDocument("candidates.json"))
}

export function loadJobs(): Job[] {
  return parseJobs(readSeedDocument("jobs.json"))
}

export function loadSeed(): { candidates: Candidate[]; jobs: Job[] } {
  return {
    candidates: loadCandidates(),
    jobs: loadJobs(),
  }
}
