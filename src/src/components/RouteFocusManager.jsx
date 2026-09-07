import {
    useEffect
} from "react";

import {
    useLocation
} from "react-router";

const pageTitles = {
    "/": "My Garden Builder",
    "/garden": "My Garden",
    "/plants": "Plants",
    "/calendar": "Garden Calendar",
    "/journal": "Garden Journal",
    "/privacy": "Privacy",
    "/terms": "Terms"
};

function RouteFocusManager() {
    const location = useLocation();

    useEffect(() => {
        const title =
            pageTitles[location.pathname] ||
            "My Garden Builder";

        document.title =
            title === "My Garden Builder"
                ? title
                : `${title} | My Garden Builder`;

        const activeModal =
            document.querySelector(
                '[aria-modal="true"]'
            );

        const main =
            document.getElementById(
                "main-content"
            );

        if (
            main &&
            !activeModal
        ) {
            main.focus({
                preventScroll: true
            });
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });
    }, [location.pathname]);

    return null;
}

export default RouteFocusManager;
