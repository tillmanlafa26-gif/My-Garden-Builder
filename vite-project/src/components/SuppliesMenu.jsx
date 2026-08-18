import {
    Link
} from "react-router";


import {
    supplies
} from "../data/supplies";


function SuppliesMenu({
    isOpen,
    onOpen,
    onClose,
    gardenProfile,
    ownedSupplies,
    onToggleSupply
}) {

    const filteredSupplies =
        gardenProfile
            ? supplies.filter(
                (supply) =>
                    supply.gardenTypes.includes(
                        gardenProfile.type
                    )
            )
            : [];


    const ownedCount =
        filteredSupplies.filter(
            (supply) =>
                ownedSupplies.includes(
                    supply.id
                )
        ).length;


    const progressPercent =
        filteredSupplies.length > 0
            ? Math.round(
                (
                    ownedCount /
                    filteredSupplies.length
                ) * 100
            )
            : 0;


    return (
        <>

            {/* =========================
                MENU BUTTON
            ========================= */}

            {!isOpen && (

                <button
                    type="button"
                    className="supplies-menu-button"
                    onClick={onOpen}
                    aria-label="Open supplies menu"
                >

                    ☰

                </button>

            )}


            {/* =========================
                OVERLAY
            ========================= */}

            {isOpen && (

                <div
                    className="supplies-overlay"
                    onClick={onClose}
                />

            )}


            {/* =========================
                SIDE MENU
            ========================= */}

            <aside
                className={
                    isOpen
                        ? "supplies-menu open"
                        : "supplies-menu"
                }
            >

                <div className="supplies-menu-header">

                    <div>

                        <h2>
                            🧰 My Supplies
                        </h2>

                        <p>
                            Garden setup checklist
                        </p>

                    </div>


                    <button
                        type="button"
                        className="supplies-close-button"
                        onClick={onClose}
                        aria-label="Close supplies menu"
                    >

                        ✕

                    </button>

                </div>


                {!gardenProfile ? (

                    <div className="supplies-empty">

                        <span>
                            🌱
                        </span>


                        <h3>
                            Build Your Garden First
                        </h3>


                        <p>
                            Create your garden profile
                            so we can recommend the
                            supplies you'll need.
                        </p>


                        <Link
                            to="/garden"
                            className="supplies-build-link"
                            onClick={onClose}
                        >

                            Build My Garden

                        </Link>

                    </div>

                ) : (

                    <>

                        {/* =========================
                            PROGRESS
                        ========================= */}

                        <section className="supplies-progress">

                            <div className="supplies-progress-text">

                                <strong>
                                    Setup Progress
                                </strong>


                                <span>

                                    {ownedCount}

                                    {" / "}

                                    {
                                        filteredSupplies.length
                                    }

                                </span>

                            </div>


                            <div className="supplies-progress-bar">

                                <div
                                    className="supplies-progress-fill"
                                    style={{
                                        width:
                                            `${progressPercent}%`
                                    }}
                                />

                            </div>


                            <small>

                                {progressPercent}%
                                complete

                            </small>

                        </section>


                        {/* =========================
                            SUPPLY LIST
                        ========================= */}

                        <section className="supplies-list">

                            {filteredSupplies.map(
                                (supply) => {

                                    const owned =
                                        ownedSupplies.includes(
                                            supply.id
                                        );


                                    return (

                                        <button
                                            type="button"

                                            key={
                                                supply.id
                                            }

                                            className={
                                                owned
                                                    ? "supply-card owned"
                                                    : "supply-card"
                                            }

                                            onClick={() =>
                                                onToggleSupply(
                                                    supply.id
                                                )
                                            }
                                        >

                                            <span className="supply-icon">

                                                {
                                                    supply.icon
                                                }

                                            </span>


                                            <div className="supply-info">

                                                <h3>

                                                    {
                                                        supply.name
                                                    }

                                                </h3>


                                                <p>

                                                    {
                                                        supply.description
                                                    }

                                                </p>

                                            </div>


                                            <span className="supply-check">

                                                {
                                                    owned
                                                        ? "✓"
                                                        : "○"
                                                }

                                            </span>

                                        </button>

                                    );

                                }
                            )}

                        </section>

                    </>

                )}

            </aside>

        </>
    );

}


export default SuppliesMenu;