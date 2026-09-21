import type { Strand } from "./Strand.ts";
import type { WatchTickContext } from "./WatchTickContext.ts";
import type { WorkflowFrameRun } from "./WorkflowFrameRun.ts";

export class Cable<TState extends object> {
    readonly core: Strand<WorkflowFrameRun<TState>, TState>;

    readonly strands: readonly Strand<
        WorkflowFrameRun<TState>,
        TState
    >[];

    constructor(
        core: Strand<WorkflowFrameRun<TState>, TState>,
        strands: readonly Strand<
            WorkflowFrameRun<TState>,
            TState
        >[] = [],
    ) {
        this.core = core;
        this.strands = [...strands];
    }

    get strandCount(): number {
        return this.strands.length;
    }

    async tick(
        context: WatchTickContext<TState>,
    ): Promise<void> {
        await Promise.all(
            this.strands.map((strand) =>
                strand.tick(context),
            ),
        );
    }
}