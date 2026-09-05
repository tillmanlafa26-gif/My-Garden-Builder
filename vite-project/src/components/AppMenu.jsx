import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import Icon from "./Icon";


function AppMenu({
    onOpenSupplies
}) {
    const navigate =
        useNavigate();

    const menuRootRef =
        useRef(null);

    const triggerRef =
        useRef(null);

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    useEffect(
        () => {
            function focusMenuTrigger() {
                triggerRef.current
                    ?.focus();
            }

            window.addEventListener(
                "garden-focus-app-menu",
                focusMenuTrigger
            );

            return () => {
                window.removeEventListener(
                    "garden-focus-app-menu",
                    focusMenuTrigger
                );
            };
        },
        []
    );


    useEffect(
        () => {
            if (!isOpen) {
                return undefined;
            }

            function handlePointerDown(event) {
                if (
                    menuRootRef.current &&
                    !menuRootRef.current.contains(
                        event.target
                    )
                ) {
                    setIsOpen(false);
                }
            }

            function handleKeyDown(event) {
                if (event.key === "Escape") {
                    setIsOpen(false);
                }
            }

            document.addEventListener(
                "pointerdown",
                handlePointerDown
            );

            window.addEventListener(
                "keydown",
                handleKeyDown
            );

            return () => {
                document.removeEventListener(
                    "pointerdown",
                    handlePointerDown
                );

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


    function openSettings() {
        setIsOpen(false);

        window.setTimeout(
            () => {
                window.dispatchEvent(
                    new CustomEvent(
                        "garden-open-settings"
                    )
                );
            },
            0
        );
    }


    function openSupplies() {
        setIsOpen(false);

        if (
            typeof onOpenSupplies ===
            "function"
        ) {
            onOpenSupplies();
        }
    }


    function openHowToUse() {
        setIsOpen(false);
        navigate("/");

        window.setTimeout(
            () => {
                window.dispatchEvent(
                    new CustomEvent(
                        "garden-open-onboarding"
                    )
                );
            },
            250
        );
    }


    function goToPrivacy() {
        setIsOpen(false);
        navigate("/privacy");
    }


    function goToTerms() {
        setIsOpen(false);
        navigate("/terms");
    }


    return (
        <div
            ref={menuRootRef}
            className="app-menu"
        >
            <button
                ref={triggerRef}
                type="button"
                className="app-menu-trigger"
                aria-label={
                    isOpen
                        ? "Close app menu"
                        : "Open app menu"
                }
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() =>
                    setIsOpen(
                        (current) =>
                            !current
                    )
                }
            >
                <Icon
                    name={
                        isOpen
                            ? "close"
                            : "menu"
                    }
                    size={21}
                />
            </button>

            {isOpen && (
                <div
                    className="app-menu-popover"
                    role="menu"
                    aria-label="App menu"
                >
                    <div className="app-menu-heading">
                        <strong>
                            Menu
                        </strong>

                        <small>
                            Quick access
                        </small>
                    </div>

                    <button
                        type="button"
                        className="app-menu-item"
                        role="menuitem"
                        onClick={openSettings}
                    >
                        <span className="app-menu-item-icon">
                            <Icon
                                name="settings"
                                size={18}
                            />
                        </span>

                        <span>
                            <strong>
                                Settings
                            </strong>

                            <small>
                                Appearance, install, and app controls.
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="app-menu-item"
                        role="menuitem"
                        onClick={openSupplies}
                    >
                        <span className="app-menu-item-icon">
                            <Icon
                                name="toolbox"
                                size={18}
                            />
                        </span>

                        <span>
                            <strong>
                                My Supplies
                            </strong>

                            <small>
                                View your garden checklist.
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="app-menu-item"
                        role="menuitem"
                        onClick={openHowToUse}
                    >
                        <span className="app-menu-item-icon">
                            <Icon
                                name="sprout"
                                size={18}
                            />
                        </span>

                        <span>
                            <strong>
                                How to Use
                            </strong>

                            <small>
                                Reopen the getting-started guide.
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="app-menu-item"
                        role="menuitem"
                        onClick={goToPrivacy}
                    >
                        <span className="app-menu-item-icon">
                            <Icon
                                name="shield"
                                size={18}
                            />
                        </span>

                        <span>
                            <strong>
                                Privacy
                            </strong>

                            <small>
                                Review app data and permissions.
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="app-menu-item"
                        role="menuitem"
                        onClick={goToTerms}
                    >
                        <span className="app-menu-item-icon">
                            <Icon
                                name="document"
                                size={18}
                            />
                        </span>

                        <span>
                            <strong>
                                Terms
                            </strong>

                            <small>
                                View the app terms and disclaimer.
                            </small>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}


export default AppMenu;
