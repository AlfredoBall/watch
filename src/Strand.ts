import type { WorkflowFrameRun } from "./WorkflowFrameRun";
import type { WatchTickContext } from "./WatchTickContext";

export abstract class Strand<
  TRun extends WorkflowFrameRun<TState>,
  TState extends object,
> {
  readonly instances: readonly TRun[];

  constructor(
    initialState: TState,
    initialUrl: string,
  ) {
    this.instances = this.configureInstances(
      initialState,
      initialUrl,
    );
  }

  protected abstract configureInstances(
    initialState: TState,
    initialUrl: string,
  ): readonly TRun[];

  abstract tick(
    context: WatchTickContext<TState>,
  ): Promise<void>;
}