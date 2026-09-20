import { describe, expect, it } from "vitest";

import type { Vertex, WatchTickContext } from "../src";
import { Bundle, Strand, WorkflowFrameRun } from "../src";

type State = {
    readonly value: string;
};

class TestRun extends WorkflowFrameRun<State> {
    protected establishStory(initialState: State) {
        return [
            {
                name: "First",
                state: initialState,
            },
        ];
    }

    protected load(state: State): void {
        this.story = this.establishStory(state);

        this.establishActiveFrame();
    }

    protected establishProgress(): void {
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
        await Promise.all(
            this.instances.map((instance) =>
                instance.tick(context),
            ),
        );
    }
}

const context: WatchTickContext<State> = {
    timestamp: 1,
    url: "/",
    mutation: null,
    disposition: {
        value: "updated",
    },
};

const createStrand = (value: string) =>
    new TestStrand(
        {
            value,
        },
        "/",
    );

describe("Bundle", () => {
    it("creates a one-cable bundle", () => {
        const core = createStrand("core");

        const bundle = new Bundle([
            {
                core,
                strands: [],
            },
        ]);

        expect(bundle.cables).toHaveLength(1);

        expect(bundle.cables[0]?.core).toBe(core);

        expect(bundle.cables[0]?.strands).toHaveLength(0);

        expect(bundle.vertexes).toHaveLength(0);
    });

    it("creates a one-cable bundle with coaxial strands", () => {
        const core = createStrand("core");

        const firstStrand = createStrand("first-strand");
        const secondStrand = createStrand("second-strand");

        const bundle = new Bundle([
            {
                core,
                strands: [
                    firstStrand,
                    secondStrand,
                ],
            },
        ]);

        expect(bundle.cables).toHaveLength(1);

        expect(bundle.cables[0]?.core).toBe(core);

        expect(bundle.cables[0]?.strands).toEqual([
            firstStrand,
            secondStrand,
        ]);

        expect(bundle.vertexes).toHaveLength(0);
    });

    it("rejects a cable whose core is also a coaxial strand", () => {
        const core = createStrand("core");

        expect(
            () =>
                new Bundle([
                    {
                        core,
                        strands: [core],
                    },
                ]),
        ).toThrow(
            "A cable's core strand cannot also be a coaxial strand.",
        );
    });

    it("creates a two-cable bundle with one vertex", () => {
        const firstCore = createStrand("first-core");

        const firstStrand = createStrand("first-strand");

        const secondCore = createStrand("second-core");

        const secondStrand = createStrand("second-strand");

        const vertex: Vertex<State> = {
            strands: [firstStrand, secondStrand],
        };

        const bundle = new Bundle([
            {
                core: firstCore,
                strands: [firstStrand],
            },
            {
                core: secondCore,
                strands: [secondStrand],
                vertexWithFirstCable: vertex,
            },
        ]);

        expect(bundle.cables).toHaveLength(2);

        expect(bundle.cables[0]?.core).toBe(firstCore);

        expect(bundle.cables[0]?.strands).toEqual([
            firstStrand,
        ]);

        expect(bundle.cables[1]?.core).toBe(secondCore);

        expect(bundle.cables[1]?.strands).toEqual([
            secondStrand,
        ]);

        expect(bundle.vertexes).toEqual([vertex]);
    });

    it("rejects a two-cable bundle whose first cable does not contain exactly one coaxial strand", () => {
        const firstCore = createStrand("first-core");

        const secondCore = createStrand("second-core");

        const secondStrand = createStrand("second-strand");

        expect(
            () =>
                new Bundle([
                    {
                        core: firstCore,
                        strands: [],
                    },
                    {
                        core: secondCore,
                        strands: [secondStrand],
                        vertexWithFirstCable: {
                            strands: [
                                createStrand("unused"),
                                secondStrand,
                            ],
                        },
                    },
                ]),
        ).toThrow(
            "The first cable must contain exactly one coaxial strand.",
        );
    });

    it("rejects a two-cable bundle whose second cable does not contain exactly one coaxial strand", () => {
        const firstCore = createStrand("first-core");

        const firstStrand = createStrand("first-strand");

        const secondCore = createStrand("second-core");

        expect(
            () =>
                new Bundle([
                    {
                        core: firstCore,
                        strands: [firstStrand],
                    },
                    {
                        core: secondCore,
                        strands: [],
                        vertexWithFirstCable: {
                            strands: [
                                firstStrand,
                                createStrand("unused"),
                            ],
                        },
                    },
                ]),
        ).toThrow(
            "The second cable must contain exactly one coaxial strand.",
        );
    });

    it("rejects a vertex that does not connect the required strands", () => {
        const firstCore = createStrand("first-core");

        const firstStrand = createStrand("first-strand");

        const secondCore = createStrand("second-core");

        const secondStrand = createStrand("second-strand");

        expect(
            () =>
                new Bundle([
                    {
                        core: firstCore,
                        strands: [firstStrand],
                    },
                    {
                        core: secondCore,
                        strands: [secondStrand],
                        vertexWithFirstCable: {
                            strands: [
                                firstStrand,
                                createStrand("wrong"),
                            ],
                        },
                    },
                ]),
        ).toThrow(
            "The second cable's vertex must contain the second cable's coaxial strand.",
        );
    });

    it("ticks every cable", async () => {
        const firstCore = createStrand("first-core");

        const firstStrand = createStrand("first-strand");

        const secondCore = createStrand("second-core");

        const secondStrand = createStrand("second-strand");

        const bundle = new Bundle([
            {
                core: firstCore,
                strands: [firstStrand],
            },
            {
                core: secondCore,
                strands: [secondStrand],
                vertexWithFirstCable: {
                    strands: [firstStrand, secondStrand],
                },
            },
        ]);

        await bundle.tick(context);

        expect(
            bundle.cables[0]?.strands[0]?.instances[0]?.progress,
        ).toEqual({
            name: "First",
            state: {
                value: "first-strand",
            },
        });

        expect(
            bundle.cables[1]?.strands[0]?.instances[0]?.progress,
        ).toEqual({
            name: "First",
            state: {
                value: "second-strand",
            },
        });
    });
});