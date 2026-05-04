# Quick Beads Auth Rebuild Steps

## Purpose

Short practice guide for rebuilding the **Auth System** demo with Beads.

This version matches what you already did in `test_beads_1`.

---

## 1. Initialize Beads

Run from the project root:

```bash
bd init
bd setup claude
```

---

## 2. Create the parent epic

```bash
bd create "Auth System" -t epic
bd list
```

Your epic ID:

```bash
EPIC_ID=test_beads_1-2p1
```

Verify:

```bash
echo $EPIC_ID
```

Expected:

```text
test_beads_1-2p1
```

Rule:

```text
Set the variable with EPIC_ID=...
Check the variable with echo $EPIC_ID
Use the variable inside commands as "$EPIC_ID"
```

---

## 3. Create child beads

### Design UI

```bash
bd create "Design UI" \
  --description "Design auth UI wireframes for a Next.js 16 web app covering login, signup, and password reset only. Output ASCII wireframes only, no code." \
  --acceptance "ASCII wireframes exist for login, signup, and password reset; include fields, buttons, error states, and navigation links; no code scaffolded." \
  --parent "$EPIC_ID"
```

Created:

```text
test_beads_1-2p1.1 — Design UI
```

### Backend

```bash
bd create "Backend" \
  --description "Implement the auth backend for a Next.js 16 app using Prisma + SQLite, argon2 password hashing, httpOnly cookie sessions, and password reset tokens. Stub reset email delivery to console." \
  --acceptance "Backend supports signup, login, logout/session handling, password reset request, and password reset confirm; reset tokens are hashed at rest, single-use, and expire after 1 hour; implementation passes npm install, prisma migrate, and TypeScript typecheck." \
  --parent "$EPIC_ID"
```

Created:

```text
test_beads_1-2p1.2 — Backend
```

### Tests

```bash
bd create "Tests" \
  --description "Implement tests for the auth backend covering signup, login, logout/session behavior, password reset request, password reset confirm, reset token expiration/single-use, and session invalidation after reset." \
  --acceptance "Tests cover the required auth flows; npm test passes; npx tsc --noEmit passes." \
  --parent "$EPIC_ID"
```

Created:

```text
test_beads_1-2p1.3 — Tests
```

---

## 4. Verify bead tree

```bash
bd list
```

Expected structure:

```text
○ test_beads_1-2p1 [epic] Auth System
├── ○ test_beads_1-2p1.1 Design UI
├── ○ test_beads_1-2p1.2 Backend
└── ○ test_beads_1-2p1.3 Tests
```

---

## 5. Add dependency order

You already ran:

```bash
bd dep add test_beads_1-2p1.2 test_beads_1-2p1.1
bd dep add test_beads_1-2p1.3 test_beads_1-2p1.2
```

Meaning:

```text
Design UI → Backend → Tests
```

So:

- Backend depends on Design UI
- Tests depends on Backend

Now check:

```bash
bd blocked
bd list
```

Note: `bd list` may still show all beads as `open`. That is okay. Use `bd blocked` to see dependency/blocking status clearly.

---

## 6. Execute bead with agent (Claude Code)

Beads do not perform work. They only define tasks and order.

The agent (Claude Code) performs the actual implementation based on the bead.

So this step means:

```text
Bead = what to do
Agent = does the work
```

Start with Design UI first:

Use Claude Code with this prompt:

```text
Work on bead test_beads_1-2p1.1 only.

Read the bead description and acceptance criteria first.

Do not touch Backend or Tests.
Do not write backend code.
Do not scaffold the full app.

Output ASCII wireframes only for:
- login
- signup
- password reset

Include:
- fields
- buttons
- error states
- navigation links

After finishing, summarize which acceptance criteria are satisfied.
```

---

## 7. Close Design UI after review

Check the result manually.

If it satisfies the acceptance criteria:

```bash
bd close test_beads_1-2p1.1
bd list
bd blocked
```

Then Backend should become ready.

---

## 8. Next order

Follow this sequence:

```text
1. Complete Design UI
2. Close Design UI
3. Complete Backend
4. Run backend checks
5. Close Backend
6. Complete Tests
7. Run tests
8. Close Tests
9. Close Auth System epic
```

Backend checks:

```bash
npm install
npx prisma migrate dev
npx tsc --noEmit
```

Test checks:

```bash
npm test
npx tsc --noEmit
```

Close final epic:

```bash
bd close test_beads_1-2p1
```

---

## Key idea

```text
Epic = project container
Child beads = work units
Dependencies = execution order
Acceptance criteria = close condition
```

For this practice run:

```text
Auth System
└── Design UI → Backend → Tests
```


