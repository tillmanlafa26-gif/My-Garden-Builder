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


function GardenOnboarding({
    cloudSync
}) {
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
                : "account"
    );

    const [
        currentStep,
        setCurrentStep
    ] = useState(0);

    const [
        accountMode,
        setAccountMode
    ] = useState("signup");

    const [
        displayName,
        setDisplayName
    ] = useState("");

    const [
        email,
        setEmail
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        accountBusy,
        setAccountBusy
    ] = useState(false);

    const [
        accountMessage,
        setAccountMessage
    ] = useState("");

    const [
        awaitingConfirmation,
        setAwaitingConfirmation
    ] = useState(false);


    // The account step only applies when cloud accounts are configured and
    // nobody is signed in yet. Once a session exists the tour takes over.
    const needsAccount =
        Boolean(
            cloudSync?.configured &&
            !cloudSync?.user
        );

    const activeView =
        view === "account" &&
        !needsAccount &&
        !awaitingConfirmation
            ? "tour"
            : view;

    const checkingSession =
        activeView === "account" &&
        cloudSync?.syncStatus ===
        "checking";


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
        setAwaitingConfirmation(false);
        setView("tour");
    }


    async function handleAccountSubmit(event) {
        event.preventDefault();

        setAccountBusy(true);
        setAccountMessage("");

        try {
            if (accountMode === "signup") {
                const result =
                    await cloudSync.signUp({
                        displayName,
                        email,
                        password
                    });

                // With email confirmation on, Supabase creates the account
                // without a session; let the user continue to the tour.
                if (!result?.session) {
                    setAwaitingConfirmation(true);
                }
            } else {
                await cloudSync.signIn({
                    email,
                    password
                });
            }

            setPassword("");
        } catch (error) {
            setAccountMessage(
                error?.message ||
                "Unable to complete that account request."
            );
        } finally {
            setAccountBusy(false);
        }
    }


    function toggleAccountMode() {
        setAccountMode(
            (current) =>
                current === "signup"
                    ? "signin"
                    : "signup"
        );

        setAccountMessage("");
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

            // Account creation is required on first launch, so Escape
            // only dismisses the tour.
            if (activeView === "account") {
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
            isOpen,
            activeView
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
            activeView,
            accountMode,
            awaitingConfirmation,
            checkingSession,
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
       FIRST-LAUNCH ACCOUNT STEP
    ===================================================== */

    if (checkingSession) {
        return null;
    }

    if (
        activeView === "account" &&
        awaitingConfirmation
    ) {
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
                    aria-labelledby="garden-confirm-title"
                    aria-describedby="garden-confirm-description"
                >
                    <div className="garden-onboarding-welcome-content">
                        <div
                            className="garden-onboarding-welcome-logo"
                            aria-hidden="true"
                        >
                            ✉️
                        </div>

                        <small className="garden-onboarding-eyebrow">
                            ACCOUNT CREATED
                        </small>

                        <h2 id="garden-confirm-title">
                            Check your email
                        </h2>

                        <p id="garden-confirm-description">
                            We sent a confirmation link to {email.trim()}. Confirm it, then sign in from ☰ → Settings to sync your garden. You can start exploring now.
                        </p>
                    </div>

                    <div className="garden-onboarding-welcome-actions">
                        <button
                            ref={firstActionRef}
                            type="button"
                            className="garden-onboarding-next"
                            onClick={beginFirstTour}
                        >
                            Continue to the Tour →
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    if (activeView === "account") {
        const isSignUp =
            accountMode === "signup";

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
                    aria-labelledby="garden-account-title"
                    aria-describedby="garden-account-description"
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

                        <h2 id="garden-account-title">
                            {
                                isSignUp
                                    ? "Create your account"
                                    : "Welcome back"
                            }
                        </h2>

                        <p id="garden-account-description">
                            {
                                isSignUp
                                    ? "Your account keeps your garden saved and available on every device."
                                    : "Sign in to load your saved garden."
                            }
                        </p>
                    </div>

                    <form
                        className="garden-onboarding-account-form"
                        onSubmit={handleAccountSubmit}
                    >
                        {
                            isSignUp && (
                                <label>
                                    <span>
                                        Display name
                                    </span>

                                    <input
                                        ref={firstActionRef}
                                        type="text"
                                        value={displayName}
                                        onChange={
                                            (event) =>
                                                setDisplayName(
                                                    event.target.value
                                                )
                                        }
                                        autoComplete="name"
                                        maxLength={60}
                                    />
                                </label>
                            )
                        }

                        <label>
                            <span>
                                Email
                            </span>

                            <input
                                ref={
                                    isSignUp
                                        ? undefined
                                        : firstActionRef
                                }
                                type="email"
                                value={email}
                                onChange={
                                    (event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label>
                            <span>
                                Password
                            </span>

                            <input
                                type="password"
                                value={password}
                                onChange={
                                    (event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                autoComplete={
                                    isSignUp
                                        ? "new-password"
                                        : "current-password"
                                }
                                minLength={6}
                                required
                            />
                        </label>

                        {
                            accountMessage && (
                                <p
                                    className="garden-onboarding-account-message"
                                    role="alert"
                                >
                                    {accountMessage}
                                </p>
                            )
                        }

                        <div className="garden-onboarding-welcome-actions">
                            <button
                                type="submit"
                                className="garden-onboarding-next"
                                disabled={accountBusy}
                            >
                                {
                                    accountBusy
                                        ? "Working…"
                                        : isSignUp
                                            ? "Create Account →"
                                            : "Sign In →"
                                }
                            </button>

                            <button
                                type="button"
                                className="garden-onboarding-not-now"
                                onClick={toggleAccountMode}
                                disabled={accountBusy}
                            >
                                {
                                    isSignUp
                                        ? "I already have an account"
                                        : "Create a new account"
                                }
                            </button>
                        </div>
                    </form>
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
