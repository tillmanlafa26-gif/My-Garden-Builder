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


import {
    generateSeasonalPlantingGuide
} from "../utils/seasonalPlantingPlanner";


import {
    generateIndoorLayout
} from "../utils/indoorLayoutEngine";


import IndoorLayoutPreview
    from "./IndoorLayoutPreview";


import GardenLayoutPreview
    from "./GardenLayoutPreview";


/* =========================================================
   DESIGN GOALS
========================================================= */

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


/* =========================================================
   DEFAULT BUILD OPTIONS
========================================================= */

const defaultBuildOptions = {
    bedLength: 8,
    bedWidth: 4,
    bedHeight: 12,
    bedMaterial: "cedar",
    walkwayWidth: 3,
    soilStrategy: "balanced",
    maxRaisedBeds: null
};


/* =========================================================
   COMPONENT
========================================================= */

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


    const indoorLayout =
        designSpace.indoorLayout ||
        null;


    const isIndoorSpace =
        designSpace.spaceType ===
        "indoor";


    /* =====================================================
       STATE
    ===================================================== */

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
        bedMaterial,
        setBedMaterial
    ] = useState(
        savedBuildOptions.bedMaterial ||
        "cedar"
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
        isIndoorSpace
            ? !indoorLayout
            : !designSpace.layout
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const [
        previewMode,
        setPreviewMode
    ] = useState(
        "2d"
    );


    /* =====================================================
       SAVED DATA
    ===================================================== */

    const selectedFeatures =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : [];


    const selectedIndoorPlants =
        Array.isArray(
            designSpace.indoorPlantGoals
        )
            ? designSpace.indoorPlantGoals
            : [];


    const selectedCrops =
        Array.isArray(
            designSpace.growGoals
        )
            ? designSpace.growGoals
            : [];


    const lastSpringFrost =
        designSpace.lastSpringFrost ||
        "";


    const firstFallFrost =
        designSpace.firstFallFrost ||
        "";


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


    const pairingHintItems =
        Array.isArray(
            designSpace
                .bedPlantingPlan
                ?.pairingGuide
                ?.bedGuides
        )
            ? designSpace
                .bedPlantingPlan
                .pairingGuide
                .bedGuides
                .flatMap(
                    (bed) =>
                        Array.isArray(
                            bed.pairings
                        )
                            ? bed.pairings
                            : []
                )
                .slice(
                    0,
                    3
                )
            : [];


    function scrollToDesignPriorities() {

        const prefersReducedMotion =
            window.matchMedia?.(
                "(prefers-reduced-motion: reduce)"
            )?.matches;


        document
            .querySelector(
                ".leafy-designer-priority-section"
            )
            ?.scrollIntoView({

                behavior:
                    prefersReducedMotion
                        ? "auto"
                        : "smooth",

                block:
                    "center"

            });

    }


    /* =====================================================
       BUILD OPTIONS
    ===================================================== */

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

            bedMaterial,

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


    /* =====================================================
       GENERATE DESIGN
    ===================================================== */

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


        /*
            Local seasonal recommendations
            are generated before bed allocation
            so the pairing engine can recognize
            succession opportunities and avoid
            treating every crop as if it occupies
            the bed at peak size at the same time.
        */

        const seasonalGuide =
            generateSeasonalPlantingGuide({

                selectedCrops,

                lastSpringFrost,

                firstFallFrost

            });


        const bedPlantingPlan =
            plantingPlan
                ? generateBedPlantingPlan({

                    layout,

                    plantingPlan,

                    selectedCrops,

                    features:
                        selectedFeatures,

                    seasonalGuide

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

                seasonalGuide,

                /*
                    A regenerated layout makes
                    old materials/build instructions
                    stale.

                    Step 6 recalculates them.
                */

                materials:
                    null,

                buildPlan:
                    null,

                /*
                    Regenerating the design changes
                    the physical plan. An active
                    garden must be reviewed, rebuilt,
                    and activated again before planned
                    planting actions can be tracked.
                */

                isActive:
                    false,

                activatedAt:
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


    /* =====================================================
       GENERATE INDOOR DESIGN
    ===================================================== */

    function generateIndoorDesign() {

        const width =
            Number(
                designSpace.width
            );


        const length =
            Number(
                designSpace.length
            );


        const height =
            Number(
                designSpace.height
            );


        if (
            width <= 0 ||
            length <= 0 ||
            height <= 0
        ) {
            setMessage(
                "Indoor width, depth, and height are required. Return to Step 1."
            );

            return;
        }


        if (
            selectedIndoorPlants.length ===
            0
        ) {
            setMessage(
                "Choose at least one indoor plant before generating the layout."
            );

            return;
        }


        const nextIndoorLayout =
            generateIndoorLayout({

                width,

                length,

                height,

                unit:
                    designSpace.unit ||
                    "ft",

                indoorSpaceType:
                    designSpace.indoorSpaceType ||
                    "shelf",

                selectedPlants:
                    selectedIndoorPlants,

                sunlight:
                    gardenProfile?.sunlight ||
                    "partial"

            });


        if (
            !nextIndoorLayout
        ) {
            setMessage(
                "We could not generate an indoor layout from these settings."
            );

            return;
        }


        const updatedProfile = {

            ...gardenProfile,

            designSpace: {

                ...designSpace,

                indoorLayout:
                    nextIndoorLayout,

                /*
                    Indoor layouts intentionally stay
                    separate from the outdoor layout
                    engine.
                */

                layout:
                    null,

                plantingPlan:
                    null,

                bedPlantingPlan:
                    null,

                seasonalGuide:
                    null,

                materials:
                    null,

                buildPlan:
                    null,

                isActive:
                    false,

                activatedAt:
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


    /* =====================================================
       INDOOR DESIGN
    ===================================================== */

    if (
        isIndoorSpace
    ) {

        if (
            selectedIndoorPlants.length ===
            0
        ) {
            return (
                <section
                    id="home-builder-step-design"
                    className="home-builder-step upcoming"
                >

                    <div className="home-builder-step-heading">

                        <span className="home-builder-step-number">
                            5
                        </span>


                        <div>

                            <small>
                                STEP 5
                            </small>


                            <h2>
                                🏠 Generate Indoor Layout
                            </h2>


                            <p>
                                Build a layout around mature plant size, pot footprint, vertical clearance, and light.
                            </p>

                        </div>

                    </div>


                    <div className="home-builder-locked">

                        <span>
                            🔒
                        </span>


                        <p>
                            Choose at least one indoor plant in Step 4 first.
                        </p>

                    </div>

                </section>
            );
        }


        if (
            indoorLayout &&
            !expanded
        ) {
            return (
                <section
                    id="home-builder-step-design"
                    className="home-builder-step complete collapsed"
                >

                    <div className="home-builder-step-heading">

                        <span className="home-builder-step-number">
                            ✓
                        </span>


                        <div>

                            <small>
                                STEP 5
                            </small>


                            <h2>
                                🏠 Indoor Layout
                            </h2>


                            <p>
                                Your indoor plant placement and light zones have been generated.
                            </p>

                        </div>

                    </div>


                    <div className="home-builder-collapsed-content">

                        <div className="home-builder-summary">

                            <strong>
                                {
                                    indoorLayout.icon
                                } {
                                    indoorLayout.indoorSpaceName
                                }
                            </strong>


                            <span>
                                {
                                    indoorLayout.stats
                                        ?.placedPlantCount ||
                                    0
                                } of {
                                    indoorLayout.stats
                                        ?.selectedPlantCount ||
                                    0
                                } plants placed • {
                                    indoorLayout.stats
                                        ?.growLightZoneCount ||
                                    0
                                } light zone{
                                    indoorLayout.stats
                                        ?.growLightZoneCount ===
                                    1
                                        ? ""
                                        : "s"
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
                            View
                        </button>

                    </div>

                </section>
            );
        }


        return (
            <section
                id="home-builder-step-design"
                className="home-builder-step active leafy-designer-step"
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">
                        {
                            indoorLayout
                                ? "✓"
                                : "5"
                        }
                    </span>


                    <div>

                        <small>
                            STEP 5
                        </small>


                        <h2>
                            🏠 Generate Indoor Layout
                        </h2>


                        <p>
                            Fit your selected plants into the real indoor space using mature plant size and available height.
                        </p>

                    </div>

                </div>


                <div className="leafy-designer-shell">

                    <div className="leafy-designer-screen-heading">

                        <div className="leafy-designer-title-lockup">

                            <span className="leafy-designer-title-icon">
                                🌱
                            </span>


                            <div>

                                <small>
                                    MY GARDEN BUILDER
                                </small>


                                <h3>
                                    Indoor Designer
                                </h3>


                                <p>
                                    Plan plant placement around your real room and available light.
                                </p>

                            </div>

                        </div>


                        <span className="leafy-designer-status">
                            🏠 Indoor
                        </span>

                    </div>


                    <div className="leafy-designer-mode-switch" aria-label="Current garden environment">

                        <span>
                            🌿 Outdoor Space
                        </span>


                        <span className="active">
                            🏠 Indoor Space
                        </span>

                    </div>


                    <div className="leafy-designer-setup-grid">

                        <article className="leafy-designer-setup-card">

                            <span className="leafy-designer-setup-icon">
                                📏
                            </span>


                            <div>

                                <small>
                                    ENTERED DIMENSIONS
                                </small>


                                <strong>
                                    {
                                        designSpace.width
                                    } × {
                                        designSpace.length
                                    } × {
                                        designSpace.height
                                    } {
                                        designSpace.unit ||
                                        "ft"
                                    }
                                </strong>


                                <span>
                                    Width • depth • height
                                </span>

                            </div>

                        </article>


                        <article className="leafy-designer-setup-card photo">

                            {
                                designSpace.spacePhoto?.dataUrl
                                    ? (
                                        <img
                                            src={
                                                designSpace.spacePhoto.dataUrl
                                            }
                                            alt="Saved indoor garden space"
                                        />
                                    )
                                    : (
                                        <span className="leafy-designer-setup-icon">
                                            📷
                                        </span>
                                    )
                            }


                            <div>

                                <small>
                                    SPACE PHOTO
                                </small>


                                <strong>
                                    {
                                        designSpace.spacePhoto?.dataUrl
                                            ? "Photo ready"
                                            : "Optional photo"
                                    }
                                </strong>


                                <span>
                                    {
                                        designSpace.spacePhoto?.dataUrl
                                            ? "Used as design context"
                                            : "Add one in Step 1"
                                    }
                                </span>

                            </div>

                        </article>

                    </div>


                    <div className="leafy-designer-context-strip">

                        <div>

                            <span>
                                🪴
                            </span>


                            <strong>
                                {
                                    designSpace.indoorSpaceType ===
                                    "windowsill"
                                        ? "Windowsill"
                                        : designSpace.indoorSpaceType ===
                                          "countertop"
                                            ? "Countertop"
                                            : designSpace.indoorSpaceType ===
                                              "plant-rack"
                                                ? "Plant Rack"
                                                : designSpace.indoorSpaceType ===
                                                  "floor"
                                                    ? "Floor / Corner"
                                                    : designSpace.indoorSpaceType ===
                                                      "grow-tent"
                                                        ? "Grow Tent"
                                                        : "Shelf"
                                }
                            </strong>


                            <small>
                                Space type
                            </small>

                        </div>


                        <div>

                            <span>
                                🌿
                            </span>


                            <strong>
                                {
                                    selectedIndoorPlants.length
                                }
                            </strong>


                            <small>
                                Selected plants
                            </small>

                        </div>


                        <div>

                            <span>
                                ☀️
                            </span>


                            <strong>
                                {
                                    gardenProfile?.sunlight ===
                                    "full"
                                        ? "Bright"
                                        : gardenProfile?.sunlight ===
                                          "partial"
                                            ? "Medium"
                                            : "Low"
                                }
                            </strong>


                            <small>
                                Available light
                            </small>

                        </div>

                    </div>

                </div>


                <div className="home-builder-build-stack">

                    <div className="home-indoor-design-input-summary">

                        <div>

                            <strong>
                                {
                                    designSpace.indoorSpaceType ===
                                    "windowsill"
                                        ? "🪟 Windowsill"
                                        : designSpace.indoorSpaceType ===
                                          "countertop"
                                            ? "🧱 Countertop"
                                            : designSpace.indoorSpaceType ===
                                              "plant-rack"
                                                ? "🪴 Plant Rack"
                                                : designSpace.indoorSpaceType ===
                                                  "floor"
                                                    ? "🏠 Floor / Corner"
                                                    : designSpace.indoorSpaceType ===
                                                      "grow-tent"
                                                        ? "⛺ Grow Tent"
                                                        : "📚 Shelf"
                                }
                            </strong>

                            <small>
                                {
                                    designSpace.width
                                } × {
                                    designSpace.length
                                } × {
                                    designSpace.height
                                } {
                                    designSpace.unit ||
                                    "ft"
                                }
                            </small>

                        </div>


                        <div>

                            <strong>
                                🪴 {
                                    selectedIndoorPlants.length
                                }
                            </strong>

                            <small>
                                Selected plant{
                                    selectedIndoorPlants.length ===
                                    1
                                        ? ""
                                        : "s"
                                }
                            </small>

                        </div>


                        <div>

                            <strong>
                                💡 {
                                    gardenProfile?.sunlight ===
                                    "full"
                                        ? "Bright"
                                        : gardenProfile?.sunlight ===
                                          "partial"
                                            ? "Medium"
                                            : "Low"
                                }
                            </strong>

                            <small>
                                Available light
                            </small>

                        </div>

                    </div>


                    {
                        indoorLayout && (

                            <IndoorLayoutPreview
                                indoorLayout={
                                    indoorLayout
                                }
                            />

                        )
                    }


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
                        className="home-builder-continue-button leafy-designer-primary-button"
                        onClick={
                            generateIndoorDesign
                        }
                    >
                        {
                            indoorLayout
                                ? "Refresh This Indoor Design"
                                : "Create My Indoor Design →"
                        }
                    </button>


                    {
                        indoorLayout && (

                            <button
                                type="button"
                                className="home-builder-secondary-button"
                                onClick={() =>
                                    setExpanded(
                                        false
                                    )
                                }
                            >
                                Keep This Layout
                            </button>

                        )
                    }

                </div>

            </section>
        );
    }


    /* =====================================================
       LOCKED
    ===================================================== */

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


    /* =====================================================
       COLLAPSED
    ===================================================== */

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
                            Your garden layout and
                            planting schedule have
                            been generated.
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

                            {
                                designSpace.seasonalGuide
                                    ? " • Planting schedule ✓"
                                    : ""
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


    /* =====================================================
       ACTIVE STEP
    ===================================================== */

    return (

        <section
            id="home-builder-step-design"
            className="home-builder-step active leafy-designer-step"
        >

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


            <div className="leafy-designer-shell">

                <div className="leafy-designer-screen-heading">

                    <div className="leafy-designer-title-lockup">

                        <span className="leafy-designer-title-icon">
                            🌱
                        </span>


                        <div>

                            <small>
                                MY GARDEN BUILDER
                            </small>


                            <h3>
                                Garden Designer
                            </h3>


                            <p>
                                Design your dream space, then turn the layout into a real build plan.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="leafy-designer-inspire-button"
                        onClick={
                            scrollToDesignPriorities
                        }
                    >
                        ✨ Get Inspired
                    </button>

                </div>


                <div className="leafy-designer-mode-switch" aria-label="Current garden environment">

                    <span className="active">
                        🌿 Outdoor Space
                    </span>


                    <span>
                        🏠 Indoor Space
                    </span>

                </div>


                <div className="leafy-designer-setup-grid">

                    <article className="leafy-designer-setup-card">

                        <span className="leafy-designer-setup-icon">
                            📏
                        </span>


                        <div>

                            <small>
                                ENTERED DIMENSIONS
                            </small>


                            <strong>
                                {
                                    designSpace.width
                                } × {
                                    designSpace.length
                                } {
                                    designSpace.unit ||
                                    "ft"
                                }
                            </strong>


                            <span>
                                Measured in Step 1
                            </span>

                        </div>

                    </article>


                    <article className="leafy-designer-setup-card photo">

                        {
                            designSpace.spacePhoto?.dataUrl
                                ? (
                                    <img
                                        src={
                                            designSpace.spacePhoto.dataUrl
                                        }
                                        alt="Saved outdoor garden space"
                                    />
                                )
                                : (
                                    <span className="leafy-designer-setup-icon">
                                        📷
                                    </span>
                                )
                        }


                        <div>

                            <small>
                                SPACE PHOTO
                            </small>


                            <strong>
                                {
                                    designSpace.spacePhoto?.dataUrl
                                        ? "Photo ready"
                                        : "Optional photo"
                                }
                            </strong>


                            <span>
                                {
                                    designSpace.spacePhoto?.dataUrl
                                        ? "Used as design context"
                                        : "Add one in Step 1"
                                }
                            </span>

                        </div>

                    </article>

                </div>


                <div className="leafy-designer-context-strip">

                    <div>

                        <span>
                            🌿
                        </span>


                        <strong>
                            {
                                designSpace.spaceType ===
                                "backyard"
                                    ? "Backyard"
                                    : designSpace.spaceType ===
                                      "patio"
                                        ? "Patio"
                                        : designSpace.spaceType ===
                                          "balcony"
                                            ? "Balcony"
                                            : "Outdoor"
                            }
                        </strong>


                        <small>
                            Space type
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

            </div>


            <div className="home-builder-field-group leafy-designer-priority-section">

                <div className="leafy-designer-subheading">

                    <div>

                        <small>
                            LAYOUT STYLE
                        </small>


                        <h3>
                            What should the design prioritize?
                        </h3>

                    </div>


                    <span>
                        Tap to switch
                    </span>

                </div>


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


                        <div className="leafy-designer-material-section">

                            <div className="leafy-designer-subheading compact">

                                <div>

                                    <small>
                                        BED MATERIAL
                                    </small>


                                    <h3>
                                        Choose the build style
                                    </h3>

                                </div>

                            </div>


                            <div className="leafy-designer-material-grid">

                                {
                                    [
                                        {
                                            id:
                                                "cedar",
                                            icon:
                                                "🪵",
                                            name:
                                                "Cedar",
                                            detail:
                                                "Natural"
                                        },
                                        {
                                            id:
                                                "composite",
                                            icon:
                                                "♻️",
                                            name:
                                                "Composite",
                                            detail:
                                                "Low upkeep"
                                        },
                                        {
                                            id:
                                                "metal",
                                            icon:
                                                "◻️",
                                            name:
                                                "Metal",
                                            detail:
                                                "Kit build"
                                        },
                                        {
                                            id:
                                                "pressure-treated",
                                            icon:
                                                "🔨",
                                            name:
                                                "Treated",
                                            detail:
                                                "Practical"
                                        }
                                    ].map(
                                        (material) => (

                                            <button
                                                type="button"
                                                key={
                                                    material.id
                                                }
                                                className={
                                                    bedMaterial ===
                                                    material.id
                                                        ? `leafy-material-card material-${material.id} selected`
                                                        : `leafy-material-card material-${material.id}`
                                                }
                                                aria-pressed={
                                                    bedMaterial ===
                                                    material.id
                                                }
                                                onClick={() =>
                                                    setBedMaterial(
                                                        material.id
                                                    )
                                                }
                                            >

                                                <span
                                                    className={
                                                        `leafy-material-swatch ${material.id}`
                                                    }
                                                    aria-hidden="true"
                                                />


                                                <strong>
                                                    {
                                                        material.name
                                                    }
                                                </strong>


                                                <small>
                                                    {
                                                        material.detail
                                                    }
                                                </small>

                                            </button>

                                        )
                                    )
                                }

                            </div>

                        </div>


                        <div className="leafy-designer-subheading compact">

                            <div>

                                <small>
                                    DIMENSIONS & PATHS
                                </small>


                                <h3>
                                    Tune the layout
                                </h3>

                            </div>

                        </div>


                        <div className="build-options-grid leafy-build-options-grid">

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
                designSpace.layout && (

                    <div className="leafy-designer-live-preview">

                        <div className="leafy-designer-subheading">

                            <div>

                                <small>
                                    LIVE DESIGN PREVIEW
                                </small>


                                <h3>
                                    Your Garden Layout
                                </h3>

                            </div>


                            <div
                                className="leafy-preview-toggle"
                                aria-label="Garden preview style"
                            >

                                <button
                                    type="button"
                                    className={
                                        previewMode ===
                                        "2d"
                                            ? "active"
                                            : ""
                                    }
                                    aria-pressed={
                                        previewMode ===
                                        "2d"
                                    }
                                    onClick={() =>
                                        setPreviewMode(
                                            "2d"
                                        )
                                    }
                                >
                                    2D
                                </button>


                                <button
                                    type="button"
                                    className={
                                        previewMode ===
                                        "3d"
                                            ? "active"
                                            : ""
                                    }
                                    aria-pressed={
                                        previewMode ===
                                        "3d"
                                    }
                                    onClick={() =>
                                        setPreviewMode(
                                            "3d"
                                        )
                                    }
                                >
                                    3D
                                </button>

                            </div>

                        </div>


                        <div
                            className={
                                previewMode ===
                                "3d"
                                    ? "leafy-layout-stage is-3d"
                                    : "leafy-layout-stage"
                            }
                        >

                            <GardenLayoutPreview
                                layout={
                                    designSpace.layout
                                }
                                bedPlantingPlan={
                                    designSpace.bedPlantingPlan
                                }
                            />

                        </div>


                        {
                            pairingHintItems.length >
                            0 && (

                                <div className="leafy-pairing-hints">

                                    <div className="leafy-designer-subheading compact">

                                        <div>

                                            <small>
                                                PLANT PAIRING HINTS
                                            </small>


                                            <h3>
                                                Crops that can share space well
                                            </h3>

                                        </div>

                                    </div>


                                    <div className="leafy-pairing-hint-grid">

                                        {
                                            pairingHintItems.map(
                                                (pairing) => (

                                                    <article
                                                        className="leafy-pairing-hint-card"
                                                        key={
                                                            pairing.id
                                                        }
                                                    >

                                                        <div className="leafy-pairing-hint-icons">

                                                            <span>
                                                                {
                                                                    pairing
                                                                        .firstCrop
                                                                        .icon
                                                                }
                                                            </span>


                                                            <span>
                                                                {
                                                                    pairing
                                                                        .secondCrop
                                                                        .icon
                                                                }
                                                            </span>

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    pairing
                                                                        .firstCrop
                                                                        .name
                                                                } + {
                                                                    pairing
                                                                        .secondCrop
                                                                        .name
                                                                }
                                                            </strong>


                                                            <small>
                                                                {
                                                                    pairing
                                                                        .seasonRelation ===
                                                                        "succession"
                                                                            ? "Good succession fit"
                                                                            : pairing
                                                                                .reasons[0]
                                                                }
                                                            </small>

                                                        </div>

                                                    </article>

                                                )
                                            )
                                        }

                                    </div>

                                </div>

                            )
                        }


                        {
                            designSpace.bedPlantingPlan
                                ?.pairingGuide && (

                                <div className="leafy-designer-pairing-strip">

                                    <div>

                                        <span>
                                            🤝
                                        </span>


                                        <strong>
                                            {
                                                designSpace
                                                    .bedPlantingPlan
                                                    .pairingGuide
                                                    .stats
                                                    ?.positivePairings ||
                                                0
                                            }
                                        </strong>


                                        <small>
                                            good pairings
                                        </small>

                                    </div>


                                    <div>

                                        <span>
                                            🔁
                                        </span>


                                        <strong>
                                            {
                                                designSpace
                                                    .bedPlantingPlan
                                                    .pairingGuide
                                                    .stats
                                                    ?.successionPairings ||
                                                0
                                            }
                                        </strong>


                                        <small>
                                            succession fits
                                        </small>

                                    </div>


                                    <div>

                                        <span>
                                            🌿
                                        </span>


                                        <strong>
                                            {
                                                designSpace
                                                    .bedPlantingPlan
                                                    .pairingGuide
                                                    .safeUtilizationPercent ||
                                                85
                                            }%
                                        </strong>


                                        <small>
                                            safe bed load
                                        </small>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                )
            }


            {
                (
                    lastSpringFrost ||
                    firstFallFrost
                ) && (

                    <div className="home-builder-finish-note">

                        <span>
                            📅
                        </span>


                        <div>

                            <strong>
                                Local planting schedule enabled
                            </strong>


                            <p>
                                Your frost dates will be
                                used to calculate crop-specific
                                planting windows.
                            </p>

                        </div>

                    </div>

                )
            }


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

                className="home-builder-continue-button leafy-designer-primary-button"

                onClick={
                    generateDesign
                }
            >

                {
                    designSpace.layout
                        ? "Update & Apply This Design →"
                        : "Create My Garden Design →"
                }

            </button>

        </section>

    );

}


export default HomeGardenDesignStep;