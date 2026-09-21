import type { Strand } from "./Strand.ts";
import type { WorkflowFrameRun } from "./WorkflowFrameRun.ts";

export type Vertex<TState extends object> = {
  readonly strands: readonly [
    Strand<WorkflowFrameRun<TState>, TState>,
    Strand<WorkflowFrameRun<TState>, TState>,
  ];
};