import {
    useState
} from "react";


import {
    generateGardenLayout
} from "../utils/gardenLayoutEngine";


import {
    generatePlantingPlan
} from "../utils/plantingPlanGenerator";


import {
    generateBedPlantingPlan
} from "../utils/bedPlantingPlanner";


/* =========================
   DESIGN GOALS
========================= */

const designGoals = [
    {
        id: "balanced",
        name: "Balanced Garden",
        icon: "🌿",
        description:
            "Balance growing space, access, and supporting garden features."
    },
    {
        id: "maximum-growing",
        name: "Maximum Growing",
        icon: "🌽",
        description:
            "Prioritize productive growing space and fit more plants."
    },
    {
        id: "easy-access",
        name: "Easy Access",
        icon: "🚶",
        description:
            "Prioritize wider walkways and comfortable access."
    },
    {
        id: "simple-build",
        name: "Simple Build",
        icon: "🔨",
        description:
            "Keep the garden layout straightforward and easier to construct."
    }
];


/* =========================
   DEFAULT BUILD OPTIONS
========================= */

const defaultBuildOptions = {
    bedLength: 8,
    bedWidth: 4,
    bedHeight: 12,
    bedMaterial: "cedar",
    walkwayWidth: 3,
    soilStrategy: "balanced",
    maxRaisedBeds: null
};


/* =========================
   COMPONENT
========================= */

