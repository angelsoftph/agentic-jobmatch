import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { Candidate, Job, MatchLabel } from "../../src/types/domain"
import { normalizeSkill } from "../../src/lib/match/normalize"
import { divRoundHalfUp, formatBasis, scoreMatches, scorePair } from "../../src/lib/match/score"

const candidates: Candidate[] = [
  {
    id: "cand-ada-okonkwo",
    name: "Ada Okonkwo",
    skills: ["TypeScript", "React", "Node.js", "Accessibility"],
    yearsExperience: 6,
  },
  {
    id: "cand-mina-chen",
    name: "Mina Chen",
    skills: ["Python", "SQL", "Data modeling"],
    yearsExperience: 3,
  },
  {
    id: "cand-jordan-hale",
    name: "Jordan Hale",
    skills: ["React", "CSS", "Figma"],
    yearsExperience: 1,
  },
]

const jobs: Job[] = [
  {
    id: "job-frontend-engineer",
    title: "Frontend Engineer",
    requiredSkills: ["TypeScript", "React", "CSS"],
    minYearsExperience: 3,
  },
  {
    id: "job-fullstack-engineer",
    title: "Full Stack Engineer",
    requiredSkills: ["TypeScript", "React", "Node.js"],
    minYearsExperience: 4,
  },
  {
    id: "job-data-analyst",
    title: "Data Analyst",
    requiredSkills: ["Python", "SQL"],
    minYearsExperience: 2,
  },
]

type FixtureRow = {
  candidateId: string
  jobId: string
  skillBasis: number
  experienceBasis: number
  overallBasis: number
  skill: string
  experience: string
  overall: string
  label: MatchLabel
  matchedSkills: string[]
  missingSkills: string[]
  explanation: string
}

