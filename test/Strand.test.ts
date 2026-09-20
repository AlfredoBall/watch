import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    WatchTickContext,
} from "../src/WatchTickContext";
import {
    Strand,
} from "../src/Strand";
import {
    WorkflowFrameRun,
} from "../src/WorkflowFrameRun";

type State = {
    value: string;
};

class TestRun
    extends WorkflowFrameRun<State>
{
    protected establishStory(
        initialState: State,
        initialUrl: string,
    ) {
        return [
            {
                name: "First",
                state: initialState,
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
}

class TestStrand
    extends Strand<TestRun, State>
{
    protected configureInstances(
        initialState: State,
        initialUrl: string,
    ): readonly TestRun[] {
        return [
            new TestRun(
                "FirstRun",
                initialState,
                initialUrl,
            ),
            new TestRun(
                "SecondRun",
                initialState,
                initialUrl,
            ),
        ];
    }

    async tick(
        context: WatchTickContext<State>,
    ): Promise<void> {
        await Promise.all(
            this.instances.map(
                (instance) =>
                    instance.tick(context),
            ),
        );
    }
}

describe("Strand", () => {
    it("configures its instances during construction", () => {
        const strand =
            new TestStrand(
                {
                    value: "initial",
                },
                "/",
            );

        expect(
            strand.instances,
        ).toHaveLength(2);

        expect(
            strand.instances[0]?.name,
        ).toBe("FirstRun");

        expect(
            strand.instances[1]?.name,
        ).toBe("SecondRun");
    });

    it("constructs each instance with the initial state", () => {
        const strand =
            new TestStrand(
                {
                    value: "initial",
                },
                "/",
            );

        expect(
            strand.instances[0]?.activeFrame,
        ).toEqual({
            name: "First",
            state: {
                value: "initial",
            },
        });

        expect(
            strand.instances[1]?.activeFrame,
        ).toEqual({
            name: "First",
            state: {
                value: "initial",
            },
        });
    });

    it("ticks every configured instance", async () => {
        const strand =
            new TestStrand(
                {
                    value: "initial",
                },
                "/",
            );

        const context:
            WatchTickContext<State> = {
            timestamp: 1,
            url: "/updated",
            mutation: null,
            disposition: {
                value: "updated",
            },
        };

        await strand.tick(context);

        expect(
            strand.instances[0]?.progress,
        ).toEqual({
            name: "First",
            state: {
                value: "initial",
            },
        });

        expect(
            strand.instances[1]?.progress,
        ).toEqual({
            name: "First",
            state: {
                value: "initial",
            },
        });
    });
});