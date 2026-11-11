HUMAN DECISION — G3 CONTRACT CLARIFICATION

I have reviewed the reported AC-08 failure involving
TRACE /api/matches.

I approve a narrowly scoped change to the acceptance
criteria.

DECISION:
TRACE is outside the supported HTTP methods for our
Next.js Route Handler POC.

The observed HTTP 500 response is a framework-level
limitation, not an intended application behavior.

INSTRUCTIONS:

1. Update docs/architecture.md, docs/scope.md, and
   docs/acceptance-criteria.md to remove the requirement
   that TRACE must return HTTP 400.

2. Preserve all existing acceptance requirements for:
   - GET
   - HEAD
   - OPTIONS
   - POST
   - PUT
   - PATCH
   - DELETE
   - Malformed query parameters
   - Unknown IDs

3. Remove TRACE from the blocking acceptance test suite.

4. Preserve the original failing TRACE result in the
   failure artifacts and execution log.

5. Document TRACE as a known framework limitation.
   Do not mark the original failing test as passed.

6. Add a decision-log entry explaining:
   - The original expectation
   - The observed HTTP 500 response
   - The framework limitation
   - Why upstream method filtering was rejected for
     this one-day POC
   - The human approval of the revised contract

7. Do not change application implementation code merely
   to accommodate TRACE.

8. Run the complete revised local acceptance suite through
   the independent QA agent.

9. Run the security reviewer again if the contract change
   affects its prior conclusions.

10. Have the orchestrator evaluate G3 using the revised,
    approved acceptance criteria.

11. Record actual test counts and retain the original
    failure evidence.

12. If G3 passes, STOP and request G4 deployment approval.

Do not deploy or push anything.
Do not fabricate a clean first-run history.
