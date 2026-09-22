import {
    useState
} from "react";


import {
    analyzeGardenAssistantFollowUp,
    analyzeGardenAssistantRequest
} from "../utils/gardenAssistantApi";


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


function getFollowUpQuestion(
    proposal
) {
    const missingField =
        proposal?.missingFields?.[0];


    if (
        !missingField
    ) {
        return null;
    }


    const questions = {
        "Indoor or outdoor space":
            "Is this garden space indoors or outdoors?",

        "Width × depth/length":
            proposal.environment ===
            "indoor"
                ? "What are the usable width and depth of the indoor growing space? For example: 4 x 2 feet."
                : "What are the width and length of the garden area? For example: 10 x 12 feet.",

        "Usable indoor height":
            "How much usable vertical height do you have? For example: 6 feet or 72 inches.",

        "Available light":
            "What light does the indoor space receive: bright, medium/indirect, or low light?",

        "Daily sunlight":
            "How much sunlight does the outdoor space receive: full sun, partial sun, or mostly shade?",

        "Indoor plant selections":
            "Which indoor plants would you like to grow? You can list several, such as pothos, basil, lettuce, or snake plant.",

        "Crop selections":
            "Which crops would you like to grow? You can list several, such as tomatoes, peppers, basil, or carrots."
    };


    return {
        missingField,

        question:
            questions[
                missingField
            ] ||
            `Tell me more about: ${missingField}.`
    };
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


    const [
        analyzing,
        setAnalyzing
    ] = useState(
        false
    );


    const [
        followUpAnswer,
        setFollowUpAnswer
    ] = useState(
        ""
    );


    const [
        followUpHistory,
        setFollowUpHistory
    ] = useState(
        []
    );


    async function analyzeRequest() {
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


        setAnalyzing(
            true
        );


        setMessage(
            ""
        );


        try {
            const nextProposal =
                await analyzeGardenAssistantRequest(
                    trimmed
                );


            setProposal(
                nextProposal
            );


            setFollowUpHistory(
                []
            );


            setFollowUpAnswer(
                ""
            );


            if (
                nextProposal.analysisSource ===
                    "local" &&
                nextProposal.analysisNotice
            ) {
                setMessage(
                    nextProposal.analysisNotice
                );
            }
        } finally {
            setAnalyzing(
                false
            );
        }
    }


    async function submitFollowUp() {
        const followUp =
            getFollowUpQuestion(
                proposal
            );


        const trimmed =
            followUpAnswer.trim();


        if (
            !proposal ||
            !followUp ||
            !trimmed
        ) {
            setMessage(
                "Enter an answer to the follow-up question."
            );

            return;
        }


        setAnalyzing(
            true
        );


        setMessage(
            ""
        );


        try {
            const nextProposal =
                await analyzeGardenAssistantFollowUp({
                    originalRequest:
                        requestText,

                    currentProposal:
                        proposal,

                    missingField:
                        followUp.missingField,

                    answer:
                        trimmed
                });


            setFollowUpHistory(
                (current) => [
                    ...current,

                    {
                        question:
                            followUp.question,

                        answer:
                            trimmed
                    }
                ]
            );


            setProposal(
                nextProposal
            );


            setFollowUpAnswer(
                ""
            );


            if (
                nextProposal.analysisSource ===
                    "local" &&
                nextProposal.analysisNotice
            ) {
                setMessage(
                    nextProposal.analysisNotice
                );
            }
        } finally {
            setAnalyzing(
                false
            );
        }
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
                        AI GARDEN ASSISTANT — PHASE 3
                    </small>


                    <h2>
                        Describe the Garden You Want
                    </h2>


                    <p>
                        Write naturally. The assistant interprets the request, validates it against My Garden Builder, and asks one focused follow-up question at a time when important information is missing.
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
                    disabled={
                        analyzing
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
                    disabled={
                        analyzing
                    }
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
                    disabled={
                        analyzing
                    }
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
                disabled={
                    analyzing
                }
                aria-busy={
                    analyzing
                }
            >
                {
                    analyzing
                        ? "Analyzing Garden…"
                        : "Analyze My Description"
                }
            </button>


            {
                message && (

                    <p
                        className={
                            message.startsWith(
                                "✓"
                            )
                                ? "garden-assistant-success"
                                : message.includes(
                                    "built-in parser"
                                )
                                    ? "garden-assistant-notice"
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


                            <div className="garden-assistant-result-badges">

                                <span>
                                    {
                                        proposal.detectedFieldCount
                                    } fields detected
                                </span>


                                <span
                                    className={
                                        proposal.analysisSource ===
                                        "ai"
                                            ? "ai-source"
                                            : "local-source"
                                    }
                                >
                                    {
                                        proposal.analysisSource ===
                                        "ai"
                                            ? "✨ AI interpreted"
                                            : "⚙ Local parser"
                                    }
                                </span>

                            </div>

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
                            Array.isArray(
                                proposal.notes
                            ) &&
                            proposal.notes.length >
                            0 && (

                                <div className="garden-assistant-notes">

                                    <strong>
                                        Assistant notes
                                    </strong>


                                    {
                                        proposal.notes.map(
                                            (
                                                note,
                                                index
                                            ) => (

                                                <p
                                                    key={
                                                        `assistant-note-${index}`
                                                    }
                                                >
                                                    {
                                                        note
                                                    }
                                                </p>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }


                        {
                            followUpHistory.length >
                            0 && (

                                <div className="garden-assistant-conversation-history">

                                    <strong>
                                        Conversation
                                    </strong>


                                    {
                                        followUpHistory.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        `assistant-history-${index}`
                                                    }
                                                    className="garden-assistant-history-item"
                                                >

                                                    <span>
                                                        Assistant
                                                    </span>


                                                    <p>
                                                        {
                                                            item.question
                                                        }
                                                    </p>


                                                    <span>
                                                        You
                                                    </span>


                                                    <p>
                                                        {
                                                            item.answer
                                                        }
                                                    </p>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }


                        {
                            proposal.missingFields.length >
                            0 && (

                                <div className="garden-assistant-followup">

                                    <div className="garden-assistant-followup-heading">

                                        <span>
                                            💬
                                        </span>


                                        <div>

                                            <strong>
                                                One more detail
                                            </strong>


                                            <p>
                                                {
                                                    getFollowUpQuestion(
                                                        proposal
                                                    )?.question
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="garden-assistant-followup-input-row">

                                        <input
                                            type="text"
                                            value={
                                                followUpAnswer
                                            }
                                            disabled={
                                                analyzing
                                            }
                                            onChange={
                                                (event) =>
                                                    setFollowUpAnswer(
                                                        event.target.value
                                                    )
                                            }
                                            onKeyDown={
                                                (event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        event.preventDefault();

                                                        submitFollowUp();
                                                    }
                                                }
                                            }
                                            placeholder="Type your answer…"
                                            aria-label="Answer the assistant follow-up question"
                                        />


                                        <button
                                            type="button"
                                            onClick={
                                                submitFollowUp
                                            }
                                            disabled={
                                                analyzing ||
                                                !followUpAnswer.trim()
                                            }
                                        >
                                            {
                                                analyzing
                                                    ? "Checking…"
                                                    : "Add Answer"
                                            }
                                        </button>

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


                        {
                            proposal.missingFields.length ===
                            0 && (

                                <div className="garden-assistant-ready">

                                    <span>
                                        ✓
                                    </span>


                                    <div>

                                        <strong>
                                            Enough information to continue
                                        </strong>


                                        <p>
                                            The structured draft is ready to send into the Garden Builder for your review.
                                        </p>

                                    </div>

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
                            AI interprets the description only. Your deterministic garden engines remain responsible for dimensions, spacing, fit, plant pairing, indoor placement, materials, and build calculations.
                        </small>

                    </div>

                )
            }

        </section>
    );
}


export default GardenAssistant;
