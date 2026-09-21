import { Cable } from "./Cable.ts";
import type { Strand } from "./Strand.ts";
import type { Vertex } from "./Vertex.ts";
import type { WatchTickContext } from "./WatchTickContext.ts";
import type { WorkflowFrameRun } from "./WorkflowFrameRun.ts";

type FirstCable<TState extends object> = {
    core: Strand<WorkflowFrameRun<TState>, TState>;
    strands: Strand<WorkflowFrameRun<TState>, TState>[];
};

type SecondCable<TState extends object> = {
    core: Strand<WorkflowFrameRun<TState>, TState>;
    strands: Strand<WorkflowFrameRun<TState>, TState>[];
    vertexWithFirstCable: Vertex<TState>;
};

type ThirdCable<TState extends object> = {
    core: Strand<WorkflowFrameRun<TState>, TState>;
    strands: Strand<WorkflowFrameRun<TState>, TState>[];
    vertexWithFirstCable: Vertex<TState>;
    vertexWithSecondCable: Vertex<TState>;
};

type BundleConfiguration<TState extends object> =
    | [FirstCable<TState>]
    | [FirstCable<TState>, SecondCable<TState>]
    | [
        FirstCable<TState>,
        SecondCable<TState>,
        ThirdCable<TState>,
    ];

type BundleState<TState extends object> = {
    cables: readonly Cable<TState>[];
    vertexes: readonly Vertex<TState>[];
};

const validateCable = <TState extends object>(
    cable: {
        core: Strand<WorkflowFrameRun<TState>, TState>;
        strands: Strand<WorkflowFrameRun<TState>, TState>[];
    },
): void => {
    if (cable.strands.includes(cable.core)) {
        throw new Error(
            "A cable's core strand cannot also be a coaxial strand.",
        );
    }
};

const validateFirstCable = <TState extends object>(
    first: FirstCable<TState>,
): void => {
    validateCable(first);
};

const validateFirstAndSecondCables = <TState extends object>(
    first: FirstCable<TState>,
    second: SecondCable<TState>,
): void => {
    validateFirstCable(first);
    validateCable(second);

    if (first.strands.length !== 1) {
        throw new Error(
            "The first cable must contain exactly one coaxial strand.",
        );
    }

    if (second.strands.length !== 1) {
        throw new Error(
            "The second cable must contain exactly one coaxial strand.",
        );
    }

    const firstStrand = first.strands[0];
    const secondStrand = second.strands[0];

    if (!firstStrand || !secondStrand) {
        throw new Error(
            "The two-cable configuration must contain valid coaxial strands.",
        );
    }

    const vertexStrands =
        second.vertexWithFirstCable.strands;

    if (vertexStrands.length !== 2) {
        throw new Error(
            "A vertex must connect exactly two strands.",
        );
    }

    if (!vertexStrands.includes(firstStrand)) {
        throw new Error(
            "The second cable's vertex must contain the first cable's coaxial strand.",
        );
    }

    if (!vertexStrands.includes(secondStrand)) {
        throw new Error(
            "The second cable's vertex must contain the second cable's coaxial strand.",
        );
    }

    if (
        vertexStrands.includes(first.core) ||
        vertexStrands.includes(second.core)
    ) {
        throw new Error(
            "A vertex cannot contain a cable's core strand.",
        );
    }

    if (vertexStrands[0] === vertexStrands[1]) {
        throw new Error(
            "A vertex must connect two different strands.",
        );
    }
};

