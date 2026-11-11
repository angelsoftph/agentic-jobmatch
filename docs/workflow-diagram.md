# Workflow

One page. This is the planned order. It is not a record of work already done.

```mermaid
flowchart TD
  G0[G0 Human approves this plan]
  GIT[Human makes Git usable]
  COMMIT[Human authorizes planning commit]
  RA[Requirements architect]
  G1{G1 Contract unchanged?}
  SCAFFOLD[Orchestrator writes configs]
  G2[G2 Human approves install]
  BUILD[Backend and frontend in parallel]
  REVIEW[QA AC-01 to AC-15 and security in parallel]
  AC16{Orchestrator evaluates AC-16}
  FIX[Owning engineer fixes]
  BUDGET{Retry attempts left?}
  G4[G4 Human approves Vercel preview]
  CHECK[Verify preview page and API]
  ESC[Human escalation]
  CLOSE[Write reflection and run summary]
  STOP[Stop for the human]

  G0 --> GIT --> COMMIT --> RA --> G1
  G1 -->|yes| SCAFFOLD --> G2 --> BUILD --> REVIEW --> AC16
  G1 -->|drift| ESC
  AC16 -->|pass| G4 --> CHECK
  AC16 -->|fail and budget remains| FIX --> BUDGET
  BUDGET -->|yes| REVIEW
  BUDGET -->|exhausted| ESC
  CHECK -->|verified| CLOSE
  CHECK -->|failed and budget remains| FIX
  CHECK -->|failed and budget exhausted| ESC
  ESC --> CLOSE
  CLOSE --> STOP
```

QA verifies AC-01 through AC-15. The orchestrator evaluates AC-16 only after both the QA report and the security review exist. A retry uses at most two further attempts. When that budget is exhausted, the run escalates to the human. The reflection and run summary are written on that path, and also when preview verification fails or the run stops early.
