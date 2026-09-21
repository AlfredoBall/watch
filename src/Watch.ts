import type { Bundle } from "./Bundle.ts";
import type { WatchTickContext } from "./WatchTickContext.ts";

export abstract class Watch<T extends object> {
  readonly bundle: Bundle<T>;

  constructor(bundle: Bundle<T>) {
    this.bundle = bundle;
  }

  public abstract tick(context: WatchTickContext<T>): Promise<void>;
}