const fixtures: FixtureRow[] = [
  {
    candidateId: "cand-ada-okonkwo",
    jobId: "job-fullstack-engineer",
    skillBasis: 10000,
    experienceBasis: 10000,
    overallBasis: 10000,
    skill: "100.00",
    experience: "100.00",
    overall: "100.00",
    label: "Strong",
    matchedSkills: ["TypeScript", "React", "Node.js"],
    missingSkills: [],
    explanation:
      "Ada Okonkwo matches 3 of 3 required skills for Full Stack Engineer and has 6 years of experience against a minimum of 4. Overall 100.00 from skills 100.00 (weight 70) and experience 100.00 (weight 30). Missing: none.",
  },
  {
    candidateId: "cand-mina-chen",
    jobId: "job-data-analyst",
    skillBasis: 10000,
    experienceBasis: 10000,
    overallBasis: 10000,
    skill: "100.00",
    experience: "100.00",
    overall: "100.00",
    label: "Strong",
    matchedSkills: ["Python", "SQL"],
    missingSkills: [],
    explanation:
      "Mina Chen matches 2 of 2 required skills for Data Analyst and has 3 years of experience against a minimum of 2. Overall 100.00 from skills 100.00 (weight 70) and experience 100.00 (weight 30). Missing: none.",
  },
  {
    candidateId: "cand-ada-okonkwo",
    jobId: "job-frontend-engineer",
    skillBasis: 6667,
    experienceBasis: 10000,
    overallBasis: 7667,
    skill: "66.67",
    experience: "100.00",
    overall: "76.67",
    label: "Partial",
    matchedSkills: ["TypeScript", "React"],
    missingSkills: ["CSS"],
    explanation:
      "Ada Okonkwo matches 2 of 3 required skills for Frontend Engineer and has 6 years of experience against a minimum of 3. Overall 76.67 from skills 66.67 (weight 70) and experience 100.00 (weight 30). Missing: CSS.",
  },
  {
    candidateId: "cand-jordan-hale",
    jobId: "job-frontend-engineer",
    skillBasis: 6667,
    experienceBasis: 3333,
    overallBasis: 5667,
    skill: "66.67",
    experience: "33.33",
    overall: "56.67",
    label: "Weak",
    matchedSkills: ["React", "CSS"],
    missingSkills: ["TypeScript"],
    explanation:
      "Jordan Hale matches 2 of 3 required skills for Frontend Engineer and has 1 years of experience against a minimum of 3. Overall 56.67 from skills 66.67 (weight 70) and experience 33.33 (weight 30). Missing: TypeScript.",
  },
  {
    candidateId: "cand-jordan-hale",
    jobId: "job-fullstack-engineer",
    skillBasis: 3333,
    experienceBasis: 2500,
    overallBasis: 3083,
    skill: "33.33",
    experience: "25.00",
    overall: "30.83",
    label: "Weak",
    matchedSkills: ["React"],
    missingSkills: ["TypeScript", "Node.js"],
    explanation:
      "Jordan Hale matches 1 of 3 required skills for Full Stack Engineer and has 1 years of experience against a minimum of 4. Overall 30.83 from skills 33.33 (weight 70) and experience 25.00 (weight 30). Missing: TypeScript, Node.js.",
  },
  {
    candidateId: "cand-ada-okonkwo",
    jobId: "job-data-analyst",
    skillBasis: 0,
    experienceBasis: 10000,
    overallBasis: 3000,
    skill: "0.00",
    experience: "100.00",
    overall: "30.00",
    label: "Weak",
    matchedSkills: [],
    missingSkills: ["Python", "SQL"],
    explanation:
      "Ada Okonkwo matches 0 of 2 required skills for Data Analyst and has 6 years of experience against a minimum of 2. Overall 30.00 from skills 0.00 (weight 70) and experience 100.00 (weight 30). Missing: Python, SQL.",
  },
  {
    candidateId: "cand-mina-chen",
    jobId: "job-frontend-engineer",
    skillBasis: 0,
    experienceBasis: 10000,
    overallBasis: 3000,
    skill: "0.00",
    experience: "100.00",
    overall: "30.00",
    label: "Weak",
    matchedSkills: [],
    missingSkills: ["TypeScript", "React", "CSS"],
    explanation:
      "Mina Chen matches 0 of 3 required skills for Frontend Engineer and has 3 years of experience against a minimum of 3. Overall 30.00 from skills 0.00 (weight 70) and experience 100.00 (weight 30). Missing: TypeScript, React, CSS.",
  },
  {
    candidateId: "cand-mina-chen",
    jobId: "job-fullstack-engineer",
    skillBasis: 0,
    experienceBasis: 7500,
    overallBasis: 2250,
    skill: "0.00",
    experience: "75.00",
    overall: "22.50",
    label: "Weak",
    matchedSkills: [],
    missingSkills: ["TypeScript", "React", "Node.js"],
    explanation:
      "Mina Chen matches 0 of 3 required skills for Full Stack Engineer and has 3 years of experience against a minimum of 4. Overall 22.50 from skills 0.00 (weight 70) and experience 75.00 (weight 30). Missing: TypeScript, React, Node.js.",
  },
  {
    candidateId: "cand-jordan-hale",
    jobId: "job-data-analyst",
    skillBasis: 0,
    experienceBasis: 5000,
    overallBasis: 1500,
    skill: "0.00",
    experience: "50.00",
    overall: "15.00",
    label: "Weak",
    matchedSkills: [],
    missingSkills: ["Python", "SQL"],
    explanation:
      "Jordan Hale matches 0 of 2 required skills for Data Analyst and has 1 years of experience against a minimum of 2. Overall 15.00 from skills 0.00 (weight 70) and experience 50.00 (weight 30). Missing: Python, SQL.",
  },
]

describe("AC-07 divRoundHalfUp", () => {
  it("rounds exact division, exact half, below half, and above half", () => {
    expect(divRoundHalfUp(4, 2)).toBe(2)
    expect(divRoundHalfUp(5, 2)).toBe(3)
    expect(divRoundHalfUp(1, 2)).toBe(1)
    expect(divRoundHalfUp(10000, 3)).toBe(3333)
    expect(divRoundHalfUp(20000, 3)).toBe(6667)
  })

  it("formats basis integers without a floating-point conversion", () => {
    expect(formatBasis(6667)).toBe("66.67")
    expect(formatBasis(10000)).toBe("100.00")
    expect(formatBasis(0)).toBe("0.00")
  })
})

