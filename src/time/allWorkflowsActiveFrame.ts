import type { Watch } from "../Watch.ts";
import type { WorkflowFrame } from "../WorkflowFrame.ts";

export default function allWorkflowsActiveFrame<
  TState extends object,
>(
  watch: Watch<TState>,
): readonly WorkflowFrame[] {
  const frames: WorkflowFrame[] = [];

  for (const cable of watch.bundle.cables) {
    for (const instance of cable.core.instances) {
      if (instance.activeFrame !== null) {
        frames.push(instance.activeFrame);
      }
    }

    for (const strand of cable.strands) {
      for (const instance of strand.instances) {
        if (instance.activeFrame !== null) {
          frames.push(instance.activeFrame);
        }
      }
    }
  }

  return frames;
}