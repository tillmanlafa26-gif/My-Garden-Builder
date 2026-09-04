import {
    useMemo,
    useState
} from "react";


import GardenLayoutPreview
    from "./GardenLayoutPreview";

import GardenMaterials
    from "./GardenMaterials";

import GardenBuildPlan
    from "./GardenBuildPlan";

import GardenPlantingPlan
    from "./GardenPlantingPlan";

import GardenBedPlantingMap
    from "./GardenBedPlantingMap";

import SeasonalPlantingGuide
    from "./SeasonalPlantingGuide";


import {
    calculateGardenMaterials
} from "../utils/materialsCalculator";


import {
    generateBuildPlan
} from "../utils/buildPlanGenerator";


function HomeGardenBuildStep({
    gardenProfile,
    onSaveGardenProfile
}) {

    const designSpace =
        gardenProfile?.designSpace ||
        {};


    const layout =
        designSpace.layout ||
        null;


    const buildOptions =
        designSpace.buildOptions ||
        {};


    const selectedFeatures =
        Array.isArray(
            designSpace.features
        )
            ? designSpace.features
            : [];


    const buildAlreadySaved =
        Boolean(
            designSpace.materials
        ) &&
        Boolean(
            designSpace.buildPlan
        );


    const [
        expanded,
        setExpanded
    ] = useState(
        !buildAlreadySaved
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const materialPlan =
        useMemo(
            () => {

                if (
                    !layout
                ) {

                    return null;

                }


                return calculateGardenMaterials(
                    layout,
                    buildOptions
                );

            },
            [
                layout,
                buildOptions
            ]
        );


    const buildPlan =
        useMemo(
            () => {

                if (
                    !layout ||
                    !materialPlan
                ) {

                    return null;

                }


                return generateBuildPlan({

                    layout,

                    materialPlan,

                    buildOptions,

                    surface:
                        designSpace.surface ||
                        "grass",

                    features:
                        selectedFeatures

                });

            },
            [
                layout,
                materialPlan,
                buildOptions,
                designSpace.surface,
                selectedFeatures
            ]
        );


    function saveBuildPlan() {

        if (
            !layout
        ) {

            setMessage(
                "Generate your garden layout before creating the build plan."
            );

            return;

        }


        if (
            !materialPlan ||
            !buildPlan
        ) {

            setMessage(
                "The materials or build instructions could not be generated."
            );

            return;

        }


        const updatedProfile = {

            ...gardenProfile,

            designSpace: {

                ...designSpace,

                materials:
                    materialPlan,

                buildPlan,

                isActive:
                    buildAlreadySaved
                        ? Boolean(
                            designSpace.isActive
                        )
                        : false,

                activatedAt:
                    buildAlreadySaved
                        ? designSpace.activatedAt ||
                          null
                        : null

            }

        };


        onSaveGardenProfile(
            updatedProfile
        );


        setMessage(
            "✓ Your garden plan is complete. Planting guidance, materials, and build instructions have been saved."
        );

    }


    if (
        !layout
    ) {

        return (

            <section
                id="home-builder-step-build"
                className="home-builder-step upcoming"
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">
                        6
                    </span>


                    <div>

                        <small>
                            STEP 6
                        </small>


                        <h2>
                            🔨 Review & Build
                        </h2>


                        <p>
                            Review your garden plan,
                            planting schedule, materials,
                            and instructions.
                        </p>

                    </div>

                </div>


                <div className="home-builder-locked">

                    <span>
                        🔒
                    </span>


                    <p>
                        Generate your garden
                        design first.
                    </p>

                </div>

            </section>

        );

    }


    if (
        buildAlreadySaved &&
        !expanded
    ) {

        return (

            <section
                id="home-builder-step-build"
                className="home-builder-step complete collapsed"
            >

                <div className="home-builder-step-heading">

                    <span className="home-builder-step-number">
                        ✓
                    </span>


                    <div>

                        <small>
                            STEP 6
                        </small>


                        <h2>
                            🔨 Garden Plan Complete
                        </h2>


                        <p>
                            Your garden is ready
                            to build and grow.
                        </p>

                    </div>

                </div>


                <div className="home-builder-collapsed-content">

                    <div className="home-builder-summary">

                        <strong>
                            ✓ Garden Plan Ready
                        </strong>


                        <span>
                            Planting • Materials • Instructions
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
            id="home-builder-step-build"
            className="home-builder-step active"
        >

            <div className="home-builder-step-heading">

                <span className="home-builder-step-number">

                    {
                        buildAlreadySaved
                            ? "✓"
                            : "6"
                    }

                </span>


                <div>

                    <small>
                        STEP 6
                    </small>


                    <h2>
                        🔨 Review & Build
                    </h2>


                    <p>
                        Review the complete plan
                        before finishing your garden.
                    </p>

                </div>

            </div>


            <div className="home-builder-build-stack">


                <div className="home-build-review-heading">

                    <span>
                        🗺️
                    </span>


                    <div>

                        <strong>
                            Your Garden Layout
                        </strong>


                        <small>
                            Review the physical design.
                        </small>

                    </div>

                </div>


                <GardenLayoutPreview
                    layout={
                        layout
                    }

                    bedPlantingPlan={
                        designSpace
                            .bedPlantingPlan ||
                        null
                    }
                />


                {
                    designSpace.plantingPlan && (

                        <GardenPlantingPlan
                            plantingPlan={
                                designSpace.plantingPlan
                            }
                        />

                    )
                }


                {
                    designSpace.seasonalGuide && (

                        <SeasonalPlantingGuide
                            seasonalGuide={
                                designSpace.seasonalGuide
                            }
                        />

                    )
                }


                {
                    designSpace.bedPlantingPlan && (

                        <GardenBedPlantingMap
                            bedPlantingPlan={
                                designSpace.bedPlantingPlan
                            }
                        />

                    )
                }


                {
                    materialPlan && (

                        <GardenMaterials
                            materialPlan={
                                materialPlan
                            }
                        />

                    )
                }


                {
                    buildPlan && (

                        <GardenBuildPlan
                            buildPlan={
                                buildPlan
                            }
                        />

                    )
                }


                <div className="home-builder-finish-note">

                    <span>
                        🌱
                    </span>


                    <div>

                        <strong>
                            Ready to Build and Grow?
                        </strong>


                        <p>
                            Save this plan to complete
                            the Garden Builder. Your
                            layout, crop placement,
                            planting schedule, materials,
                            and instructions will be
                            available under My Garden.
                        </p>

                    </div>

                </div>


                {
                    message && (

                        <p
                            className={
                                message.startsWith(
                                    "✓"
                                )
                                    ? "home-builder-success"
                                    : "home-builder-error"
                            }
                        >

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
                        saveBuildPlan
                    }
                >

                    {
                        buildAlreadySaved
                            ? "Save Updated Garden Plan ✓"
                            : "Finish My Garden ✓"
                    }

                </button>


                {
                    buildAlreadySaved && (

                        <button
                            type="button"

                            className="home-builder-secondary-button"

                            onClick={() =>
                                setExpanded(
                                    false
                                )
                            }
                        >

                            Collapse Garden Plan

                        </button>

                    )
                }

            </div>

        </section>

    );

}


export default HomeGardenBuildStep;