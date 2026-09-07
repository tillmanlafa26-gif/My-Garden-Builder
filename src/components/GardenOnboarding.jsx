import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    readText,
    writeText
} from "../utils/safeStorage";


const onboardingSteps = [
    {
        id: "welcome",
        icon: "🌱",
        eyebrow: "WELCOME",
        title: "Build a Garden That Fits Your Real Space",
        description:
            "My Garden Builder takes you from an empty space to a practical garden layout, crop plan, materials checklist, seasonal schedule, and ongoing garden management."
    },
    {
        id: "space",
        icon: "📐",
        eyebrow: "STEP 1",
        title: "Define Your Space",
        description:
            "Choose where your garden will go, enter the usable dimensions, and select the surface underneath it. These measurements become the foundation for the design."
    },
    {
        id: "conditions",
        icon: "☀️",
        eyebrow: "STEP 2",
        title: "Add Your Growing Conditions",
        description:
            "Choose the garden system and sunlight level. You can also enable location to estimate your USDA-style growing zone and frost dates for local planting guidance."
    },
    {
        id: "features",
        icon: "🧰",
        eyebrow: "STEP 3",
        title: "Choose Garden Features",
        description:
            "Select the features you actually want to build, including raised beds, containers, trellises, vertical growing, composting, irrigation, or hydroponics."
    },
    {
        id: "crops",
        icon: "🥕",
        eyebrow: "STEP 4",
        title: "Choose What You Want to Grow",
        description:
            "Select crops from the garden library. Your crop choices are used when calculating planting space, seasonal timing, and the generated garden plan."
    },
    {
        id: "design",
        icon: "🗺️",
        eyebrow: "STEP 5",
        title: "Generate Your Garden Design",
        description:
            "Choose a design priority such as balanced, maximum growing, easy access, or simple build. The app then generates a layout sized to your actual space."
    },
    {
        id: "build",
        icon: "🔨",
        eyebrow: "STEP 6",
        title: "Review the Build Plan",
        description:
            "Review the layout, planting plan, recommended materials and quantities, seasonal guide, and build instructions. Finishing this step completes the initial setup."
    },
    {
        id: "garden",
        icon: "🏡",
        eyebrow: "MY GARDEN",
        title: "Activate the Garden and Prepare Your Supplies",
        description:
            "After setup, open My Garden to review the finished plan. Your My Supplies checklist appears there so you can track what you have before building. Activate the garden when the plan is ready to use."
    },
    {
        id: "manage",
        icon: "🪴",
        eyebrow: "KEEP GROWING",
        title: "Track the Garden Over Time",
        description:
            "Use Plants for growth stages and harvests, Calendar for planting and watering events, Journal for garden history, and Weather for current growing conditions."
    }
];


