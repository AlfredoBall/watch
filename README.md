# Watch

**Watch** is a framework-independent TypeScript library for representing **workflow topology and deriving contextual information from traversal through that topology**.

Watch is a geometric and temporal instrument. It is **not** a clock, workflow engine, cache manager, state machine, or visualization framework.

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
traversal
  ↓
derived temporal information
  ↓
application interpretation
```

Watch records structural and descriptive facts. Applications interpret them.

## Workflow

A workflow represents purposeful activity and progresses through `WorkflowFrame` values.

```text
F0 ── F1 ── F2 ── F3
```

A `WorkflowFrameRun` represents an actual run of a workflow framework, including its historical `story`, current `progress`, and `activeFrame`.

Workflow granularity belongs to the workflow model, not Watch. A workflow may contain other activities or itself be one activity within a larger workflow.

## Geometry

A `Watch` contains a bounded `Bundle` of one, two, or three `Cable` objects.

```text
Cable
├── Core
└── Strands
```

A `Strand` represents a workflow position capable of containing one or more `WorkflowFrameRun` instances.

A `Vertex` represents a relationship between exactly two distinct strands.

The supported topology is deliberately constrained:

```text
1 cable
2 cables ── 1 vertex
3 cables ── 3 vertices
```

`Bundle` validates these relationships during construction rather than allowing arbitrary graph state.

The cable `core` is a privileged structural strand. Coaxial strands are evaluated during a tick; the core is not independently ticked by `Cable.tick()`.

## Ticking

A Watch is evaluated against a `WatchTickContext`:

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

The context carries application events and state without prescribing their meaning.

Evaluation proceeds concurrently through the topology:

```text
Watch
  ↓
Bundle
  ├── Cable
  │    ├── Strand → WorkflowFrameRun
  │    └── Strand → WorkflowFrameRun
  ├── Cable
  │    └── Strand → WorkflowFrameRun
  └── Cable
       └── Strand → WorkflowFrameRun
```

Watch observes and evaluates workflow structure; it does not execute the workflows themselves.

## Contextual Time

Watch does not contain a clock abstraction. Temporal information is derived from workflow state and topology.

The package exposes time-oriented reports through the `/time` subpath:

```ts
import {
    allWorkflowsActiveFrame,
} from "@alfredoball/watch/time";
```

For example:

```ts
allWorkflowsActiveFrame(watch);
```

returns the active frames represented by the Watch.

This is a **derived report**, not additional Watch state. Applications can use such structural information to determine contextual distance, revisitation, progression, or other temporal meanings.

> **Watch records enough structure for temporal meaning to be derived later; it does not encode those meanings prematurely.**

## Navigation

A URL is an input to Watch, not Watch state.

Returning to the same URL does not necessarily represent returning to the same workflow context. Workflow topology and frame history provide the structural information needed to distinguish those cases.

## Public API

Core types are exported from the package root:

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
} from "@alfredoball/watch";
```

Time-oriented reports are exported through:

```ts
import {
    allWorkflowsActiveFrame,
} from "@alfredoball/watch/time";
```

The `/time` path is a public package export, not an import from the package's internal `src` structure.

## Installation

```bash
npm install @alfredoball/watch
```

The package includes compiled JavaScript and TypeScript declarations.

## Design Invariant

> **Record enough structure that meaning can be derived later; do not encode meanings prematurely.**

Watch should remain:

* framework-independent;
* geometrically opinionated;
* topologically constrained;
* traversal-aware;
* capable of deriving contextual information;
* semantically open-ended.

> **The goal is useful ability to tell time from a comprehensible workflow topology.**

## License

MIT
