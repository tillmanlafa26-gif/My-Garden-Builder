import { createPortal } from "react-dom";

import {
    NavLink
} from "react-router";

import Icon from "./Icon";


const navItems = [
    { to: "/", end: true, label: "Home", icon: "home" },
    { to: "/garden", label: "My Garden", icon: "sprout" },
    { to: "/designer", label: "Build", icon: "plus" },
    { to: "/plants", label: "Plant Library", icon: "leaf" },
    { to: "/calendar", label: "Calendar", icon: "calendar" }
];


function BottomNav() {

    return createPortal(
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

        </nav>,
        document.body
    );

}


export default BottomNav;
