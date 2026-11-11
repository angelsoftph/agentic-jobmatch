import {
  EXPERIENCE_WEIGHT,
  SCORE_SCALE,
  SKILL_WEIGHT,
  type Candidate,
  type Job,
  type Match,
  type MatchLabel,
  type MatchResponse,
} from "../../types/domain"
import { uniqueSkills } from "./normalize"

const BIGINT_ONE = BigInt(1)
const BIGINT_TWO = BigInt(2)
const BIGINT_HUNDRED = BigInt(100)

/**
 * Half-up integer division for non-negative numerator and denominator > 0.
 * Uses BigInt so the score path does not divide floating-point values.
 *
 * q = floor(numerator / denominator)
 * r = numerator % denominator
 * if r * 2 >= denominator then q + 1 else q
 */
export function divRoundHalfUp(numerator: number, denominator: number): number {
  const n = BigInt(numerator)
  const d = BigInt(denominator)
  const quotient = n / d
  const remainder = n % d
  if (remainder * BIGINT_TWO >= d) {
    return Number(quotient + BIGINT_ONE)
  }
  return Number(quotient)
}

/** Formats a basis integer as a two-decimal string. 6667 -> "66.67". */
export function formatBasis(basis: number): string {
  const value = BigInt(basis)
  const whole = (value / BIGINT_HUNDRED).toString()
  const fraction = (value % BIGINT_HUNDRED).toString().padStart(2, "0")
  return `${whole}.${fraction}`
}

function minInt(left: number, right: number): number {
  return left < right ? left : right
}

function labelFor(overallBasis: number): MatchLabel {
  if (overallBasis >= 8000) {
    return "Strong"
  }
  if (overallBasis >= 6000) {
    return "Partial"
  }
  return "Weak"
}

function compareUtf16(left: string, right: string): number {
  if (left < right) {
    return -1
  }
  if (left > right) {
    return 1
  }
  return 0
}

function compareMatches(left: Match, right: Match): number {
  if (left.overallBasis !== right.overallBasis) {
    return right.overallBasis - left.overallBasis
  }
  if (left.skillBasis !== right.skillBasis) {
    return right.skillBasis - left.skillBasis
  }
  const byCandidate = compareUtf16(left.candidateId, right.candidateId)
  if (byCandidate !== 0) {
    return byCandidate
  }
  return compareUtf16(left.jobId, right.jobId)
}

export function scorePair(candidate: Candidate, job: Job): Match {
  const required = uniqueSkills(job.requiredSkills)
  const candidateKeys = new Set(uniqueSkills(candidate.skills).map((skill) => skill.key))
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  for (const skill of required) {
    if (candidateKeys.has(skill.key)) {
      matchedSkills.push(skill.original)
    } else {
      missingSkills.push(skill.original)
    }
  }

  const matchedCount = matchedSkills.length
  const requiredCount = required.length
  const skillBasis = divRoundHalfUp(SCORE_SCALE * matchedCount, requiredCount)
  const experienceBasis =
    job.minYearsExperience === 0
      ? SCORE_SCALE
      : divRoundHalfUp(
          SCORE_SCALE * minInt(candidate.yearsExperience, job.minYearsExperience),
          job.minYearsExperience,
        )
  const overallBasis = divRoundHalfUp(
    SKILL_WEIGHT * skillBasis + EXPERIENCE_WEIGHT * experienceBasis,
    100,
  )
  const skill = formatBasis(skillBasis)
  const experience = formatBasis(experienceBasis)
  const overall = formatBasis(overallBasis)
  const missing = missingSkills.length === 0 ? "none" : missingSkills.join(", ")
  const explanation = `${candidate.name} matches ${matchedCount} of ${requiredCount} required skills for ${job.title} and has ${candidate.yearsExperience} years of experience against a minimum of ${job.minYearsExperience}. Overall ${overall} from skills ${skill} (weight ${SKILL_WEIGHT}) and experience ${experience} (weight ${EXPERIENCE_WEIGHT}). Missing: ${missing}.`

  return {
    candidateId: candidate.id,
    jobId: job.id,
    candidateName: candidate.name,
    jobTitle: job.title,
    skillBasis,
    experienceBasis,
    overallBasis,
    skill,
    experience,
    overall,
    matchedSkills,
    missingSkills,
    label: labelFor(overallBasis),
    explanation,
  }
}

export function scoreMatches(candidates: readonly Candidate[], jobs: readonly Job[]): MatchResponse {
  const matches: Match[] = []
  for (const candidate of candidates) {
    for (const job of jobs) {
      matches.push(scorePair(candidate, job))
    }
  }
  matches.sort(compareMatches)
  return {
    formula: {
      skillWeight: SKILL_WEIGHT,
      experienceWeight: EXPERIENCE_WEIGHT,
      scale: SCORE_SCALE,
    },
    matches,
  }
}
