import { describe, expect, it } from "vitest"
import { loadCandidates, loadJobs, parseCandidates, parseJobs, SeedInvalidError } from "../../src/lib/data/load"

function expectSeedInvalid(run: () => void): void {
  let caught: unknown
  try {
    run()
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(SeedInvalidError)
  expect(caught).toMatchObject({ code: "seed_invalid" })
  if (caught instanceof Error) {
    expect(caught.message).toBe("Seed data is invalid")
    expect(caught.message).not.toMatch(/[/\\]/)
  }
}

describe("AC-09 loader", () => {
  it("rejects a duplicate id", () => {
    expectSeedInvalid(() =>
      parseCandidates([
        {
          id: "cand-one",
          name: "One",
          skills: ["React"],
          yearsExperience: 1,
        },
        {
          id: "cand-one",
          name: "Two",
          skills: ["CSS"],
          yearsExperience: 2,
        },
      ]),
    )
  })

  it("rejects a non-integer year", () => {
    expectSeedInvalid(() =>
      parseCandidates([
        {
          id: "cand-one",
          name: "One",
          skills: ["React"],
          yearsExperience: 1.5,
        },
      ]),
    )
    expectSeedInvalid(() =>
      parseJobs([
        {
          id: "job-one",
          title: "One",
          requiredSkills: ["React"],
          minYearsExperience: 2.5,
        },
      ]),
    )
  })

  it("rejects an empty required-skill list", () => {
    expectSeedInvalid(() =>
      parseJobs([
        {
          id: "job-empty",
          title: "Empty",
          requiredSkills: [],
          minYearsExperience: 1,
        },
      ]),
    )
  })

  it("accepts a job whose duplicate required skills unique to one", () => {
    const jobs = parseJobs([
      {
        id: "job-one",
        title: "One",
        requiredSkills: ["React", " react "],
        minYearsExperience: 1,
      },
    ])
    expect(jobs).toHaveLength(1)
    expect(jobs[0]?.requiredSkills).toEqual(["React", " react "])
  })

  it("loads the approved seed files", () => {
    const candidates = loadCandidates()
    const jobs = loadJobs()
    expect(candidates.map((candidate) => candidate.id)).toEqual([
      "cand-ada-okonkwo",
      "cand-mina-chen",
      "cand-jordan-hale",
    ])
    expect(jobs.map((job) => job.id)).toEqual([
      "job-frontend-engineer",
      "job-fullstack-engineer",
      "job-data-analyst",
    ])
    expect(candidates[0]?.yearsExperience).toBe(6)
    expect(jobs[1]?.minYearsExperience).toBe(4)
  })
})
