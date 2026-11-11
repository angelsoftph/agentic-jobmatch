/**
 * Skill normalization from docs/architecture.md.
 * Trim, collapse whitespace, then map ASCII A-Z to a-z.
 * Other characters stay unchanged. No locale case folding.
 */

export function normalizeSkill(skill: string): string {
  const collapsed = skill.trim().replace(/\s+/g, " ")
  let normalized = ""
  for (let index = 0; index < collapsed.length; index += 1) {
    const code = collapsed.charCodeAt(index)
    if (code >= 65 && code <= 90) {
      normalized += String.fromCharCode(code + 32)
    } else {
      normalized += collapsed.charAt(index)
    }
  }
  return normalized
}

export type NormalizedSkill = {
  original: string
  key: string
}

/** Keeps the first original string for each normalized key. */
export function uniqueSkills(skills: readonly string[]): NormalizedSkill[] {
  const seen = new Set<string>()
  const unique: NormalizedSkill[] = []
  for (const original of skills) {
    const key = normalizeSkill(original)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    unique.push({ original, key })
  }
  return unique
}
