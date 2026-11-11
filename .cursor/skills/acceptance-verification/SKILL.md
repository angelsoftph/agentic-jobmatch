---
name: acceptance-verification
description: Verifies the job-match POC against acceptance ids AC-01 through AC-15 using observed command output and file evidence. The orchestrator evaluates AC-16 after QA and security review. AC-17 is the later preview check. Use for QA runs, security reviews, and any claim that local acceptance or the preview is done.
---

# Acceptance verification

A claim that work is done needs evidence from this repo, produced in the current run. Code inspection can support a failure. It cannot by itself support a pass for a behavior id.

## Evidence rules

- Quote the command and the pass/fail summary you saw.
- If a command was not run, the status is `not run`.
- Do not reuse numbers from `docs/architecture.md` as if they were test output. Those numbers are the expected values.
- Do not change product code during verification. QA may add `tests/qa/**` only when an id would otherwise be `not run` and a test can observe it without editing `src`.
- Security review does not assign acceptance passes except where the finding relates to AC-13 or AC-14. QA owns the full map.

## QA report

Write `artifacts/qa/report.md`:

```markdown
# QA report

- status: pass | fail | blocked
- task id:
- snapshot: path or "not taken"
- product files changed by QA: none | list

## Commands

- `<command>`: pass | fail | not run
- observed summary: "<short quote>"

## Acceptance

- AC-01: pass | fail | not run — evidence
- AC-02: ...
- continue through AC-15
- AC-16: unassigned — orchestrator evaluates this after both reports
- AC-17: unassigned — preview is a later gate

## Defects

- id, acceptance id, what happened, what was expected
```

Status is `pass` only if AC-01 through AC-15 are `pass` and the product-file list is `none`. QA leaves AC-16 and AC-17 unassigned.

## Security report

The reviewer returns this in the final message. The orchestrator saves it unchanged to `artifacts/reviews/security-review.md`.

```markdown
# Security review

- status: no high findings | high findings open
- task id:
- files read:

## Findings

- severity: high | medium | low
- location:
- evidence:
- recommendation:

## Empty severities

- high: none | see above
- medium: none | see above
- low: none | see above

## Notes

Residual risks that match the approved design (local JSON, no auth, fictional seed).
```

## Orchestrator check before G3

- QA report exists and its status for AC-01 through AC-15 is `pass`.
- QA left AC-16 and AC-17 unassigned.
- Security report exists.
- The orchestrator then evaluates AC-16: both reports exist, QA changed no product file, and no high finding is open.
- An open high finding, a missing report, or a QA edit under `src/`, `data/`, configs, or implementer tests fails AC-16 and escalates to the human.
- The execution log names the commands QA ran.
- No preview URL is claimed.

If AC-01 through AC-15 fail, open a fix task only when `.cursor/skills/failure-recovery/SKILL.md` allows it. If the retry budget is exhausted, escalate to the human and still write `docs/reflection.md` and `artifacts/run-summary.json`.

## Orchestrator check at G4

- The human approved the preview deploy.
- `artifacts/qa/preview-check.md` quotes the commands and shows every check passed.
- `README.md` and `artifacts/run-summary.json` contain that same URL.
- A failed check leaves both URL fields empty.
- Whether G4 succeeds or fails, `docs/reflection.md` and `artifacts/run-summary.json` are completed from observed evidence.
