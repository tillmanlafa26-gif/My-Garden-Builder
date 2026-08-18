import {
    NavLink
} from "react-router";


function BottomNav() {

    function navClass({
        isActive
    }) {

        return isActive
            ? "nav-link active"
            : "nav-link";

    }


    return (

        <nav
            className="bottom-nav"
            aria-label="Main navigation"
        >


            <NavLink
                to="/"
                end
                className={
                    navClass
                }
            >

                <span>
                    🏠
                </span>

                <p>
                    Home
                </p>

            </NavLink>


            <NavLink
                to="/plants"
                className={
                    navClass
                }
            >

                <span>
                    🌿
                </span>

                <p>
                    Plants
                </p>

            </NavLink>


            <NavLink
                to="/garden"
                className={
                    navClass
                }
            >

                <span>
                    🪴
                </span>

                <p>
                    Garden
                </p>

            </NavLink>


            <NavLink
                to="/calendar"
                className={
                    navClass
                }
            >

                <span>
                    📅
                </span>

                <p>
                    Calendar
                </p>

            </NavLink>


            <NavLink
                to="/journal"
                className={
                    navClass
                }
            >

                <span>
                    📓
                </span>

                <p>
                    Journal
                </p>

            </NavLink>


        </nav>

    );

}


export default BottomNav;