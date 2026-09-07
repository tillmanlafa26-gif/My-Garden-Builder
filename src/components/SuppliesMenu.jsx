import {
    Link
} from "react-router";

import {
    supplies
} from "../data/supplies";

import Icon from "./Icon";


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
            {!isOpen && (
                <button
                    type="button"
                    className="supplies-menu-button"
                    onClick={onOpen}
                    aria-label="Open supplies menu"
                    title="Supplies"
                >
                    <Icon
                        name="toolbox"
                        size={20}
                    />
                </button>
            )}


            {isOpen && (
                <div
                    className="supplies-overlay"
                    onClick={onClose}
                />
            )}


            <aside
                className={
                    isOpen
                        ? "supplies-menu open"
                        : "supplies-menu"
                }
                aria-hidden={!isOpen}
            >
                <div className="supplies-menu-header">
                    <div className="supplies-menu-title">
                        <span className="supplies-menu-title-icon">
                            <Icon
                                name="toolbox"
                                size={20}
                            />
                        </span>

                        <div>
                            <h2>
                                My Supplies
                            </h2>

                            <p>
                                Garden setup checklist
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="supplies-close-button"
                        onClick={onClose}
                        aria-label="Close supplies menu"
                    >
                        <Icon
                            name="close"
                            size={18}
                        />
                    </button>
                </div>


                {!gardenProfile ? (
                    <div className="supplies-empty">
                        <span className="supplies-empty-icon">
                            <Icon
                                name="sprout"
                                size={30}
                            />
                        </span>

                        <h3>
                            Build Your Garden First
                        </h3>

                        <p>
                            Create your garden profile so we can recommend
                            the supplies you'll need.
                        </p>

                        <Link
                            to="/"
                            className="supplies-build-link"
                            onClick={onClose}
                        >
                            Start Garden Builder
                        </Link>
                    </div>
                ) : (
                    <>
                        <section className="supplies-progress">
                            <div className="supplies-progress-text">
                                <strong>
                                    Setup Progress
                                </strong>

                                <span>
                                    {ownedCount}
                                    {" / "}
                                    {filteredSupplies.length}
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
                                {progressPercent}% complete
                            </small>
                        </section>


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
                                            key={supply.id}
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
                                            aria-pressed={owned}
                                        >
                                            <span className="supply-icon">
                                                {supply.icon}
                                            </span>

                                            <div className="supply-info">
                                                <h3>
                                                    {supply.name}
                                                </h3>

                                                <p>
                                                    {supply.description}
                                                </p>
                                            </div>

                                            <span className="supply-check">
                                                <Icon
                                                    name={
                                                        owned
                                                            ? "check"
                                                            : "circle"
                                                    }
                                                    size={18}
                                                />
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
