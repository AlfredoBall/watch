# Watch

Watch is a **first-class, universal frontend primitive** for representing **workflow topology and deriving contextual time from traversal through that topology**.

It is a geometric instrument, not a clock, workflow engine, cache manager, or visualization.

## Location

```text
web/src/frontend/common/types/Watch.ts
```

Watch belongs beside other first-class frontend primitives such as `Decision.ts`.

---

## Core Principle

> **Watch tells meaningful time by deriving temporal information from movement through workflow topology.**

```text
geometry
  ↓
position + relationships
  ↓
traversal / visitation
  ↓
derived temporal information
  ↓
workflow conditions
  ↓
state / intent / cache / decision
```

Watch records descriptive facts. Workflows interpret them.

---

# Workflow

A workflow represents a purposeful human activity.

```text
Review
├── compose
├── revise
└── submit
```

Workflow granularity is determined by the workflow model, not by Watch.

For example, a consultation may be an entire workflow:

```text
Consultation
├── intake
├── discovery
├── analysis
└── conclusion
```

or simply one activity inside another workflow.

> **Watch models relationships between workflow structures; it does not prescribe their granularity.**

A workflow has its own longitudinal progression:

```text
F0 ── F1 ── F2 ── F3
```

Its cursor, run, and visitation history remain distinct.

---

# Watch Geometry

Watch contains a bounded bundle of cables.

Each cable is fundamentally a collection of workflow strands.

```text
Cable
├── Core
├── Strands
└── Vertices
```

The core is a privileged geometric position, not a different kind of workflow.

A `WorkflowFrameworkRun` represents an actual workflow instance. Multiple runs of the same framework may exist.

Core and vertex positions are singular: each position has one participating run instance per cable. Ordinary strand positions may contain multiple workflow run instances.

The first cable's core may represent a long-lived workflow such as account establishment and maintenance, allowing many shorter workflows—purchases, consultations, orders, reviews, and so forth—to exist within the same Watch lifetime.

---

# Cable Placement

Cable placement is calculated from workflow relationships, not arbitrary coordinates.

A new cable:

1. chooses among valid geometric placements;
2. satisfies the tightly packed topology rule;
3. establishes its resulting vertices and relationships.

The geometry owns these invariants.

### Vertices

Vertices are consequences of contact between cables.

With two cables, their relationship establishes a vertex. With three cables, each cable has two vertices defining a continuous circumferential region.

Positions are relational rather than arbitrary angles.

Useful relationships include:

* coincidence
* proximity
* contact
* crossing
* divergence
* reconvergence
* departure
* relative circumferential position
* longitudinal position
* traversal

---

# Cable Count

The theoretical geometry can continue beyond five cables, but normal application Watch should remain bounded.

```text
1 cable
3 cables
5 cables → pentagram
```

Three cables are the practical UX boundary. Five is a geometric boundary, not a recommendation for normal application use.

The expressive power should come from geometry, longitudinal workflow structure, and traversal—not simply from adding cables.

---

# Navigation and Time

Navigation is traversal through Watch space, not merely movement between pages.

Watch can derive contextual questions such as:

* How recently was this context established?
* How far have we traveled from it?
* Did we return to it?
* Did we return by the same route?
* How much traversal has occurred since meaningful contact?
* Has enough contextual distance accumulated to reconsider something?

These are derived conditions, not primitive Watch fields.

Next.js route state is not Watch state.

---

# XState

XState may provide execution/runtime mechanics:

```text
Watch Model
    ↓
derived facts/events
    ↓
XState
    ↓
React/UI
```

Watch should not become another generic workflow engine.

---

# Design Invariant

> **Record enough structure that meaning can be derived later; do not encode meanings prematurely.**

Watch should be:

* universal
* geometrically opinionated
* topologically valid
* tightly packed
* traversal-aware
* bounded in application complexity
* capable of deriving contextual time
* semantically open-ended

The goal is not maximum geometric complexity.

> **The goal is maximum useful ability to tell time from a comprehensible workflow topology.**
