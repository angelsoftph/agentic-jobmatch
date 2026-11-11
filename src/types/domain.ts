/**
 * Domain contract from docs/architecture.md.
 * Constants and types only. No functions.
 */

export const SKILL_WEIGHT = 70
export const EXPERIENCE_WEIGHT = 30
export const SCORE_SCALE = 10000

export type Candidate = {
  id: string
  name: string
  skills: string[]
  yearsExperience: number
}

export type Job = {
  id: string
  title: string
  requiredSkills: string[]
  minYearsExperience: number
}

export type MatchLabel = "Strong" | "Partial" | "Weak"

export type Match = {
  candidateId: string
  jobId: string
  candidateName: string
  jobTitle: string
  skillBasis: number
  experienceBasis: number
  overallBasis: number
  skill: string
  experience: string
  overall: string
  matchedSkills: string[]
  missingSkills: string[]
  label: MatchLabel
  explanation: string
}

export type MatchResponse = {
  formula: { skillWeight: 70; experienceWeight: 30; scale: 10000 }
  matches: Match[]
}

export type ErrorBody = {
  error: string
  code: "bad_request" | "not_found" | "seed_invalid"
}
