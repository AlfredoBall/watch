import { describe, expect, it } from "vitest";

import { allWorkflowsActiveFrame } from "../../src/time";

import { Bundle, Cable, Strand, Watch, WorkflowFrameRun } from "../../src";

import type { WatchTickContext, WorkflowFrame } from "../../src";

type State = {
  readonly value: string;
};

class TestRun extends WorkflowFrameRun<State> {
  protected establishStory(
    initialState: State,
    initialUrl: string,
  ): WorkflowFrame[] {
    return [
      {
        name: initialState.value,
        state: initialState,
      },
    ];
  }

  protected load(state: State, url: string): void {
    this.story = this.establishStory(state, url);

    this.establishActiveFrame();
  }

  protected establishProgress(context: WatchTickContext<State>): void {
    this.progress = this.story?.[0] ?? null;
  }

  protected establishActiveFrame(): void {
    this.activeFrame = this.story?.[0] ?? null;
  }
}

class TestStrand extends Strand<TestRun, State> {
  constructor(
    initialState: State,
    initialUrl: string,
    runs: readonly TestRun[],
  ) {
    super(initialState, initialUrl);

    Object.defineProperty(this, "instances", {
      value: [...runs],
      writable: false,
    });
  }

  protected configureInstances(
    initialState: State,
    initialUrl: string,
  ): readonly TestRun[] {
    return [new TestRun("Initial", initialState, initialUrl)];
  }

  async tick(context: WatchTickContext<State>): Promise<void> {
    await Promise.all(this.instances.map((instance) => instance.tick(context)));
  }
}

class TestWatch extends Watch<State> {
  constructor(cables: readonly Cable<State>[]) {
    super({
      cables,
      vertexes: [],
      tick: async () => {},
    } as unknown as Bundle<State>);
  }

  async tick(context: WatchTickContext<State>): Promise<void> {
    await this.bundle.tick(context);
  }
}

const createRun = (name: string): TestRun =>
  new TestRun(
    name,
    {
      value: name,
    },
    "/",
  );

const createStrand = (...names: string[]): TestStrand =>
  new TestStrand(
    {
      value: names[0] ?? "Initial",
    },
    "/",
    names.map(createRun),
  );

describe("allWorkflowsActiveFrame", () => {
  it("returns active frames from core instances and coaxial strand instances in traversal order", () => {
    const core = createStrand("CoreOne", "CoreTwo");

    const coaxial = createStrand("CoaxialOne", "CoaxialTwo");

    const cable = new Cable(core, [coaxial]);

    const watch = new TestWatch([cable]);

    const frames = allWorkflowsActiveFrame(watch);

    expect(frames).toHaveLength(4);

    expect(frames.map((frame) => frame.name)).toEqual([
      "CoreOne",
      "CoreTwo",
      "CoaxialOne",
      "CoaxialTwo",
    ]);
  });

  it("excludes instances without an active frame", () => {
    const active = createRun("Active");

    const inactive = createRun("Inactive");

    inactive.activeFrame = null;

    const core = createStrand("Core");

    Object.defineProperty(core, "instances", {
      value: [active, inactive],
      writable: false,
    });

    const cable = new Cable(core);

    const watch = new TestWatch([cable]);

    const frames = allWorkflowsActiveFrame(watch);

    expect(frames).toHaveLength(1);
    expect(frames[0]?.name).toBe("Active");
  });

  it("traverses every cable in bundle order", () => {
    const firstCore = createStrand("FirstCore");

    const secondCore = createStrand("SecondCore");

    const firstCable = new Cable(firstCore);

    const secondCable = new Cable(secondCore);

    const watch = new TestWatch([firstCable, secondCable]);

    const frames = allWorkflowsActiveFrame(watch);

    expect(frames.map((frame) => frame.name)).toEqual([
      "FirstCore",
      "SecondCore",
    ]);
  });

  it("returns an empty array when no instances have an active frame", () => {
    const run = createRun("Inactive");

    run.activeFrame = null;

    const core = createStrand("Core");

    Object.defineProperty(core, "instances", {
      value: [run],
      writable: false,
    });

    const cable = new Cable(core);

    const watch = new TestWatch([cable]);

    expect(allWorkflowsActiveFrame(watch)).toEqual([]);
  });
});
