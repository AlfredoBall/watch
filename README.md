# Watch

**Watch** is a framework-independent TypeScript library for representing **workflow topology and deriving contextual information from traversal through that topology**.

Watch is a geometric and temporal instrument. It is **not** a clock, workflow engine, cache manager, state machine, or visualization framework.

The package is published as:

```text
@alfredoball/watch
```

## Core Principle

> **Watch tells meaningful time by deriving temporal information from movement through workflow topology.**

```text
geometry
    ↓
position + relationships
    ↓
workflow runs
    ↓
traversal / visitation
    ↓
derived temporal information
    ↓
application interpretation
```

Watch records structural and descriptive facts. Applications interpret them.

---

# Workflow

A workflow represents a purposeful activity.

```text
Review

├── compose
├── revise
└── submit
```

Workflow granularity belongs to the workflow model, not to Watch.

For example, a consultation may itself be a workflow:

```text
Consultation

├── intake
├── discovery
├── analysis
└── conclusion
```

Or it may be one activity within another workflow.

> **Watch models relationships between workflow structures; it does not prescribe their granularity.**

A workflow progresses through `WorkflowFrame` values:

```text
F0 ── F1 ── F2 ── F3
```

A `WorkflowFrameRun` represents an actual run of a workflow framework.

The framework, its runs, its current frame, its progress, and its historical story remain distinct concepts.

---

# Watch Geometry

A `Watch` contains a bounded `Bundle`.

The bundle contains one or more `Cable` objects. Each cable has:

```text
Cable

├── Core
└── Strands
```

Relationships between cables are represented by `Vertex` objects.

The current implementation supports bundles containing **one, two, or three cables**.

```text
1 cable

2 cables
    └── 1 vertex

3 cables
    └── 3 vertices
```

The geometry is intentionally bounded. The model does not expose arbitrary cable counts or arbitrary graph construction.

## Core

Each cable has one `core` strand.

The core is a privileged geometric position within the cable. It is still a workflow strand; it is not a different workflow type.

The core may represent a long-lived workflow such as account establishment and maintenance while other workflow runs exist alongside it.

For example:

```text
Account

├── establishment
├── maintenance
└── lifecycle
```

while shorter workflows may occupy other strands:

```text
Purchase
Consultation
Order
Review
```

The model does not require those workflows to have the same lifetime.

## Strands

A `Strand` represents a workflow position capable of containing one or more `WorkflowFrameRun` instances.

Different strands can therefore represent different workflow structures, while multiple runs of the same workflow framework can coexist within a strand.

A cable's coaxial strands are ticked concurrently.

A cable's core is structural and is not itself ticked by `Cable.tick()`.

## Vertices

A `Vertex` represents a relationship between two strands.

Each vertex contains exactly two distinct strands:

```text
Vertex

Strand ───── Strand
```

For a two-cable bundle, the vertex connects the coaxial strand of the first cable with the coaxial strand of the second cable.

For a three-cable bundle, the topology contains three vertices connecting the three cables.

The exact topology is validated when the `Bundle` is constructed.

Invalid relationships are rejected rather than being left for application code to interpret.

> **Watch validates topology at construction time rather than allowing arbitrary graph state.**

---

# Bundle Topology

`Bundle` establishes and validates the supported cable topology.

A one-cable bundle may contain zero or more coaxial strands:

```text
Bundle

└── Cable
    ├── Core
    └── Strands...
```

A two-cable bundle requires one coaxial strand on each cable and one connecting vertex:

```text
Cable 1                  Cable 2

  Core                     Core
    │                        │
 Strand 1 ───── Vertex ───── Strand 2
```

A three-cable bundle extends this topology with a third cable containing two coaxial strands and two additional vertices.

The topology is deliberately constrained so that the relationships represented by a `Bundle` remain structurally meaningful.

---

# Ticking

A `Watch` is evaluated through a `WatchTickContext`.

```ts
type WatchTickContext<TState extends object> = {
    readonly timestamp: number;

    readonly url: string;

    readonly mutation: {
        readonly operationName: string;
        readonly payload: unknown;
    } | null;

    readonly disposition: TState;
};
```

The context represents the application event against which the Watch is evaluated.

A tick can therefore carry:

* a timestamp;
* the current URL;
* an optional mutation;
* application-defined disposition state.

Watch does not prescribe what those values mean.

## Concurrent Evaluation

