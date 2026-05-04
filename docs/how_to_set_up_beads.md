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

expected output 

```
✓ Created issue: my_beads-lfn — Auth System
  Priority: P2
  Status: open

○ my_beads-lfn ● P2 [epic] Auth System
```

Your epic ID:

```bash
EPIC_ID=my_beads-lfn
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
bd dep add my_beads-lfn.2 my_beads-lfn.1
bd dep add my_beads-lfn.3 my_beads-lfn.2 
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


---

⏺ Backend done, committed, and pushed. Bead my_beads-lfn.2 closed. 
                                                                 
  What shipped (src/):                                             
  - app/api/auth/{signup,login,logout,session}/route.ts +          
  password-reset/{request,confirm}/route.ts                        
  - lib/auth/password.ts — argon2id (m=19MiB, t=2, p=1)            
  - lib/auth/session.ts — random 32-byte session IDs in httpOnly   
  cookies, DB-backed                                               
  - lib/auth/tokens.ts — reset tokens SHA-256 hashed at rest, 1h   
  - app/api/auth/{signup,login,logout,session}/route.ts +
  password-reset/{request,confirm}/route.ts
  - lib/auth/password.ts — argon2id (m=19MiB, t=2, p=1)
  - lib/auth/session.ts — random 32-byte session IDs in httpOnly cookies, DB-backed
  - lib/auth/tokens.ts — reset tokens SHA-256 hashed at rest, 1h TTL
  - lib/auth/mailer.ts — console.log stub for reset email
  - lib/auth/schemas.ts — zod input validation
  - prisma/schema.prisma — User, Session, PasswordResetToken (tokenHash UNIQUE)

  Acceptance gates verified locally:
  - npm install ✓
  - prisma migrate dev ✓ (created 20260504175044_init)
  - tsc --noEmit ✓

  Security touches worth flagging:
  - Reset-request always returns 200 (no email enumeration).
  - On reset-confirm: token marked used, all other unused tokens for that user deleted, all
   active sessions for the user destroyed (force re-login everywhere).

  Pre-existing modification to docs/how_to_set_up_beads.md left untouched. The Tests bead
  (my_beads-lfn.3) is now unblocked.

 ---
```
bd create "Auth Pages" \
--description "Build browser UI pages for the auth system using the existing ASCII wireframes and existing auth API routes. Implement login, signup, logout/session display, password reset request, and password reset confirm pages. Use simple, clean Next.js 16 App Router pages." \
--acceptance "Users can sign up, log in, view current session, log out, request a password reset, and submit a new password through browser pages; pages are wired to existing API routes; npm test and npx tsc --noEmit pass." \
--parent "my_beads-lfn"
```  

```  
✓ Created issue: my_beads-lfn.4 — Auth Pages
  Priority: P2
  Status: open 
```  

---

⏺ I can't reproduce the 500 from a fresh start — your exact inputs (weijie.xi@gmail.com,
  same password length) work for me: first call → 201, second call → 400 "already          
  registered". So the 500 was transient, not a fundamental bug. Most likely cause: at the
  moment you clicked, Turbopack hadn't finished loading the native argon2 module yet, OR   
  your dev.db hadn't had migrations applied when the dev server started.                   
  "Internal server error" and doesn't log the underlying exception. So when something does go wrong, you're
  flying blind — you can't see in the dev server console what actually broke.

  Issues, ranked:

  ┌─────┬────────────────────────────┬─────────────────┬─────────────────────────────────────────────────┐
  │  #  │           Issue            │    Severity     │                      Cause                      │
  ├─────┼────────────────────────────┼─────────────────┼─────────────────────────────────────────────────┤
  │     │ POST /api/auth/signup →    │ Transient (was  │ Most likely: argon2 native module not yet       │
  │ 1   │ 500                        │ real then, gone │ loaded by Turbopack on first request, OR        │
  │     │                            │  now)           │ migrations not applied to dev.db at that moment │
  ├─────┼────────────────────────────┼─────────────────┼─────────────────────────────────────────────────┤
  │     │ Generic "Internal server   │ Real bug — fix  │ My catch block calls serverError() but never    │
  │ 2   │ error" with no server-side │ this            │ console.error(err)                              │
  │     │  log                       │                 │                                                 │
  ├─────┼────────────────────────────┼─────────────────┼─────────────────────────────────────────────────┤
  │ 3   │ GET /favicon.ico → 404     │ Cosmetic        │ No favicon shipped                              │
  └─────┴────────────────────────────┴─────────────────┴─────────────────────────────────────────────────┘

  Want me to:
  1. Add console.error in the signup (and other) error paths so the next 500 actually tells you what failed in
   the terminal, and
  2. Drop in a minimal src/app/icon.svg so the favicon 404 goes away?

  Both are tiny, no backend logic changes, no test rewrites. Say the word and I'll do it under a small new
  bead (e.g., "auth: log server errors + add app icon").

---

bd create "Auth diagnostics polish" \
  --description "Improve auth development diagnostics by logging unexpected server errors in auth API routes and adding a minimal app icon to remove favicon 404 noise. Do not change auth behavior." \
  --acceptance "Unexpected auth API errors are logged with useful context in the dev server terminal; favicon 404 is gone; existing auth behavior unchanged; npm test and npx tsc --noEmit pass." \
  --parent "my_beads-lfn"