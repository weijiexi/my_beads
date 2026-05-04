## What Are Beads?

**Beads** are the **atomic unit of work** in a system.

* Think of them like **issues or tickets**, but lighter and more structured.
* Each bead represents a **single, clearly defined task**.
* Beads are **stored in Git**, so they are persistent, versioned, and trackable.

---

## Core Idea

```text
Beads = atomic tasks
```

Instead of large, vague tasks, work is broken into **small, executable units**.

---

## What a Bead Contains

Each bead includes essential information:

* **ID** — unique identifier (e.g., `my_beads-lfn.2`)
* **Description** — what needs to be done
* **Status** — open / in_progress / blocked / closed
* **Assignee** — who or what (agent) executes the work

---

## Storage Model

* Beads are stored as **JSONL files**
* Managed inside the repository
* Automatically tracked by Git

This means:

* Full history of work
* Easy collaboration
* Reproducible workflows

---

## Two Levels of Beads

### 1. Rig-level (Execution Layer)

Used for **actual work**:

* Features
* Bug fixes
* Backend tasks
* UI work
* Tests

👉 This is where implementation happens.

---

### 2. Town-level (Orchestration Layer)

Used for **workflow coordination**:

* Managing multiple beads
* Defining execution order
* Coordinating agents
* High-level planning

👉 This is the system-level control layer.

---

## How Beads Fit Into the System

Beads are the foundation for:

* Task execution
* Agent workflows
* System orchestration

```text
Beads → define work
Agents → execute work
System → organizes work
```

---

## Key Characteristics

* **Atomic** — small and focused
* **Composable** — can be linked with dependencies
* **Traceable** — fully versioned in Git
* **Executable** — directly used by agents

---

## Simple Mental Model

```text
Epic = project container
Beads = tasks inside the project
Dependencies = execution order
Agent = does the work
```

---

## One-Line Summary

**Beads are small, structured, Git-backed tasks that power AI-driven work systems.**

