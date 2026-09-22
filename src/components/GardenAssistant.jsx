import {
    useState
} from "react";


import {
    parseGardenAssistantRequest
} from "../utils/gardenAssistantParser";


function getSunlightLabel(
    sunlight,
    environment
) {
    if (
        sunlight ===
        "full"
    ) {
        return environment ===
            "indoor"
                ? "Bright light"
                : "Full sun";
    }


    if (
        sunlight ===
        "partial"
    ) {
        return environment ===
            "indoor"
                ? "Medium / indirect light"
                : "Partial sun";
    }


    if (
        sunlight ===
        "shade"
    ) {
        return environment ===
            "indoor"
                ? "Low light"
                : "Mostly shade";
    }


    return "Not detected";
}


function getSpaceLabel(
    proposal
) {
    if (
        proposal.environment ===
        "indoor"
    ) {
        const labels = {
            windowsill:
                "Windowsill",
            countertop:
                "Countertop",
            shelf:
                "Shelf",
            "plant-rack":
                "Plant Rack",
            floor:
                "Floor / Corner",
            "grow-tent":
                "Grow Tent"
        };


        return labels[
            proposal.indoorSpaceType
        ] ||
        "Indoor";
    }


    const labels = {
        backyard:
            "Backyard",
        patio:
            "Patio",
        balcony:
            "Balcony",
        other:
            "Outdoor Space"
    };


    return labels[
        proposal.spaceType
    ] ||
    "Not detected";
}


function getGardenTypeLabel(
    gardenType
) {
    const labels = {
        container:
            "Container Garden",
        raised:
            "Raised Bed Garden",
        backyard:
            "Backyard Garden",
        balcony:
            "Balcony Garden",
        hydroponic:
            "Hydroponic Garden"
    };


    return labels[
        gardenType
    ] ||
    "Not detected";
}


function getFeatureLabel(
    featureId
) {
    const labels = {
        "raised-beds":
            "Raised Beds",
        containers:
            "Containers",
        "vertical-growing":
            "Vertical Growing",
        trellis:
            "Trellis",
        compost:
            "Compost",
        irrigation:
            "Irrigation",
        hydroponics:
            "Hydroponics"
    };


    return labels[
        featureId
    ] ||
    featureId;
}