function HomeGardenDesignStep({
    gardenProfile,
    onSaveGardenProfile
}) {

    const designSpace =
        gardenProfile?.designSpace ||
        {};


    const savedBuildOptions = {
        ...defaultBuildOptions,
        ...(
            designSpace.buildOptions ||
            {}
        )
    };


    /* =========================
       STATE
    ========================= */

    const [
        designGoal,
        setDesignGoal
    ] = useState(
        designSpace.designGoal ||
        "balanced"
    );


    const [
        bedLength,
        setBedLength
    ] = useState(
        String(
            savedBuildOptions.bedLength
        )
    );


    const [
        bedWidth,
        setBedWidth
    ] = useState(
        String(
            savedBuildOptions.bedWidth
        )
    );


    const [
        walkwayWidth,
        setWalkwayWidth
    ] = useState(
        String(
            savedBuildOptions.walkwayWidth
        )
    );


    const [
        bedCountLimit,
        setBedCountLimit
    ] = useState(
        savedBuildOptions.maxRaisedBeds
            ? String(
                savedBuildOptions.maxRaisedBeds
            )
            : "auto"
    );


    const [
        expanded,
        setExpanded
    ] = useState(
        !designSpace.layout
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    /* =========================
       SAVED DATA
    ========================= */

    const selectedFeatures =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : [];


    const selectedCrops =
        Array.isArray(
            designSpace.growGoals
        )
            ? designSpace.growGoals
            : [];


    const hasRaisedBeds =
        selectedFeatures.includes(
            "raised-beds"
        );


    const selectedDesignGoal =
        designGoals.find(
            (goal) =>
                goal.id ===
                designGoal
        );


    /* =========================
       BUILD OPTIONS
    ========================= */

    function getBuildOptions() {

        return {
            ...savedBuildOptions,

            bedLength:
                Number(
                    bedLength
                ) || 8,

            bedWidth:
                Number(
                    bedWidth
                ) || 4,

            walkwayWidth:
                Number(
                    walkwayWidth
                ) || 3,

            maxRaisedBeds:
                bedCountLimit ===
                "auto"
                    ? null
                    : Number(
                        bedCountLimit
                    )
        };

    }


    /* =========================
       GENERATE DESIGN
    ========================= */

    function generateDesign() {

        const width =
            Number(
                designSpace.width
            );


        const length =
            Number(
                designSpace.length
            );


        if (
            width <= 0 ||
            length <= 0
        ) {

            setMessage(
                "Garden dimensions are missing. Return to Step 1."
            );

            return;
        }


        if (
            selectedCrops.length === 0
        ) {

            setMessage(
                "Choose at least one crop before generating your design."
            );

            return;
        }


        const buildOptions =
            getBuildOptions();


        const layout =
            generateGardenLayout({

                width,

                length,

                unit:
                    designSpace.unit ||
                    "ft",

                features:
                    selectedFeatures,

                designGoal,

                buildOptions

            });


        if (
            !layout
        ) {

            setMessage(
                "We could not generate a layout from these settings."
            );

            return;
        }


        const plantingPlan =
            generatePlantingPlan({

                layout,

                selectedCrops,

                sunlight:
                    gardenProfile?.sunlight ||
                    "full",

                features:
                    selectedFeatures

            });


        const bedPlantingPlan =
            plantingPlan
                ? generateBedPlantingPlan({

                    layout,

                    plantingPlan,

                    selectedCrops,

                    features:
                        selectedFeatures

                })
                : null;


        const updatedProfile = {

            ...gardenProfile,

            designSpace: {

                ...designSpace,

                designGoal,

                buildOptions,

                layout,

                plantingPlan,

                bedPlantingPlan,

                /*
                    If the user regenerates
                    the physical layout,
                    old materials/build
                    instructions should no
                    longer count as current.

                    Step 6 will recreate them.
                */

                materials:
                    null,

                buildPlan:
                    null

            }

        };


        onSaveGardenProfile(
            updatedProfile
        );


        setMessage(
            ""
        );


        setExpanded(
            false
        );


        window.setTimeout(
            () => {

                const prefersReducedMotion =
                    window.matchMedia?.(
                        "(prefers-reduced-motion: reduce)"
                    )?.matches;


                document
                    .getElementById(
                        "home-builder-step-build"
                    )
                    ?.scrollIntoView({

                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth",

                        block:
                            "start"

                    });

            },
            150
        );

    }


    /* =========================
       LOCKED STATE
    ========================= */

    if (
        selectedCrops.length ===
        0
    ) {

        return (

            <section className="home-builder-step upcoming">

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">
                        5
                    </span>


                    <div>

                        <small>
                            STEP 5
                        </small>


                        <h2>
                            🗺️ Generate Your Design
                        </h2>


                        <p>
                            Create a garden layout
                            based on your choices.
                        </p>

                    </div>

                </div>


                <div className="home-builder-locked">

                    <span>
                        🔒
                    </span>


                    <p>
                        Complete crop selection
                        before generating the
                        garden layout.
                    </p>

                </div>

            </section>

        );

    }


    /* =========================
       COLLAPSED DESIGN
    ========================= */

    if (
        designSpace.layout &&
        !expanded
    ) {

        return (

            <section className="home-builder-step complete collapsed">

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">
                        ✓
                    </span>


                    <div>

                        <small>
                            STEP 5
                        </small>


                        <h2>
                            🗺️ Garden Design
                        </h2>


                        <p>
                            Your garden layout
                            has been generated.
                        </p>

                    </div>

                </div>


                <div className="home-builder-collapsed-content">

                    <div className="home-builder-summary">

                        <strong>

                            {
                                selectedDesignGoal?.icon ||
                                "🌿"
                            }

                            {" "}

                            {
                                selectedDesignGoal?.name ||
                                "Garden Design"
                            }

                        </strong>


                        <span>

                            {
                                designSpace.layout
                                    ?.stats
                                    ?.raisedBedCount ||
                                0
                            }

                            {" beds"}

                            {" • "}

                            {
                                selectedCrops.length
                            }

                            {
                                selectedCrops.length ===
                                1
                                    ? " crop"
                                    : " crops"
                            }

                        </span>

                    </div>


                    <button
                        type="button"

                        className="home-builder-edit-button"

                        onClick={() =>
                            setExpanded(
                                true
                            )
                        }
                    >

                        Edit

                    </button>

                </div>

            </section>

        );

    }


    /* =========================
       ACTIVE DESIGN STEP
    ========================= */

    return (

        <section className="home-builder-step active">

            <div className="home-builder-step-heading">

                <span className="home-builder-step-number">

                    {
                        designSpace.layout
                            ? "✓"
                            : "5"
                    }

                </span>


                <div>

                    <small>
                        STEP 5
                    </small>


                    <h2>
                        🗺️ Generate Your Design
                    </h2>


                    <p>
                        Choose how the layout
                        should prioritize your
                        available space.
                    </p>

                </div>

            </div>


            {/* =========================
                DESIGN GOAL
            ========================= */}

            <div className="home-builder-field-group">

                <h3>
                    What should the design prioritize?
                </h3>


                <div className="design-goal-grid">

                    {
                        designGoals.map(
                            (goal) => (

                                <button
                                    type="button"

                                    key={
                                        goal.id
                                    }

                                    className={
                                        designGoal ===
                                        goal.id
                                            ? "design-goal-card selected"
                                            : "design-goal-card"
                                    }

                                    aria-pressed={
                                        designGoal ===
                                        goal.id
                                    }

                                    onClick={() =>
                                        setDesignGoal(
                                            goal.id
                                        )
                                    }
                                >

                                    <span className="design-goal-icon">

                                        {
                                            goal.icon
                                        }

                                    </span>


                                    <strong>
                                        {
                                            goal.name
                                        }
                                    </strong>


                                    <small>
                                        {
                                            goal.description
                                        }
                                    </small>

                                </button>

                            )
                        )
                    }

                </div>

            </div>


            {/* =========================
                RAISED BED LAYOUT OPTIONS
            ========================= */}

            {
                hasRaisedBeds && (

                    <div className="home-builder-field-group">

                        <h3>
                            Raised Bed Layout
                        </h3>


                        <p className="home-builder-helper-text">
                            These settings affect how
                            the layout engine fits beds
                            and walkways into your space.
                        </p>


                        <div className="build-options-grid">

                            <label>

                                Bed Length

                                <select
                                    value={
                                        bedLength
                                    }

                                    onChange={
                                        (event) =>
                                            setBedLength(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="4">
                                        4 ft
                                    </option>

                                    <option value="6">
                                        6 ft
                                    </option>

                                    <option value="8">
                                        8 ft
                                    </option>

                                    <option value="10">
                                        10 ft
                                    </option>

                                    <option value="12">
                                        12 ft
                                    </option>

                                </select>

                            </label>


                            <label>

                                Bed Width

                                <select
                                    value={
                                        bedWidth
                                    }

                                    onChange={
                                        (event) =>
                                            setBedWidth(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="2">
                                        2 ft
                                    </option>

                                    <option value="3">
                                        3 ft
                                    </option>

                                    <option value="4">
                                        4 ft
                                    </option>

                                </select>

                            </label>


                            <label>

                                Walkway Width

                                <select
                                    value={
                                        walkwayWidth
                                    }

                                    onChange={
                                        (event) =>
                                            setWalkwayWidth(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="2">
                                        2 ft
                                    </option>

                                    <option value="2.5">
                                        2.5 ft
                                    </option>

                                    <option value="3">
                                        3 ft
                                    </option>

                                    <option value="4">
                                        4 ft
                                    </option>

                                </select>

                            </label>


                            <label>

                                Number of Beds

                                <select
                                    value={
                                        bedCountLimit
                                    }

                                    onChange={
                                        (event) =>
                                            setBedCountLimit(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="auto">
                                        Auto Fit
                                    </option>

                                    <option value="1">
                                        Up to 1
                                    </option>

                                    <option value="2">
                                        Up to 2
                                    </option>

                                    <option value="3">
                                        Up to 3
                                    </option>

                                    <option value="4">
                                        Up to 4
                                    </option>

                                    <option value="5">
                                        Up to 5
                                    </option>

                                    <option value="6">
                                        Up to 6
                                    </option>

                                </select>

                            </label>

                        </div>

                    </div>

                )
            }


            {/* =========================
                DESIGN INPUT SUMMARY
            ========================= */}

            <div className="home-design-input-summary">

                <div>

                    <span>
                        📐
                    </span>

                    <strong>
                        {
                            designSpace.width
                        }

                        {" × "}

                        {
                            designSpace.length
                        }

                        {" "}

                        {
                            designSpace.unit ||
                            "ft"
                        }
                    </strong>

                    <small>
                        Available Space
                    </small>

                </div>


                <div>

                    <span>
                        🧰
                    </span>

                    <strong>
                        {
                            selectedFeatures.length
                        }
                    </strong>

                    <small>
                        Features
                    </small>

                </div>


                <div>

                    <span>
                        🥕
                    </span>

                    <strong>
                        {
                            selectedCrops.length
                        }
                    </strong>

                    <small>
                        Crops
                    </small>

                </div>

            </div>


            {
                message && (

                    <p className="home-builder-error">

                        {
                            message
                        }

                    </p>

                )
            }


            <button
                type="button"

                className="home-builder-continue-button"

                onClick={
                    generateDesign
                }
            >

                {
                    designSpace.layout
                        ? "Regenerate My Garden →"
                        : "Generate My Garden →"
                }

            </button>

        </section>

    );

}


export default HomeGardenDesignStep;