describe("AC-04 fixture basis integers and strings", () => {
  const response = scoreMatches(candidates, jobs)

  it("returns the nine fixture rows in sort order", () => {
    expect(response.formula).toEqual({
      skillWeight: 70,
      experienceWeight: 30,
      scale: 10000,
    })
    expect(response.matches).toHaveLength(9)
    expect(response.matches.map((match) => `${match.candidateId}/${match.jobId}`)).toEqual(
      fixtures.map((row) => `${row.candidateId}/${row.jobId}`),
    )
  })

  it("matches each fixture row's basis integers, strings, and label", () => {
    for (const row of fixtures) {
      const match = response.matches.find(
        (item) => item.candidateId === row.candidateId && item.jobId === row.jobId,
      )
      expect(match, `${row.candidateId}/${row.jobId}`).toMatchObject({
        skillBasis: row.skillBasis,
        experienceBasis: row.experienceBasis,
        overallBasis: row.overallBasis,
        skill: row.skill,
        experience: row.experience,
        overall: row.overall,
        label: row.label,
        matchedSkills: row.matchedSkills,
        missingSkills: row.missingSkills,
        explanation: row.explanation,
      })
    }
  })

  it("sorts the tied 30.00 rows by candidate id", () => {
    const ada = response.matches.find(
      (match) => match.candidateId === "cand-ada-okonkwo" && match.jobId === "job-data-analyst",
    )
    const mina = response.matches.find(
      (match) => match.candidateId === "cand-mina-chen" && match.jobId === "job-frontend-engineer",
    )
    expect(ada?.overallBasis).toBe(3000)
    expect(mina?.overallBasis).toBe(3000)
    expect(ada?.skillBasis).toBe(0)
    expect(mina?.skillBasis).toBe(0)
    expect(ada?.overall).toBe("30.00")
    expect(mina?.overall).toBe("30.00")
    const adaIndex = response.matches.indexOf(ada!)
    const minaIndex = response.matches.indexOf(mina!)
    expect(adaIndex).toBeGreaterThanOrEqual(0)
    expect(adaIndex).toBeLessThan(minaIndex)
  })
})

describe("AC-05 skill normalization", () => {
  it("trims, collapses whitespace, and lowercases only ASCII letters", () => {
    expect(normalizeSkill("  TypeScript  ")).toBe("typescript")
    expect(normalizeSkill("Data   modeling")).toBe("data modeling")
    expect(normalizeSkill("Node.js")).toBe("node.js")
    expect(normalizeSkill("CAFÉ")).toBe("cafÉ")
    expect(normalizeSkill("İstanbul")).toBe("İstanbul")
  })

  it("does not treat Node.js as nodejs or node", () => {
    const job: Job = {
      id: "job-node",
      title: "Node",
      requiredSkills: ["Node.js"],
      minYearsExperience: 1,
    }
    const missed = scorePair(
      {
        id: "cand-node",
        name: "Node",
        skills: ["nodejs", "node"],
        yearsExperience: 1,
      },
      job,
    )
    expect(missed.skillBasis).toBe(0)
    expect(missed.matchedSkills).toEqual([])
    expect(missed.missingSkills).toEqual(["Node.js"])

    const matched = scorePair(
      {
        id: "cand-node",
        name: "Node",
        skills: ["Node.js"],
        yearsExperience: 1,
      },
      job,
    )
    expect(matched.skillBasis).toBe(10000)
    expect(matched.matchedSkills).toEqual(["Node.js"])
  })

  it("counts duplicate skills once and ignores skills the job does not require", () => {
    const job: Job = {
      id: "job-dup",
      title: "Dup",
      requiredSkills: ["React", " react ", "CSS"],
      minYearsExperience: 2,
    }
    const match = scorePair(
      {
        id: "cand-dup",
        name: "Dup",
        skills: ["REACT", "React", "Kubernetes"],
        yearsExperience: 2,
      },
      job,
    )
    expect(match.matchedSkills).toEqual(["React"])
    expect(match.missingSkills).toEqual(["CSS"])
    expect(match.skillBasis).toBe(5000)

    const exact = scorePair(
      {
        id: "cand-exact",
        name: "Exact",
        skills: ["React"],
        yearsExperience: 2,
      },
      {
        id: "job-exact",
        title: "Exact",
        requiredSkills: ["React"],
        minYearsExperience: 2,
      },
    )
    const extra = scorePair(
      {
        id: "cand-extra",
        name: "Extra",
        skills: ["React", "Kubernetes", "Go"],
        yearsExperience: 2,
      },
      {
        id: "job-exact",
        title: "Exact",
        requiredSkills: ["React"],
        minYearsExperience: 2,
      },
    )
    expect(extra.skillBasis).toBe(exact.skillBasis)
    expect(extra.overallBasis).toBe(exact.overallBasis)
    expect(extra.skillBasis).toBe(10000)
  })

  it("matches a skill after trim and ASCII case folding, keeping the job's original text", () => {
    const match = scorePair(
      {
        id: "cand-ws",
        name: "Ws",
        skills: ["  typescript  "],
        yearsExperience: 1,
      },
      {
        id: "job-ws",
        title: "Ws",
        requiredSkills: ["TypeScript"],
        minYearsExperience: 1,
      },
    )
    expect(match.skillBasis).toBe(10000)
    expect(match.matchedSkills).toEqual(["TypeScript"])
  })
})