function GardenOnboarding() {
    const dialogRef =
        useRef(null);

    const firstActionRef =
        useRef(null);

    const [
        isOpen,
        setIsOpen
    ] = useState(
        () =>
            readText(
                "gardenOnboardingSeen",
                null
            ) !== "true"
    );

    const [
        view,
        setView
    ] = useState(
        () =>
            readText(
                "gardenOnboardingSeen",
                null
            ) === "true"
                ? "tour"
                : "prompt"
    );

    const [
        currentStep,
        setCurrentStep
    ] = useState(0);


    const step =
        onboardingSteps[currentStep];

    const isFirstStep =
        currentStep === 0;

    const isLastStep =
        currentStep ===
        onboardingSteps.length - 1;


    function rememberOnboarding() {
        writeText(
            "gardenOnboardingSeen",
            "true"
        );
    }


    function openTour() {
        setCurrentStep(0);
        setView("tour");
        setIsOpen(true);
    }


    function beginFirstTour() {
        setCurrentStep(0);
        setView("tour");
    }


    function closeOnboarding() {
        rememberOnboarding();
        setIsOpen(false);
    }


    function goNext() {
        if (isLastStep) {
            closeOnboarding();
            return;
        }

        setCurrentStep(
            (current) =>
                current + 1
        );
    }


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
       OPEN HOW TO USE FROM THE HAMBURGER / SETTINGS
    ===================================================== */

    useEffect(
        () => {
            function handleOpenOnboarding() {
                openTour();
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
       ESCAPE
    ===================================================== */

    useEffect(
        () => {
            if (!isOpen) {
                return undefined;
            }

            function handleKeyDown(event) {
                if (event.key === "Escape") {
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
       FOCUS MANAGEMENT
    ===================================================== */

    useEffect(
        () => {
            if (!isOpen) {
                return undefined;
            }

            const focusTimer =
                window.setTimeout(
                    () =>
                        firstActionRef.current
                            ?.focus(),
                    0
                );

            function trapFocus(event) {
                if (
                    event.key !== "Tab" ||
                    !dialogRef.current
                ) {
                    return;
                }

                const focusable =
                    dialogRef.current.querySelectorAll(
                        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );

                if (!focusable.length) {
                    return;
                }

                const first =
                    focusable[0];

                const last =
                    focusable[
                        focusable.length - 1
                    ];

                if (
                    event.shiftKey &&
                    document.activeElement === first
                ) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }

            window.addEventListener(
                "keydown",
                trapFocus
            );

            return () => {
                window.clearTimeout(
                    focusTimer
                );

                window.removeEventListener(
                    "keydown",
                    trapFocus
                );
            };
        },
        [
            isOpen,
            view,
            currentStep
        ]
    );


    /* =====================================================
       PREVENT BACKGROUND SCROLL
    ===================================================== */

    useEffect(
        () => {
            if (!isOpen) {
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


    if (!isOpen) {
        return null;
    }


    /* =====================================================
       FIRST-LAUNCH PROMPT
    ===================================================== */

    if (view === "prompt") {
        return (
            <div
                className="garden-onboarding-overlay"
                role="presentation"
            >
                <section
                    ref={dialogRef}
                    className="garden-onboarding-dialog garden-onboarding-welcome"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="garden-welcome-title"
                    aria-describedby="garden-welcome-description"
                >
                    <div className="garden-onboarding-welcome-content">
                        <div
                            className="garden-onboarding-welcome-logo"
                            aria-hidden="true"
                        >
                            🌱
                        </div>

                        <small className="garden-onboarding-eyebrow">
                            WELCOME TO MY GARDEN BUILDER
                        </small>

                        <h2 id="garden-welcome-title">
                            Ready to build your garden?
                        </h2>

                        <p id="garden-welcome-description">
                            Before you start, would you like a quick walkthrough of how the app works?
                        </p>

                        <div className="garden-onboarding-welcome-points">
                            <div>
                                <span aria-hidden="true">
                                    📐
                                </span>

                                <span>
                                    <strong>
                                        Design
                                    </strong>

                                    <small>
                                        Build around your real available space.
                                    </small>
                                </span>
                            </div>

                            <div>
                                <span aria-hidden="true">
                                    🔨
                                </span>

                                <span>
                                    <strong>
                                        Build
                                    </strong>

                                    <small>
                                        Get layouts, materials, and instructions.
                                    </small>
                                </span>
                            </div>

                            <div>
                                <span aria-hidden="true">
                                    🪴
                                </span>

                                <span>
                                    <strong>
                                        Grow
                                    </strong>

                                    <small>
                                        Track planting, watering, growth, and harvests.
                                    </small>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="garden-onboarding-welcome-actions">
                        <button
                            ref={firstActionRef}
                            type="button"
                            className="garden-onboarding-next"
                            onClick={beginFirstTour}
                        >
                            Take the Quick Tour →
                        </button>

                        <button
                            type="button"
                            className="garden-onboarding-not-now"
                            onClick={closeOnboarding}
                        >
                            Skip for Now
                        </button>
                    </div>

                    <p className="garden-onboarding-welcome-note">
                        You can reopen this guide anytime from ☰ → How to Use.
                    </p>
                </section>
            </div>
        );
    }


    /* =====================================================
       HOW TO USE TOUR
    ===================================================== */

    return (
        <div
            className="garden-onboarding-overlay"
            role="presentation"
        >
            <section
                ref={dialogRef}
                className="garden-onboarding-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="garden-onboarding-title"
                aria-describedby="garden-onboarding-description"
            >
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
                        ref={firstActionRef}
                        type="button"
                        className="garden-onboarding-skip"
                        onClick={closeOnboarding}
                    >
                        Skip
                    </button>
                </div>

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

                    <h2 id="garden-onboarding-title">
                        {
                            step.title
                        }
                    </h2>

                    <p id="garden-onboarding-description">
                        {
                            step.description
                        }
                    </p>
                </div>

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
                                        index === currentStep
                                            ? "active"
                                            : index < currentStep
                                                ? "complete"
                                                : ""
                                    }
                                />
                            )
                        )
                    }
                </div>

                <div className="garden-onboarding-actions">
                    {
                        !isFirstStep && (
                            <button
                                type="button"
                                className="garden-onboarding-back"
                                onClick={goBack}
                            >
                                ← Back
                            </button>
                        )
                    }

                    <button
                        type="button"
                        className="garden-onboarding-next"
                        onClick={goNext}
                    >
                        {
                            isLastStep
                                ? "Start Building 🌱"
                                : "Continue →"
                        }
                    </button>
                </div>
            </section>
        </div>
    );
}


export default GardenOnboarding;
