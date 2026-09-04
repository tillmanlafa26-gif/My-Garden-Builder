import {
    Link
} from "react-router";

import {
    gardenPlans,
    sunlightNames
} from "../data/gardenPlans";

import {
    hardinessTemperatureRanges
} from "../data/hardinessZones";

import Icon from "./Icon";


function GardenProfile({
    gardenProfile
}) {

    const selectedGarden =
        gardenProfile
            ? gardenPlans[
                gardenProfile.type
            ]
            : null;

    const designSpace =
        gardenProfile?.designSpace ||
        null;

    const hardinessZone =
        gardenProfile?.hardinessZone ||
        designSpace?.hardinessZone ||
        "";


    return (
        <section className="garden-profile-card">
            <div className="garden-profile-header">
                <div className="garden-profile-title">
                    <span className="garden-profile-title-icon">
                        <Icon
                            name="garden"
                            size={20}
                        />
                    </span>

                    <div>
                        <h2>
                            My Garden Design
                        </h2>

                        <p>
                            Your saved space and growing setup.
                        </p>
                    </div>
                </div>

                <Link
                    to={
                        gardenProfile
                            ? "/garden"
                            : "/"
                    }
                    className="garden-profile-link garden-profile-link-compact"
                >
                    {gardenProfile
                        ? "View Plan"
                        : "Start Builder"}
                </Link>
            </div>


            {!gardenProfile ? (
                <div className="garden-profile-empty">
                    <span className="garden-profile-empty-icon">
                        <Icon
                            name="sprout"
                            size={28}
                        />
                    </span>

                    <p>
                        Enter the dimensions of your space to start
                        designing your garden.
                    </p>
                </div>
            ) : (
                <div className="garden-profile-content">
                    <div className="garden-profile-main">
                        <span className="garden-profile-icon">
                            {selectedGarden?.icon || "🌱"}
                        </span>

                        <div>
                            <strong>
                                {selectedGarden?.name || "My Garden"}
                            </strong>

                            <p>
                                {sunlightNames[
                                    gardenProfile.sunlight
                                ] || "Sunlight not set"}
                            </p>
                        </div>
                    </div>


                    {designSpace && (
                        <div className="garden-space-summary">
                            <div>
                                <span>
                                    <Icon
                                        name="garden"
                                        size={18}
                                    />
                                </span>

                                <strong>
                                    Dimensions
                                </strong>

                                <small>
                                    {designSpace.width}
                                    {" × "}
                                    {designSpace.length}
                                    {" "}
                                    {designSpace.unit}
                                </small>
                            </div>

                            <div>
                                <span>
                                    <Icon
                                        name="leaf"
                                        size={18}
                                    />
                                </span>

                                <strong>
                                    Area
                                </strong>

                                <small>
                                    {Math.round(
                                        Number(
                                            designSpace.areaSquareFeet ||
                                            0
                                        )
                                    )}
                                    {" sq ft"}
                                </small>
                            </div>

                            <div>
                                <span>
                                    <Icon
                                        name="thermometer"
                                        size={18}
                                    />
                                </span>

                                <strong>
                                    Growing Zone
                                </strong>

                                <small>
                                    {hardinessZone
                                        ? `Zone ${hardinessZone}`
                                        : "Not set"}
                                </small>
                            </div>
                        </div>
                    )}


                    {hardinessZone && (
                        <div className="garden-zone-card">
                            <span>
                                <Icon
                                    name="thermometer"
                                    size={18}
                                />
                            </span>

                            <div>
                                <strong>
                                    USDA-style Zone {hardinessZone}
                                </strong>

                                <small>
                                    {hardinessTemperatureRanges[
                                        hardinessZone
                                    ] || "Temperature range unavailable"}
                                </small>
                            </div>
                        </div>
                    )}


                    {designSpace?.features?.length > 0 && (
                        <div className="garden-design-features">
                            {designSpace.features.map(
                                (feature) => (
                                    <span key={feature}>
                                        {feature.replaceAll(
                                            "-",
                                            " "
                                        )}
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}


export default GardenProfile;
