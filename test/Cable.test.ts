import { describe, expect, it } from "vitest";

import type { WatchTickContext } from "../src/WatchTickContext";
import { Cable } from "../src/Cable";
import { Strand } from "../src/Strand";
import { WorkflowFrameRun } from "../src/WorkflowFrameRun";

type State = {
  value: string;
};

class TestRun extends WorkflowFrameRun<State> {
  protected establishStory(initialState: State, initialUrl: string) {
    return [
      {
        name: "First",
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
  protected configureInstances(
    initialState: State,
    initialUrl: string,
  ): readonly TestRun[] {
    return [new TestRun("TestRun", initialState, initialUrl)];
  }

  async tick(context: WatchTickContext<State>): Promise<void> {
    await Promise.all(this.instances.map((instance) => instance.tick(context)));
  }
}

const context: WatchTickContext<State> = {
  timestamp: 1,
  url: "/updated",
  mutation: null,
  disposition: {
    value: "updated",
  },
};

describe("Cable", () => {
  it("stores its core strand", () => {
    const core = new TestStrand(
      {
        value: "core",
      },
      "/",
    );

    const cable = new Cable(core);

    expect(cable.core).toBe(core);
  });

  it("stores its coaxial strands", () => {
    const core = new TestStrand(
      {
        value: "core",
      },
      "/",
    );

    const strand = new TestStrand(
      {
        value: "strand",
      },
      "/",
    );

    const cable = new Cable(core, [strand]);

    expect(cable.strands).toEqual([strand]);

    expect(cable.strandCount).toBe(1);
  });

  it("copies the coaxial strand collection", () => {
    const core = new TestStrand(
      {
        value: "core",
      },
      "/",
    );

    const strand = new TestStrand(
      {
        value: "strand",
      },
      "/",
    );

    const strands = [strand];

    const cable = new Cable(core, strands);

    expect(cable.strands).not.toBe(strands);

    expect(cable.strands).toEqual(strands);
  });

  it("ticks its coaxial strands", async () => {
    const core = new TestStrand(
      {
        value: "core",
      },
      "/",
    );

    const strand = new TestStrand(
      {
        value: "strand",
      },
      "/",
    );

    const cable = new Cable(core, [strand]);

    await cable.tick(context);

    expect(strand.instances[0]?.progress).toEqual({
      name: "First",
      state: {
        value: "strand",
      },
    });
  });

  it("does not tick its core strand", async () => {
    const core = new TestStrand(
      {
        value: "core",
      },
      "/",
    );

    const strand = new TestStrand(
      {
        value: "strand",
      },
      "/",
    );

    const cable = new Cable(core, [strand]);

    await cable.tick(context);

    expect(core.instances[0]?.progress).toBeNull();

    expect(strand.instances[0]?.progress).not.toBeNull();
  });
});
