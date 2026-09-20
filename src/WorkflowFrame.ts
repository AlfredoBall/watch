export type WorkflowFrame<TState extends object = object> = {
  readonly name: string;
  state: TState;
};
