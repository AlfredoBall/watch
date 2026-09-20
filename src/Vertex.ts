import type { Strand } from "./Strand";
import type { WorkflowFrameRun } from "./WorkflowFrameRun";

export type Vertex<TState extends object> = {
  readonly strands: readonly [
    Strand<WorkflowFrameRun<TState>, TState>,
    Strand<WorkflowFrameRun<TState>, TState>,
  ];
};