const validateFirstSecondAndThirdCables = <TState extends object>(
    first: FirstCable<TState>,
    second: SecondCable<TState>,
    third: ThirdCable<TState>,
): void => {
    validateFirstAndSecondCables(
        first,
        second,
    );

    validateCable(third);

    if (third.strands.length !== 2) {
        throw new Error(
            "The third cable must contain exactly two coaxial strands.",
        );
    }

    const firstStrand = first.strands[0];
    const secondStrand = second.strands[0];
    const thirdFirstStrand = third.strands[0];
    const thirdSecondStrand = third.strands[1];

    if (
        !firstStrand ||
        !secondStrand ||
        !thirdFirstStrand ||
        !thirdSecondStrand
    ) {
        throw new Error(
            "The three-cable configuration must contain valid coaxial strands.",
        );
    }

    if (thirdFirstStrand === thirdSecondStrand) {
        throw new Error(
            "The third cable's coaxial strands must be different strands.",
        );
    }

    const firstVertexStrands =
        third.vertexWithFirstCable.strands;

    if (firstVertexStrands.length !== 2) {
        throw new Error(
            "A vertex must connect exactly two strands.",
        );
    }

    if (firstVertexStrands[0] === firstVertexStrands[1]) {
        throw new Error(
            "A vertex must connect two different strands.",
        );
    }

    if (!firstVertexStrands.includes(firstStrand)) {
        throw new Error(
            "The third cable's first vertex must contain the first cable's coaxial strand.",
        );
    }

    if (!firstVertexStrands.includes(thirdFirstStrand)) {
        throw new Error(
            "The third cable's first vertex must contain the third cable's first coaxial strand.",
        );
    }

    const secondVertexStrands =
        third.vertexWithSecondCable.strands;

    if (secondVertexStrands.length !== 2) {
        throw new Error(
            "A vertex must connect exactly two strands.",
        );
    }

    if (secondVertexStrands[0] === secondVertexStrands[1]) {
        throw new Error(
            "A vertex must connect two different strands.",
        );
    }

    if (!secondVertexStrands.includes(secondStrand)) {
        throw new Error(
            "The third cable's second vertex must contain the second cable's coaxial strand.",
        );
    }

    if (!secondVertexStrands.includes(thirdSecondStrand)) {
        throw new Error(
            "The third cable's second vertex must contain the third cable's second coaxial strand.",
        );
    }

    if (
        firstVertexStrands.includes(first.core) ||
        firstVertexStrands.includes(third.core) ||
        secondVertexStrands.includes(second.core) ||
        secondVertexStrands.includes(third.core)
    ) {
        throw new Error(
            "A vertex cannot contain a cable's core strand.",
        );
    }
};

const createOneCableState = <TState extends object>(
    configuration: [FirstCable<TState>],
): BundleState<TState> => {
    const [first] = configuration;

    validateFirstCable(first);

    return {
        cables: [
            new Cable<TState>(
                first.core,
                first.strands,
            ),
        ],
        vertexes: [],
    };
};

const createTwoCableState = <TState extends object>(
    configuration: [
        FirstCable<TState>,
        SecondCable<TState>,
    ],
): BundleState<TState> => {
    const [first, second] = configuration;

    validateFirstAndSecondCables(
        first,
        second,
    );

    return {
        cables: [
            new Cable<TState>(
                first.core,
                first.strands,
            ),
            new Cable<TState>(
                second.core,
                second.strands,
            ),
        ],
        vertexes: [
            second.vertexWithFirstCable,
        ],
    };
};

const createThreeCableState = <TState extends object>(
    configuration: [
        FirstCable<TState>,
        SecondCable<TState>,
        ThirdCable<TState>,
    ],
): BundleState<TState> => {
    const [first, second, third] = configuration;

    validateFirstSecondAndThirdCables(
        first,
        second,
        third,
    );

    return {
        cables: [
            new Cable<TState>(
                first.core,
                first.strands,
            ),
            new Cable<TState>(
                second.core,
                second.strands,
            ),
            new Cable<TState>(
                third.core,
                third.strands,
            ),
        ],
        vertexes: [
            second.vertexWithFirstCable,
            third.vertexWithFirstCable,
            third.vertexWithSecondCable,
        ],
    };
};

export class Bundle<TState extends object> {
    private readonly state: BundleState<TState>;

    public constructor(
        configuration: BundleConfiguration<TState>,
    ) {
        if (configuration.length === 1) {
            this.state =
                createOneCableState(configuration);
            return;
        }

        if (configuration.length === 2) {
            this.state =
                createTwoCableState(configuration);
            return;
        }

        this.state =
            createThreeCableState(configuration);
    }

    public get cables(): readonly Cable<TState>[] {
        return this.state.cables;
    }

    public get vertexes(): readonly Vertex<TState>[] {
        return this.state.vertexes;
    }

    public async tick(
        context: WatchTickContext<TState>,
    ): Promise<void> {
        await Promise.all(
            this.state.cables.map((cable) =>
                cable.tick(context),
            ),
        );
    }
}

export const createBundle = <TState extends object>(
    configuration: BundleConfiguration<TState>,
): Bundle<TState> =>
    new Bundle(configuration);