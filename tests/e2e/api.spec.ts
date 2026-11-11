import { expect, test, type APIRequestContext } from "@playwright/test"

const candidates = [
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

const jobs = [
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

const matchOrder = [
  { candidateId: "cand-ada-okonkwo", jobId: "job-fullstack-engineer", overall: "100.00" },
  { candidateId: "cand-mina-chen", jobId: "job-data-analyst", overall: "100.00" },
  { candidateId: "cand-ada-okonkwo", jobId: "job-frontend-engineer", overall: "76.67" },
  { candidateId: "cand-jordan-hale", jobId: "job-frontend-engineer", overall: "56.67" },
  { candidateId: "cand-jordan-hale", jobId: "job-fullstack-engineer", overall: "30.83" },
  { candidateId: "cand-ada-okonkwo", jobId: "job-data-analyst", overall: "30.00" },
  { candidateId: "cand-mina-chen", jobId: "job-frontend-engineer", overall: "30.00" },
  { candidateId: "cand-mina-chen", jobId: "job-fullstack-engineer", overall: "22.50" },
  { candidateId: "cand-jordan-hale", jobId: "job-data-analyst", overall: "15.00" },
]

type MatchIdentity = {
  candidateId: string
  jobId: string
  overall: string
}

async function readMatchIdentities(
  request: APIRequestContext,
  url: string,
): Promise<MatchIdentity[]> {
  const response = await request.get(url)
  expect(response.status()).toBe(200)
  const body = (await response.json()) as { matches: MatchIdentity[] }
  return body.matches.map((match) => ({
    candidateId: match.candidateId,
    jobId: match.jobId,
    overall: match.overall,
  }))
}

async function expectJsonError(
  request: APIRequestContext,
  url: string,
  status: number,
  code: "bad_request" | "not_found",
): Promise<{ error: string; code: string }> {
  const response = await request.get(url)
  expect(response.status()).toBe(status)
  const body: unknown = await response.json()
  expect(body).toEqual({
    error: expect.any(String),
    code,
  })
  const record = body as { error: string; code: string }
  expect(record.error).not.toMatch(/stack/i)
  expect(record.error).not.toMatch(/[/\\]/)
  expect(record.error).not.toMatch(/\.json/i)
  expect(JSON.stringify(record)).not.toMatch(/\bstack\b/i)
  return record
}

test.describe("AC-02 candidates and jobs", () => {
  test("GET /api/candidates returns the three seed records", async ({ request }) => {
    const response = await request.get("/api/candidates")
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual(candidates)
  })

  test("GET /api/jobs returns the three seed records", async ({ request }) => {
    const response = await request.get("/api/jobs")
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual(jobs)
  })
})

test.describe("AC-03 matches", () => {
  test("GET /api/matches returns nine pairs in fixture order", async ({ request }) => {
    const response = await request.get("/api/matches")
    expect(response.status()).toBe(200)
    const body = (await response.json()) as {
      formula: { skillWeight: number; experienceWeight: number; scale: number }
      matches: { candidateId: string; jobId: string; overall: string }[]
    }
    expect(body.formula).toEqual({
      skillWeight: 70,
      experienceWeight: 30,
      scale: 10000,
    })
    expect(body.matches).toHaveLength(9)
    expect(
      body.matches.map((match) => ({
        candidateId: match.candidateId,
        jobId: match.jobId,
        overall: match.overall,
      })),
    ).toEqual(matchOrder)
  })
})

test.describe("match filters", () => {
  test("GET /api/matches?candidateId=cand-ada-okonkwo returns Ada's three matches", async ({
    request,
  }) => {
    const matches = await readMatchIdentities(
      request,
      "/api/matches?candidateId=cand-ada-okonkwo",
    )
    expect(matches).toHaveLength(3)
    expect(matches).toEqual([
      { candidateId: "cand-ada-okonkwo", jobId: "job-fullstack-engineer", overall: "100.00" },
      { candidateId: "cand-ada-okonkwo", jobId: "job-frontend-engineer", overall: "76.67" },
      { candidateId: "cand-ada-okonkwo", jobId: "job-data-analyst", overall: "30.00" },
    ])
    for (const match of matches) {
      expect(match.candidateId).toBe("cand-ada-okonkwo")
    }
  })

  test("GET /api/matches?jobId=job-data-analyst returns that job's three matches", async ({
    request,
  }) => {
    const matches = await readMatchIdentities(request, "/api/matches?jobId=job-data-analyst")
    expect(matches).toHaveLength(3)
    expect(matches).toEqual([
      { candidateId: "cand-mina-chen", jobId: "job-data-analyst", overall: "100.00" },
      { candidateId: "cand-ada-okonkwo", jobId: "job-data-analyst", overall: "30.00" },
      { candidateId: "cand-jordan-hale", jobId: "job-data-analyst", overall: "15.00" },
    ])
    for (const match of matches) {
      expect(match.jobId).toBe("job-data-analyst")
    }
  })

  test("GET /api/matches with both ids returns the single pair", async ({ request }) => {
    const matches = await readMatchIdentities(
      request,
      "/api/matches?candidateId=cand-ada-okonkwo&jobId=job-data-analyst",
    )
    expect(matches).toHaveLength(1)
    expect(matches).toEqual([
      { candidateId: "cand-ada-okonkwo", jobId: "job-data-analyst", overall: "30.00" },
    ])
  })
})

test.describe("AC-08 query errors and methods", () => {
  test("an unknown query key returns 400 bad_request", async ({ request }) => {
    const body = await expectJsonError(request, "/api/matches?extra=1", 400, "bad_request")
    expect(body.error).not.toContain("extra")
  })

  test("an empty query value returns 400 bad_request", async ({ request }) => {
    const body = await expectJsonError(request, "/api/matches?candidateId=", 400, "bad_request")
    expect(body.error).toBe("Bad request")
  })

  test("a malformed id returns 400 bad_request without echoing the value", async ({ request }) => {
    const body = await expectJsonError(
      request,
      "/api/matches?candidateId=NOT-A-REAL-ID",
      400,
      "bad_request",
    )
    expect(body.error).not.toContain("NOT-A-REAL-ID")
  })

  test("a well-formed unknown candidate id returns 404 not_found", async ({ request }) => {
    const body = await expectJsonError(
      request,
      "/api/matches?candidateId=not-a-real-id",
      404,
      "not_found",
    )
    expect(body.error.toLowerCase()).toContain("candidate")
    expect(body.error.toLowerCase()).not.toContain("job")
  })

  test("a well-formed unknown job id returns 404 not_found", async ({ request }) => {
    const body = await expectJsonError(request, "/api/matches?jobId=not-a-real-job", 404, "not_found")
    expect(body.error.toLowerCase()).toContain("job")
    expect(body.error.toLowerCase()).not.toContain("candidate")
  })

  test("unknown candidate and job ids return 404 naming both", async ({ request }) => {
    const body = await expectJsonError(
      request,
      "/api/matches?candidateId=not-a-real-id&jobId=not-a-real-job",
      404,
      "not_found",
    )
    expect(body.error.toLowerCase()).toContain("candidate")
    expect(body.error.toLowerCase()).toContain("job")
  })

  test("HEAD /api/candidates returns 200 with an empty body", async ({ request }) => {
    const response = await request.fetch("/api/candidates", { method: "HEAD" })
    expect(response.status()).toBe(200)
    expect(await response.text()).toBe("")
  })

  test("OPTIONS /api/matches returns 204 and Allow", async ({ request }) => {
    const response = await request.fetch("/api/matches?extra=1", { method: "OPTIONS" })
    expect(response.status()).toBe(204)
    expect(response.headers().allow).toBe("GET, HEAD, OPTIONS")
    expect(await response.text()).toBe("")
  })

  for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
    test(`${method} /api/matches returns 405 with an empty body`, async ({ request }) => {
      const response = await request.fetch("/api/matches", { method })
      expect(response.status()).toBe(405)
      const text = await response.text()
      expect(text).toBe("")
      expect(text).not.toContain("code")
    })
  }

  test("PROPFIND /api/matches returns 400", async ({ request }) => {
    const response = await request.fetch("/api/matches", { method: "PROPFIND" })
    expect(response.status()).toBe(400)
    expect(await response.text()).toBe("")
  })
})