function GardenAssistant({
    onApplyProposal
}) {
    const [
        requestText,
        setRequestText
    ] = useState(
        ""
    );


    const [
        proposal,
        setProposal
    ] = useState(
        null
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    function analyzeRequest() {
        const trimmed =
            requestText.trim();


        if (
            !trimmed
        ) {
            setMessage(
                "Describe the garden space you want to build first."
            );

            setProposal(
                null
            );

            return;
        }


        const nextProposal =
            parseGardenAssistantRequest(
                trimmed
            );


        setProposal(
            nextProposal
        );


        setMessage(
            ""
        );
    }


    function applyProposal() {
        if (
            !proposal ||
            typeof onApplyProposal !==
                "function"
        ) {
            return;
        }


        onApplyProposal(
            proposal
        );


        setMessage(
            "✓ Detected details were added to the Garden Builder. Review each step before generating the design."
        );
    }


    return (
        <section className="garden-assistant-card">

            <div className="garden-assistant-heading">

                <span className="garden-assistant-icon">
                    ✨
                </span>


                <div>

                    <small>
                        AI GARDEN ASSISTANT — PHASE 1
                    </small>


                    <h2>
                        Describe the Garden You Want
                    </h2>


                    <p>
                        Write naturally. This first phase converts your description into structured Garden Builder inputs locally so you can review them before a model connection is added.
                    </p>

                </div>

            </div>


            <label className="garden-assistant-input">

                <span>
                    Garden description
                </span>


                <textarea
                    value={
                        requestText
                    }
                    onChange={
                        (event) =>
                            setRequestText(
                                event.target.value
                            )
                    }
                    rows="5"
                    placeholder="Example: I have a 10 x 12 backyard with full sun. I want raised beds with tomatoes, peppers, basil, and carrots plus drip irrigation."
                />

            </label>


            <div className="garden-assistant-example-row">

                <button
                    type="button"
                    onClick={() =>
                        setRequestText(
                            "I have a 10 x 12 backyard with full sun. I want raised beds with tomatoes, peppers, basil, carrots, and drip irrigation."
                        )
                    }
                >
                    Outdoor example
                </button>


                <button
                    type="button"
                    onClick={() =>
                        setRequestText(
                            "I have a 4 x 2 x 6 foot indoor plant rack with medium light. I want pothos, basil, lettuce, and a snake plant with grow lights."
                        )
                    }
                >
                    Indoor example
                </button>

            </div>


            <button
                type="button"
                className="garden-assistant-analyze-button"
                onClick={
                    analyzeRequest
                }
            >
                Analyze My Description
            </button>


            {
                message && (

                    <p
                        className={
                            message.startsWith(
                                "✓"
                            )
                                ? "garden-assistant-success"
                                : "garden-assistant-error"
                        }
                    >
                        {
                            message
                        }
                    </p>

                )
            }


            {
                proposal && (

                    <div className="garden-assistant-results">

                        <div className="garden-assistant-results-heading">

                            <div>

                                <strong>
                                    Assistant Draft
                                </strong>


                                <small>
                                    Review what was detected before applying it.
                                </small>

                            </div>


                            <span>
                                {
                                    proposal.detectedFieldCount
                                } fields detected
                            </span>

                        </div>


                        <div className="garden-assistant-result-grid">

                            <div>

                                <small>
                                    Environment
                                </small>

                                <strong>
                                    {
                                        proposal.environment ===
                                        "indoor"
                                            ? "🏠 Indoor"
                                            : proposal.environment ===
                                              "outdoor"
                                                ? "🌱 Outdoor"
                                                : "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Space
                                </small>

                                <strong>
                                    {
                                        getSpaceLabel(
                                            proposal
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Dimensions
                                </small>

                                <strong>
                                    {
                                        proposal.dimensions
                                            ? (
                                                <>
                                                    {
                                                        proposal.dimensions.width
                                                    } × {
                                                        proposal.dimensions.length
                                                    }{
                                                        proposal.dimensions.height
                                                            ? ` × ${proposal.dimensions.height}`
                                                            : ""
                                                    } {
                                                        proposal.dimensions.unit
                                                    }
                                                </>
                                            )
                                            : "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Light
                                </small>

                                <strong>
                                    {
                                        getSunlightLabel(
                                            proposal.sunlight,
                                            proposal.environment
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Growing System
                                </small>

                                <strong>
                                    {
                                        getGardenTypeLabel(
                                            proposal.gardenType
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {
                            proposal.selectionNames.length >
                            0 && (

                                <div className="garden-assistant-detected-group">

                                    <strong>
                                        {
                                            proposal.environment ===
                                            "indoor"
                                                ? "🪴 Plants"
                                                : "🥕 Crops"
                                        }
                                    </strong>


                                    <div className="garden-assistant-chips">

                                        {
                                            proposal.selectionNames.map(
                                                (name) => (

                                                    <span
                                                        key={
                                                            name
                                                        }
                                                    >
                                                        {
                                                            name
                                                        }
                                                    </span>

                                                )
                                            )
                                        }

                                    </div>

                                </div>

                            )
                        }


                        {
                            proposal.features.length >
                            0 && (

                                <div className="garden-assistant-detected-group">

                                    <strong>
                                        🧱 Features
                                    </strong>


                                    <div className="garden-assistant-chips">

                                        {
                                            proposal.features.map(
                                                (feature) => (

                                                    <span
                                                        key={
                                                            feature
                                                        }
                                                    >
                                                        {
                                                            getFeatureLabel(
                                                                feature
                                                            )
                                                        }
                                                    </span>

                                                )
                                            )
                                        }

                                    </div>

                                </div>

                            )
                        }


                        {
                            proposal.missingFields.length >
                            0 && (

                                <div className="garden-assistant-missing">

                                    <strong>
                                        Still needs review
                                    </strong>


                                    <p>
                                        {
                                            proposal.missingFields.join(
                                                " • "
                                            )
                                        }
                                    </p>

                                </div>

                            )
                        }


                        <button
                            type="button"
                            className="garden-assistant-apply-button"
                            onClick={
                                applyProposal
                            }
                        >
                            Use These Answers in Garden Builder →
                        </button>


                        <small className="garden-assistant-disclaimer">
                            The assistant never generates the final layout directly. Your existing garden engines still handle spacing, fit, pairing, materials, and indoor placement.
                        </small>

                    </div>

                )
            }

        </section>
    );
}


export default GardenAssistant;