A bundle ticks its cables concurrently.

Each cable evaluates its coaxial strands concurrently.

Each strand is responsible for evaluating its workflow runs.

```text
Watch
  │
  ▼
Bundle
  │
  ├── Cable
  │     ├── Strand
  │     │     ├── WorkflowFrameRun
  │     │     └── WorkflowFrameRun
  │     └── Strand
  │
  ├── Cable
  │     └── Strand
  │
  └── Cable
        └── Strand
```

This establishes a consistent evaluation boundary without turning Watch into a workflow execution engine.

---

# WorkflowFrameRun

`WorkflowFrameRun` represents an actual execution and history instance of a workflow framework.

A run establishes a story:

```text
WorkflowFrameRun

story
  │
  ├── Frame
  ├── Frame
  ├── Frame
  └── Frame

progress

activeFrame
```

The story is established when the run is loaded.

`progress` and `activeFrame` are established during a Watch tick.

The distinction is intentional:

* **story** represents the run's longitudinal frame history;
* **progress** represents the run's current evaluated progress;
* **activeFrame** represents the frame currently active for contextual reporting.

A `WorkflowFrame` contains a name and application-defined state:

```ts
type WorkflowFrame<TState extends object = object> = {
    readonly name: string;
    state: TState;
};
```

Watch does not prescribe the meaning of a frame's state.

---

# Contextual Time

Watch does not contain a clock abstraction.

Instead, temporal information can be derived from the topology and the state of its workflow runs.

The package exposes:

```ts
allWorkflowsActiveFrame(watch)
```

This produces the active frames of workflow runs represented by the Watch.

Conceptually:

```text
Watch
  │
  ├── Cable
  │     ├── Core
  │     │     └── WorkflowFrameRun
  │     │           └── activeFrame
  │     │
  │     └── Strand
  │           └── WorkflowFrameRun
  │                 └── activeFrame
  │
  └── ...
          ↓
allWorkflowsActiveFrame()
          ↓
current workflow context
```

This is a **derived report**, not another piece of Watch state.

Such reports can provide the structural basis for questions such as:

* How recently was this context established?
* How much traversal has occurred since it?
* Did the user return to a previous workflow context?
* Did they return through the same topology?
* How much contextual distance has accumulated?
* Should previously established context be reconsidered?

Those meanings belong to applications and higher-level models.

> **Watch records enough structure for temporal meaning to be derived later; it does not encode those meanings prematurely.**

---

# Navigation

Navigation is not synonymous with changing URLs.

A URL is one input to a Watch tick. Watch can instead represent navigation as traversal through workflow topology.

Two visits to the same URL do not necessarily represent the same contextual state.

For example:

```text
Workflow A
    │
    ├── Frame 1
    │
    └── Frame 2
          │
          ▼
Workflow B
    │
    └── Frame 1
```

Returning to the same route does not necessarily mean returning to the same workflow context.

The topology and workflow runs provide the structural information needed to distinguish those situations.

> **A route is an input to Watch, not Watch state.**

---

# Package API

The public API is exposed from the package root:

```ts
import {
    Bundle,
    Cable,
    Strand,
    Vertex,
    Watch,
    WorkflowFrame,
    WorkflowFrameRun,
    WatchTickContext,
    allWorkflowsActiveFrame,
} from "@alfredoball/watch";
```

Internal implementation is organized around the same model:

```text
src/

├── Bundle.ts
├── Cable.ts
├── Strand.ts
├── Vertex.ts
├── Watch.ts
├── WatchTickContext.ts
├── WorkflowFrame.ts
├── WorkflowFrameRun.ts
└── time/
    ├── allWorkflowsActiveFrame.ts
    └── index.ts
```

Time reports are re-exported through the package root so consumers depend on the public API rather than internal module paths.

---

# Installation

```bash
npm install @alfredoball/watch
```

The package includes compiled JavaScript and TypeScript declarations.

---

# Design Invariant

> **Record enough structure that meaning can be derived later; do not encode meanings prematurely.**

Watch should remain:

* universal;
* framework-independent;
* geometrically opinionated;
* topologically valid;
* tightly constrained;
* traversal-aware;
* capable of deriving contextual information;
* semantically open-ended.

The goal is not maximum geometric complexity.

The topology is deliberately bounded so that the model remains comprehensible and useful.

> **The goal is maximum useful ability to tell time from a comprehensible workflow topology.**
