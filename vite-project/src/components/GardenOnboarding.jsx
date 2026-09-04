import {
    useEffect,
    useState
} from "react";


const onboardingSteps = [
    {
        id: "welcome",
        icon: "🌱",
        eyebrow: "WELCOME",
        title: "Build a Garden That Fits Your Space",
        description:
            "My Garden Builder walks you from an empty space to a complete garden design, crop plan, materials list, and build instructions."
    },
    {
        id: "space",
        icon: "📐",
        eyebrow: "STEP 1",
        title: "Define Your Space",
        description:
            "Start with the real area you have available. Choose where the garden will go, enter its dimensions, and tell us what surface is underneath it."
    },
    {
        id: "conditions",
        icon: "☀️",
        eyebrow: "STEP 2",
        title: "Add Growing Conditions",
        description:
            "Choose your garden system, sunlight level, USDA growing zone, and optional location so future recommendations can match your local conditions."
    },
    {
        id: "features",
        icon: "🧰",
        eyebrow: "STEP 3",
        title: "Choose Garden Features",
        description:
            "Select raised beds, containers, trellises, vertical growing, composting, irrigation, hydroponics, or keep the setup simple."
    },
    {
        id: "crops",
        icon: "🥕",
        eyebrow: "STEP 4",
        title: "Choose What You Want to Grow",
        description:
            "Search the crop library and select the vegetables, herbs, fruits, and root crops you want the garden design to support."
    },
    {
        id: "design",
        icon: "🗺️",
        eyebrow: "STEP 5",
        title: "Generate Your Garden Design",
        description:
            "Choose a design priority such as balanced, maximum growing, easy access, or simple build. My Garden Builder then creates a layout for your actual space."
    },
    {
        id: "build",
        icon: "🔨",
        eyebrow: "STEP 6",
        title: "Build Your Garden",
        description:
            "Review your layout, recommended materials, quantities, planting plan, and step-by-step build instructions. Your finished plan is saved under My Garden."
    },
    {
        id: "manage",
        icon: "🪴",
        eyebrow: "AFTER BUILDING",
        title: "Grow and Manage Your Garden",
        description:
            "Use My Garden, Plants, Calendar, watering reminders, weather, tasks, and your journal as you move from planning into actually growing your garden."
    }
];


function GardenOnboarding() {

    const [
        isOpen,
        setIsOpen
    ] = useState(
        () => {

            try {

                return (
                    localStorage.getItem(
                        "gardenOnboardingSeen"
                    ) !== "true"
                );

            } catch {

                return true;

            }

        }
    );


    const [
        currentStep,
        setCurrentStep
    ] = useState(
        0
    );


    const step =
        onboardingSteps[
            currentStep
        ];


    const isFirstStep =
        currentStep === 0;


    const isLastStep =
        currentStep ===
        onboardingSteps.length - 1;


    /* =====================================================
       SAVE SEEN STATE
    ===================================================== */

    function rememberOnboarding() {

        try {

            localStorage.setItem(
                "gardenOnboardingSeen",
                "true"
            );

        } catch (error) {

            console.error(
                "Unable to save onboarding preference:",
                error
            );

        }

    }


    /* =====================================================
       OPEN
    ===================================================== */

    function openOnboarding() {

        setCurrentStep(
            0
        );


        setIsOpen(
            true
        );

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function closeOnboarding() {

        rememberOnboarding();


        setIsOpen(
            false
        );

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function goNext() {

        if (
            isLastStep
        ) {

            closeOnboarding();

            return;

        }


        setCurrentStep(
            (current) =>
                current + 1
        );

    }


    /* =====================================================
       BACK
    ===================================================== */

    function goBack() {

        setCurrentStep(
            (current) =>
                Math.max(
                    0,
                    current - 1
                )
        );

    }


    /* =====================================================
       SETTINGS EVENT

       AppSettings dispatches this event when
       the user selects "How to Use".
    ===================================================== */

    useEffect(
        () => {

            function handleOpenOnboarding() {

                openOnboarding();

            }


            window.addEventListener(
                "garden-open-onboarding",
                handleOpenOnboarding
            );


            return () => {

                window.removeEventListener(
                    "garden-open-onboarding",
                    handleOpenOnboarding
                );

            };

        },
        []
    );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(
        () => {

            if (
                !isOpen
            ) {

                return undefined;

            }


            function handleKeyDown(
                event
            ) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeOnboarding();

                }

            }


            window.addEventListener(
                "keydown",
                handleKeyDown
            );


            return () => {

                window.removeEventListener(
                    "keydown",
                    handleKeyDown
                );

            };

        },
        [
            isOpen
        ]
    );


    /* =====================================================
       PREVENT BACKGROUND SCROLL
    ===================================================== */

    useEffect(
        () => {

            if (
                !isOpen
            ) {

                return undefined;

            }


            const previousOverflow =
                document.body.style.overflow;


            document.body.style.overflow =
                "hidden";


            return () => {

                document.body.style.overflow =
                    previousOverflow;

            };

        },
        [
            isOpen
        ]
    );


    /* =====================================================
       CLOSED
    ===================================================== */

    if (
        !isOpen
    ) {

        return null;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div
            className="garden-onboarding-overlay"

            role="presentation"
        >

            <section
                className="garden-onboarding-dialog"

                role="dialog"

                aria-modal="true"

                aria-labelledby="garden-onboarding-title"

                aria-describedby="garden-onboarding-description"
            >

                {/* =========================
                    TOP BAR
                ========================= */}

                <div className="garden-onboarding-topbar">

                    <span className="garden-onboarding-step-count">

                        {
                            currentStep + 1
                        }

                        {" / "}

                        {
                            onboardingSteps.length
                        }

                    </span>


                    <button
                        type="button"

                        className="garden-onboarding-skip"

                        onClick={
                            closeOnboarding
                        }
                    >

                        Skip

                    </button>

                </div>


                {/* =========================
                    CONTENT
                ========================= */}

                <div className="garden-onboarding-content">

                    <div className="garden-onboarding-icon">

                        {
                            step.icon
                        }

                    </div>


                    <small className="garden-onboarding-eyebrow">

                        {
                            step.eyebrow
                        }

                    </small>


                    <h2
                        id="garden-onboarding-title"
                    >

                        {
                            step.title
                        }

                    </h2>


                    <p
                        id="garden-onboarding-description"
                    >

                        {
                            step.description
                        }

                    </p>

                </div>


                {/* =========================
                    PROGRESS
                ========================= */}

                <div
                    className="garden-onboarding-progress"

                    aria-hidden="true"
                >

                    {
                        onboardingSteps.map(
                            (
                                onboardingStep,
                                index
                            ) => (

                                <span
                                    key={
                                        onboardingStep.id
                                    }

                                    className={
                                        index ===
                                        currentStep
                                            ? "active"
                                            : index <
                                              currentStep
                                                ? "complete"
                                                : ""
                                    }
                                />

                            )
                        )
                    }

                </div>


                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="garden-onboarding-actions">

                    {
                        !isFirstStep && (

                            <button
                                type="button"

                                className="garden-onboarding-back"

                                onClick={
                                    goBack
                                }
                            >

                                ← Back

                            </button>

                        )
                    }


                    <button
                        type="button"

                        className="garden-onboarding-next"

                        onClick={
                            goNext
                        }
                    >

                        {
                            isLastStep
                                ? "Start My Garden 🌱"
                                : isFirstStep
                                    ? "Show Me How →"
                                    : "Continue →"
                        }

                    </button>

                </div>

            </section>

        </div>

    );

}


export default GardenOnboarding;