describe("AC-06 experience", () => {
  const requiredJob = (minYearsExperience: number): Job => ({
    id: "job-exp",
    title: "Exp",
    requiredSkills: ["React"],
    minYearsExperience,
  })

  function experienceFor(yearsExperience: number, minYearsExperience: number) {
    return scorePair(
      {
        id: "cand-exp",
        name: "Exp",
        skills: ["React"],
        yearsExperience,
      },
      requiredJob(minYearsExperience),
    )
  }

  it("scores full experience at the minimum and no more above it", () => {
    const atMinimum = experienceFor(3, 3)
    const above = experienceFor(9, 3)
    expect(atMinimum.experienceBasis).toBe(10000)
    expect(atMinimum.experience).toBe("100.00")
    expect(above.experienceBasis).toBe(10000)
    expect(above.experience).toBe("100.00")
    expect(above.overallBasis).toBe(atMinimum.overallBasis)
  })

  it("scores experience below the minimum in proportion", () => {
    const below = experienceFor(1, 3)
    expect(below.experienceBasis).toBe(3333)
    expect(below.experience).toBe("33.33")
    expect(below.skillBasis).toBe(10000)
    expect(below.overallBasis).toBe(divRoundHalfUp(70 * 10000 + 30 * 3333, 100))
  })

  it("scores a minimum of 0 as the full experience component", () => {
    const none = experienceFor(0, 0)
    const some = experienceFor(4, 0)
    expect(none.experienceBasis).toBe(10000)
    expect(none.experience).toBe("100.00")
    expect(some.experienceBasis).toBe(10000)
    expect(some.overallBasis).toBe(none.overallBasis)
  })
})

describe("AC-09 scorer inputs", () => {
  it("repeats the same result for the same inputs", () => {
    expect(scoreMatches(candidates, jobs)).toEqual(scoreMatches(candidates, jobs))
  })

  it("does not read the clock, random values, or the network", () => {
    for (const fileName of ["score.ts", "normalize.ts"]) {
      const source = readFileSync(path.join(process.cwd(), "src", "lib", "match", fileName), "utf8")
      expect(source).not.toMatch(/\bDate\b/)
      expect(source).not.toMatch(/Math\.random/)
      expect(source).not.toMatch(/\bfetch\s*\(/)
      expect(source).not.toMatch(/node:fs|node:http|node:https|node:net/)
      expect(source).not.toMatch(/\bXMLHttpRequest\b/)
    }
  })
})
