export type WatchTickContext<T extends object> = {
  readonly timestamp: number;
  readonly url: string;
  readonly mutation: {
    readonly operationName: string;
    readonly payload: unknown;
  } | null;
  readonly disposition: T;
};