import { describe, expect, it } from "vitest";

import type { WatchTickContext } from "../src";
import { Bundle, Watch } from "../src";

type State = {
  readonly value: string;
};

class TestWatch extends Watch<State> {
  tickCount = 0;

  constructor() {
    super(
      new Bundle([
        {
          core: {
            instances: [],
            tick: async () => {},
          } as never,
          strands: [],
        },
      ]),
    );
  }

  override async tick(context: WatchTickContext<State>): Promise<void> {
    this.tickCount += 1;
    await this.bundle.tick(context);
  }
}

describe("Watch", () => {
  it("stores its bundle", () => {
    const watch = new TestWatch();

    expect(watch.bundle).toBeDefined();
    expect(watch.bundle.cables).toHaveLength(1);
  });

  it("delegates observation to its bundle", async () => {
    const watch = new TestWatch();

    const context: WatchTickContext<State> = {
      timestamp: 1,
      url: "/",
      mutation: null,
      disposition: {
        value: "initial",
      },
    };

    await watch.tick(context);

    expect(watch.tickCount).toBe(1);
  });
});
