import {
    NavLink
} from "react-router";

import Icon from "./Icon";


const navItems = [
    {
        to: "/",
        end: true,
        label: "Home",
        icon: "home"
    },
    {
        to: "/garden",
        label: "Garden",
        icon: "garden"
    },
    {
        to: "/plants",
        label: "Plants",
        icon: "leaf"
    },
    {
        to: "/calendar",
        label: "Calendar",
        icon: "calendar"
    },
    {
        to: "/journal",
        label: "Journal",
        icon: "journal"
    }
];


function BottomNav() {

    return (
        <nav
            className="bottom-nav"
            aria-label="Primary navigation"
        >
            {navItems.map(
                (item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className="nav-link"
                    >
                        <span className="nav-link-icon">
                            <Icon
                                name={item.icon}
                                size={21}
                            />
                        </span>

                        <p>
                            {item.label}
                        </p>
                    </NavLink>
                )
            )}
        </nav>
    );
}


export default BottomNav;
