import {
    useEffect,
    useState
} from "react";


function ThemeToggle() {

    const [
        darkMode,
        setDarkMode
    ] = useState(() => {

        const savedTheme =
            localStorage.getItem(
                "gardenTheme"
            );


        if (
            savedTheme === "dark"
        ) {

            return true;

        }


        if (
            savedTheme === "light"
        ) {

            return false;

        }


        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

    });


    /* =========================
       APPLY THEME
    ========================= */

    useEffect(() => {

        if (
            darkMode
        ) {

            document.documentElement
                .classList
                .add(
                    "dark-mode"
                );


            localStorage.setItem(
                "gardenTheme",
                "dark"
            );

        } else {

            document.documentElement
                .classList
                .remove(
                    "dark-mode"
                );


            localStorage.setItem(
                "gardenTheme",
                "light"
            );

        }

    }, [darkMode]);


    /* =========================
       TOGGLE
    ========================= */

    function toggleTheme() {

        setDarkMode(
            (currentMode) =>
                !currentMode
        );

    }


    return (

        <button
            type="button"

            className="theme-toggle"

            onClick={
                toggleTheme
            }

            aria-label={
                darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }

            title={
                darkMode
                    ? "Light Mode"
                    : "Dark Mode"
            }
        >

            {
                darkMode
                    ? "☀️"
                    : "🌙"
            }

        </button>

    );

}


export default ThemeToggle;