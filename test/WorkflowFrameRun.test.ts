import { describe, expect, it } from "vitest";

import type {
    WatchTickContext,
    WorkflowFrame,
} from "../src";

import {
    WorkflowFrameRun,
} from "../src";

type State = {
    readonly step: number;
};

class TestWorkflowFrameRun
    extends WorkflowFrameRun<State>
{
    protected establishStory(
        initialState: State,
        initialUrl: string,
    ): WorkflowFrame[] {
        if (initialUrl === "/empty") {
            return [];
        }

        return [
            {
                name: "First",
                state: initialState,
            },
            {
                name: "Second",
                state: {
                    step: initialState.step + 1,
                },
            },
        ];
    }

    protected load(
        state: State,
        url: string,
    ): void {
        this.story =
            this.establishStory(
                state,
                url,
            );

        this.establishActiveFrame();
    }

    protected establishProgress(
        context: WatchTickContext<State>,
    ): void {
        this.progress =
            this.story?.[0] ?? null;
    }

    protected establishActiveFrame(): void {
        this.activeFrame =
            this.story?.[0] ?? null;
    }

    constructor(
        name: string,
        initialState: State,
        initialUrl: string,
    ) {
        super(
            name,
            initialState,
            initialUrl,
        );
    }
}

const context: WatchTickContext<State> = {
    timestamp: 1,
    url: "/",
    mutation: null,
    disposition: {
        step: 2,
    },
};

describe(
    "WorkflowFrameRun",
    () => {
        it(
            "requires a non-empty name",
            () => {
                expect(
                    () =>
                        new TestWorkflowFrameRun(
                            "",
                            { step: 1 },
                            "/",
                        ),
                ).toThrow(
                    "A WorkflowFrameRun name cannot be empty.",
                );
            },
        );

        it(
            "requires a ProperCase name with no spaces",
            () => {
                expect(
                    () =>
                        new TestWorkflowFrameRun(
                            "workflow run",
                            { step: 1 },
                            "/",
                        ),
                ).toThrow(
                    'WorkflowFrameRun name "workflow run" must be ProperCase with no spaces.',
                );

                expect(
                    () =>
                        new TestWorkflowFrameRun(
                            "workflowRun",
                            { step: 1 },
                            "/",
                        ),
                ).toThrow(
                    'WorkflowFrameRun name "workflowRun" must be ProperCase with no spaces.',
                );

                expect(
                    () =>
                        new TestWorkflowFrameRun(
                            "WorkflowRun",
                            { step: 1 },
                            "/",
                        ),
                ).not.toThrow();
            },
        );

        it(
            "loads and establishes its story during construction",
            () => {
                const run =
                    new TestWorkflowFrameRun(
                        "TestRun",
                        { step: 1 },
                        "/",
                    );

                expect(
                    run.activeFrame,
                ).toEqual({
                    name: "First",
                    state: {
                        step: 1,
                    },
                });
            },
        );

        it(
            "allows an established empty story",
            () => {
                const run =
                    new TestWorkflowFrameRun(
                        "TestRun",
                        { step: 1 },
                        "/empty",
                    );

                expect(
                    run.activeFrame,
                ).toBeNull();
            },
        );

        it(
            "does not reload the story during tick",
            async () => {
                const run =
                    new TestWorkflowFrameRun(
                        "TestRun",
                        { step: 1 },
                        "/",
                    );

                const initialFrame =
                    run.activeFrame;

                await run.tick(context);

                expect(
                    run.progress,
                ).toEqual(initialFrame);

                expect(
                    run.activeFrame,
                ).toBe(initialFrame);
            },
        );

        it(
            "establishes progress before active frame during tick",
            async () => {
                const calls: string[] = [];

                class OrderedRun
                    extends TestWorkflowFrameRun
                {
                    protected establishProgress(
                        context: WatchTickContext<State>,
                    ): void {
                        calls.push("progress");

                        super.establishProgress(
                            context,
                        );
                    }

                    protected establishActiveFrame(): void {
                        calls.push("active");

                        super.establishActiveFrame();
                    }
                }

                const run =
                    new OrderedRun(
                        "OrderedRun",
                        { step: 1 },
                        "/",
                    );

                calls.length = 0;

                await run.tick(context);

                expect(calls).toEqual([
                    "progress",
                    "active",
                ]);
            },
        );
    },
);