import {
    NavLink
} from "react-router";


function BottomNav() {

    return (

        <nav className="bottom-nav">

            <NavLink
                to="/"
                end
                className="nav-link"
            >

                <span>
                    🏠
                </span>

                <p>
                    Home
                </p>

            </NavLink>


            <NavLink
                to="/garden"
                className="nav-link"
            >

                <span>
                    🪴
                </span>

                <p>
                    Garden
                </p>

            </NavLink>


            <NavLink
                to="/plants"
                className="nav-link"
            >

                <span>
                    🌿
                </span>

                <p>
                    Plants
                </p>

            </NavLink>


            <NavLink
                to="/calendar"
                className="nav-link"
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
                className="nav-link"
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