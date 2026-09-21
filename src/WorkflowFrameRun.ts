import type { WorkflowFrame } from "./WorkflowFrame.ts";
import type { WatchTickContext } from "./WatchTickContext.ts";

export abstract class WorkflowFrameRun<
  TState extends object,
> {
  protected story: readonly WorkflowFrame[] | null = null;

  progress: WorkflowFrame | null = null;
  activeFrame: WorkflowFrame | null = null;

  protected abstract establishStory(
    initialState: TState,
    initialUrl: string,
  ): WorkflowFrame[];

  protected abstract load(
    state: TState,
    url: string,
  ): void;

  protected abstract establishProgress(
    context: WatchTickContext<TState>,
  ): void;

  protected abstract establishActiveFrame(): void;

  constructor(
    readonly name: string,
    initialState: TState,
    initialUrl: string,
  ) {
    if (!name) {
      throw new Error(
        "A WorkflowFrameRun name cannot be empty.",
      );
    }

    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      throw new Error(
        `WorkflowFrameRun name "${name}" must be ProperCase with no spaces.`,
      );
    }

    this.load(initialState, initialUrl);

    if (this.story === null) {
      throw new Error(
        `WorkflowFrameRun "${name}" did not establish a story during load.`,
      );
    }
  }

  async tick(
    context: WatchTickContext<TState>,
  ): Promise<void> {
    await this.establishProgress(context);
    this.establishActiveFrame();
  }
}