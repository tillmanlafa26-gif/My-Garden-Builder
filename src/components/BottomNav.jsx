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
        label: "My Garden",
        icon: "garden"
    },
    {
        to: "/plants",
        label: "Plant Guide",
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
            className="bottom-nav leafy-bottom-nav"
            aria-label="Primary navigation"
        >

            {
                navItems.map(
                    (
                        item,
                        index
                    ) => (

                        <NavLink
                            key={
                                item.to
                            }
                            to={
                                item.to
                            }
                            end={
                                item.end
                            }
                            className={
                                index === 2
                                    ? "nav-link nav-link-leaf"
                                    : "nav-link"
                            }
                        >

                            <span className="nav-link-icon">

                                <Icon
                                    name={
                                        item.icon
                                    }
                                    size={
                                        index === 2
                                            ? 23
                                            : 21
                                    }
                                />

                            </span>


                            <p>
                                {
                                    item.label
                                }
                            </p>

                        </NavLink>

                    )
                )
            }

        </nav>
    );

}


export default BottomNav;
