import {
    useState
} from "react";

import BottomNav
    from "../components/BottomNav";

import {
    gardenPlans,
    gardenSizeNames,
    sunlightNames,
    plantRecommendations,
    spaceRecommendations
} from "../data/gardenPlans";


function Garden({
    gardenProfile,
    onSaveGardenProfile
}) {

    const [
        gardenType,
        setGardenType
    ] = useState(
        gardenProfile?.type || ""
    );


    const [
        gardenSize,
        setGardenSize
    ] = useState(
        gardenProfile?.size || ""
    );


    const [
        sunlight,
        setSunlight
    ] = useState(
        gardenProfile?.sunlight || ""
    );


    const [
        showPlan,
        setShowPlan
    ] = useState(
        Boolean(gardenProfile)
    );


    const [
        message,
        setMessage
    ] = useState("");


    function handleSubmit(event) {

        event.preventDefault();


        if (!gardenType) {

            setMessage(
                "Please choose a garden type."
            );

            return;

        }


        if (!gardenSize) {

            setMessage(
                "Please choose your garden size."
            );

            return;

        }


        if (!sunlight) {

            setMessage(
                "Please choose the sunlight level."
            );

            return;

        }


        const newProfile = {
            type: gardenType,
            size: gardenSize,
            sunlight: sunlight
        };


        console.log(
            "Saving garden profile:",
            newProfile
        );


        onSaveGardenProfile(
            newProfile
        );


        setShowPlan(true);

        setMessage(
            "✓ Garden plan saved!"
        );

    }


    const selectedPlan =
        gardenType
            ? gardenPlans[gardenType]
            : null;


    return (

        <div className="app-container">


            <header className="app-header">

                <h1>
                    🪴 Build My Garden
                </h1>

                <p>
                    Tell us about your growing
                    space and we'll build a
                    starter plan.
                </p>

            </header>


            <section className="builder-section">

                <form
                    id="garden-builder-form"
                    onSubmit={
                        handleSubmit
                    }
                >


                    <fieldset className="builder-fieldset">

                        <legend>
                            1. What type of garden
                            do you want?
                        </legend>


                        <div className="garden-type-grid">


                            <GardenOption
                                id="container"
                                icon="🪴"
                                title="Container"
                                description="Pots and planters"
                                selected={
                                    gardenType
                                }
                                setSelected={
                                    setGardenType
                                }
                            />


                            <GardenOption
                                id="raised"
                                icon="🥕"
                                title="Raised Bed"
                                description="Elevated garden beds"
                                selected={
                                    gardenType
                                }
                                setSelected={
                                    setGardenType
                                }
                            />


                            <GardenOption
                                id="backyard"
                                icon="🌳"
                                title="Backyard"
                                description="Traditional garden"
                                selected={
                                    gardenType
                                }
                                setSelected={
                                    setGardenType
                                }
                            />


                            <GardenOption
                                id="balcony"
                                icon="🏢"
                                title="Balcony"
                                description="Small-space garden"
                                selected={
                                    gardenType
                                }
                                setSelected={
                                    setGardenType
                                }
                            />


                            <GardenOption
                                id="hydroponic"
                                icon="💧"
                                title="Hydroponic"
                                description="Soil-free growing"
                                selected={
                                    gardenType
                                }
                                setSelected={
                                    setGardenType
                                }
                            />


                        </div>

                    </fieldset>


                    <div className="builder-question">

                        <label htmlFor="garden-size">

                            2. How much space
                            do you have?

                        </label>


                        <select
                            id="garden-size"

                            value={
                                gardenSize
                            }

                            onChange={
                                (event) =>
                                    setGardenSize(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="">
                                Select your space
                            </option>

                            <option value="small">
                                Small
                            </option>

                            <option value="medium">
                                Medium
                            </option>

                            <option value="large">
                                Large
                            </option>

                        </select>

                    </div>


                    <div className="builder-question">

                        <label htmlFor="garden-sunlight">

                            3. How much sunlight
                            does your garden receive?

                        </label>


                        <select
                            id="garden-sunlight"

                            value={
                                sunlight
                            }

                            onChange={
                                (event) =>
                                    setSunlight(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="">
                                Select sunlight
                            </option>

                            <option value="full">
                                Full Sun — 6+ hours
                            </option>

                            <option value="partial">
                                Partial Sun — 3–6 hours
                            </option>

                            <option value="shade">
                                Mostly Shade — under 3 hours
                            </option>

                        </select>

                    </div>


                    {message && (

                        <p className="garden-save-message">

                            {message}

                        </p>

                    )}


                    <button
                        type="submit"
                        className="build-garden-button"
                    >

                        🌱 Save Garden Plan

                    </button>


                </form>

            </section>


            {
                showPlan &&
                selectedPlan &&
                gardenSize &&
                sunlight &&
                (

                    <GardenPlan
                        plan={
                            selectedPlan
                        }

                        gardenSize={
                            gardenSize
                        }

                        sunlight={
                            sunlight
                        }
                    />

                )
            }


            <BottomNav />

        </div>

    );

}



function GardenOption({
    id,
    icon,
    title,
    description,
    selected,
    setSelected
}) {

    return (

        <div className="garden-type-option">

            <input
                type="radio"

                name="garden-type"

                id={id}

                value={id}

                checked={
                    selected === id
                }

                onChange={() =>
                    setSelected(id)
                }
            />


            <label htmlFor={id}>

                <span className="garden-type-icon">
                    {icon}
                </span>

                <strong>
                    {title}
                </strong>

                <small>
                    {description}
                </small>

            </label>

        </div>

    );

}



function GardenPlan({
    plan,
    gardenSize,
    sunlight
}) {

    const recommendedPlants =
        plantRecommendations[
            sunlight
        ] || [];


    return (

        <section className="garden-plan">


            <h2>

                {plan.icon}
                {" "}
                Your {plan.name}

            </h2>


            <p className="garden-plan-summary">

                {
                    gardenSizeNames[
                        gardenSize
                    ]
                }

                {" • "}

                {
                    sunlightNames[
                        sunlight
                    ]
                }

            </p>


            <div className="garden-plan-card">

                <h3>
                    🧰 Recommended Supplies
                </h3>


                <ul>

                    {plan.supplies.map(
                        (supply) => (

                            <li key={supply}>
                                {supply}
                            </li>

                        )
                    )}

                </ul>

            </div>


            <div className="garden-plan-card">

                <h3>
                    🌱 Starter Plants
                </h3>


                <ul>

                    {recommendedPlants.map(
                        (plant) => (

                            <li key={plant}>
                                {plant}
                            </li>

                        )
                    )}

                </ul>

            </div>


            <div className="garden-plan-card">

                <h3>
                    📐 Space Recommendation
                </h3>


                <p>

                    {
                        spaceRecommendations[
                            gardenSize
                        ]
                    }

                </p>

            </div>


        </section>

    );

}


export default Garden;