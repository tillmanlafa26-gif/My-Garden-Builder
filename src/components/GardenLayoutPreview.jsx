import {
    useState
} from "react";


function GardenLayoutPreview({
    layout,
    bedPlantingPlan
}) {

    const [
        zoomPercent,
        setZoomPercent
    ] = useState(100);


    const minimumZoom =
        75;


    const maximumZoom =
        200;


    const zoomStep =
        25;


    function clampZoom(
        nextZoom
    ) {
        return Math.min(
            maximumZoom,
            Math.max(
                minimumZoom,
                nextZoom
            )
        );
    }


    function zoomIn() {
        setZoomPercent(
            (current) =>
                clampZoom(
                    current +
                    zoomStep
                )
        );
    }


    function zoomOut() {
        setZoomPercent(
            (current) =>
                clampZoom(
                    current -
                    zoomStep
                )
        );
    }


    function resetZoom() {
        setZoomPercent(100);
    }


    if (
        !layout ||
        !Array.isArray(
            layout.items
        )
    ) {
        return null;
    }


    const regularItems =
        layout.items.filter(
            (item) =>
                item.type !==
                    "irrigation" &&
                item.type !==
                    "trellis"
        );


    const overlayItems =
        layout.items.filter(
            (item) =>
                item.type ===
                    "irrigation" ||
                item.type ===
                    "trellis"
        );


    /* =========================
       FIND PLANTING BED
    ========================= */

    function getPlantingBed(
        layoutItemId
    ) {

        if (
            !bedPlantingPlan ||
            !Array.isArray(
                bedPlantingPlan.beds
            )
        ) {
            return null;
        }


        return (
            bedPlantingPlan
                .beds
                .find(
                    (bed) =>
                        bed.id ===
                        layoutItemId
                ) ||
            null
        );

    }


    /* =========================
       ITEM POSITION
    ========================= */

    function getItemStyle(
        item
    ) {

        return {

            left:
                `${
                    (
                        item.x /
                        layout.spaceWidth
                    ) *
                    100
                }%`,

            top:
                `${
                    (
                        item.y /
                        layout.spaceLength
                    ) *
                    100
                }%`,

            width:
                `${
                    (
                        item.width /
                        layout.spaceWidth
                    ) *
                    100
                }%`,

            height:
                `${
                    (
                        item.length /
                        layout.spaceLength
                    ) *
                    100
                }%`

        };

    }


    /* =========================
       RAISED BED CONTENT
    ========================= */

    function renderRaisedBed(
        item
    ) {
        const plantingBed =
            getPlantingBed(
                item.id
            );


        const zones =
            plantingBed
                ?.spatialLayout
                ?.zones ||
            [];


        if (
            zones.length ===
            0
        ) {
            return (
                <>
                    <span>
                        {
                            item.icon
                        }
                    </span>

                    <strong>
                        {
                            item.name
                        }
                    </strong>

                    <small>
                        {
                            item.width
                        }

                        {" × "}

                        {
                            item.length
                        }

                        {" ft"}
                    </small>
                </>
            );
        }


        return (
            <div className="layout-bed-spatial-plan">

                {
                    plantingBed
                        ?.hasTrellis && (

                        <div className="layout-bed-trellis-edge">
                            Trellis edge
                        </div>

                    )
                }


                {
                    zones.map(
                        (zone) => (

                            <div
                                key={
                                    zone.id
                                }
                                className={
                                    `layout-crop-zone crop-zone-${zone.zoneIndex % 4}`
                                }
                                style={{
                                    left:
                                        `${zone.xPercent}%`,

                                    top:
                                        `${zone.yPercent}%`,

                                    width:
                                        `${zone.widthPercent}%`,

                                    height:
                                        `${zone.lengthPercent}%`
                                }}
                                title={
                                    `${zone.name}: ${zone.quantity} plant${zone.quantity === 1 ? "" : "s"}, about ${zone.spacingInches} in spacing`
                                }
                            >

                                <span className="layout-crop-zone-name">
                                    {
                                        zone.icon
                                    }

                                    {" "}

                                    {
                                        zone.name
                                    }
                                </span>


                                <small>
                                    {
                                        zone.quantity
                                    }

                                    {" × "}

                                    {
                                        zone.spacingInches
                                    }

                                    {" in"}
                                </small>


                                {
                                    zone.markers.map(
                                        (marker) => (

                                            <i
                                                key={
                                                    `${zone.id}-${marker.id}`
                                                }
                                                className="layout-crop-marker"
                                                style={{
                                                    left:
                                                        `${marker.xPercent}%`,

                                                    top:
                                                        `${marker.yPercent}%`
                                                }}
                                                aria-hidden="true"
                                            />

                                        )
                                    )
                                }

                            </div>

                        )
                    )
                }


                {
                    plantingBed
                        ?.spatialLayout
                        ?.internalOpenArea >
                    0.1 && (

                    <span className="layout-bed-open-space-label">
                        Open spacing
                    </span>

                )
                }

            </div>
        );
    }


    /* =========================
       NORMAL ITEM CONTENT
    ========================= */

    function renderItemContent(
        item
    ) {

        if (
            item.type ===
            "raised-bed"
        ) {

            return renderRaisedBed(
                item
            );

        }


        return (

            <>

                <span>
                    {
                        item.icon
                    }
                </span>

                <strong>
                    {
                        item.name
                    }
                </strong>

                {
                    item.type !==
                        "irrigation" &&
                    item.type !==
                        "trellis" && (

                        <small>

                            {
                                item.width
                            }

                            {" × "}

                            {
                                item.length
                            }

                            {" ft"}

                        </small>

                    )
                }

            </>

        );

    }


    return (

        <section className="layout-preview-section">


            <div className="designer-section-heading">

                <span>
                    🗺️
                </span>


                <div>

                    <h2>
                        Generated Garden Layout
                    </h2>


                    <p>
                        A scaled planning view of your garden space. Raised beds now show the physical area reserved for each crop pairing instead of decorative plant markers.
                    </p>

                </div>

            </div>


            <div className="garden-layout-zoom-controls">

                <button
                    type="button"
                    className="garden-layout-zoom-button"
                    aria-label="Zoom garden layout out"
                    onClick={zoomOut}
                    disabled={
                        zoomPercent <=
                        minimumZoom
                    }
                >
                    −
                </button>


                <div className="garden-layout-zoom-status">

                    <strong>
                        {
                            zoomPercent
                        }

                        {"%"}
                    </strong>


                    <span>
                        Zoom
                    </span>

                </div>


                <input
                    className="garden-layout-zoom-slider"
                    type="range"
                    min={minimumZoom}
                    max={maximumZoom}
                    step={zoomStep}
                    value={zoomPercent}
                    aria-label="Garden layout zoom level"
                    onChange={
                        (event) =>
                            setZoomPercent(
                                clampZoom(
                                    Number(
                                        event.target.value
                                    )
                                )
                            )
                    }
                />


                <button
                    type="button"
                    className="garden-layout-zoom-button"
                    aria-label="Zoom garden layout in"
                    onClick={zoomIn}
                    disabled={
                        zoomPercent >=
                        maximumZoom
                    }
                >
                    +
                </button>


                <button
                    type="button"
                    className="garden-layout-zoom-reset"
                    onClick={resetZoom}
                    disabled={
                        zoomPercent ===
                        100
                    }
                >
                    Fit
                </button>

            </div>


            <p className="garden-layout-zoom-help">
                Zoom in to inspect crop pairing zones and spacing. When enlarged, drag or scroll inside the diagram to move around.
            </p>


            <div className="garden-layout-viewport">

                <div
                    className="garden-layout-zoom-stage"
                    style={{
                        width:
                            `${zoomPercent}%`
                    }}
                >

                    <div className="garden-layout-wrapper">


                <div className="layout-width-label">

                    {
                        layout.spaceWidth
                    }

                    {" ft"}

                </div>


                <div
                    className="garden-layout-canvas"

                    style={{
                        aspectRatio:
                            `${layout.spaceWidth} / ${layout.spaceLength}`
                    }}
                >

                    <div className="layout-grid" />


                    {/* =========================
                        MAIN STRUCTURES
                    ========================= */}

                    {
                        regularItems.map(
                            (item) => (

                                <div
                                    key={
                                        item.id
                                    }

                                    className={
                                        `layout-item layout-${item.type}`
                                    }

                                    style={{
                                        ...getItemStyle(
                                            item
                                        ),

                                        position:
                                            "absolute",

                                        overflow:
                                            "hidden"
                                    }}
                                >

                                    {
                                        renderItemContent(
                                            item
                                        )
                                    }

                                </div>

                            )
                        )
                    }


                    {/* =========================
                        OVERLAYS
                    ========================= */}

                    {
                        overlayItems.map(
                            (item) => (

                                <div
                                    key={
                                        item.id
                                    }

                                    className={
                                        `layout-item layout-${item.type}`
                                    }

                                    style={
                                        getItemStyle(
                                            item
                                        )
                                    }
                                >

                                    {
                                        renderItemContent(
                                            item
                                        )
                                    }

                                </div>

                            )
                        )
                    }

                </div>


                <div className="layout-length-label">

                    {
                        layout.spaceLength
                    }

                    {" ft"}

                </div>


                    </div>

                </div>

            </div>


            {/* =========================
                STATS
            ========================= */}

            <div className="layout-stat-grid">


                <div>

                    <strong>
                        Raised Beds
                    </strong>

                    <span>

                        {
                            layout
                                .stats
                                .raisedBedCount
                        }

                    </span>

                </div>


                <div>

                    <strong>
                        Growing Area
                    </strong>

                    <span>

                        {
                            layout
                                .stats
                                .growingArea
                        }

                        {" sq ft"}

                    </span>

                </div>


                <div>

                    <strong>
                        Growing Use
                    </strong>

                    <span>

                        {
                            layout
                                .stats
                                .growingPercent
                        }

                        %

                    </span>

                </div>


                <div>

                    <strong>
                        Walkway
                    </strong>

                    <span>

                        {
                            layout
                                .stats
                                .walkwayWidth
                        }

                        {" ft"}

                    </span>

                </div>


            </div>


            {/* =========================
                CROP MAP NOTE
            ========================= */}

            {
                bedPlantingPlan && (

                    <div className="material-assumptions">

                        <strong>
                            🌱 Visual Planting Map
                        </strong>

                        <p>
                            Crop icons inside the
                            raised beds represent
                            the bed-by-bed planting
                            plan. Dense crops use
                            representative markers,
                            so the exact planned
                            quantities are shown in
                            the planting details
                            below.
                        </p>

                    </div>

                )
            }


            {/* =========================
                WARNINGS
            ========================= */}

            {
                Array.isArray(
                    layout.warnings
                ) &&
                layout.warnings.length >
                0 && (

                    <div className="layout-warnings">

                        <strong>
                            Layout Notes
                        </strong>

                        {
                            layout.warnings.map(
                                (
                                    warning,
                                    index
                                ) => (

                                    <p
                                        key={
                                            index
                                        }
                                    >

                                        •{" "}

                                        {
                                            warning
                                        }

                                    </p>

                                )
                            )
                        }

                    </div>

                )
            }


        </section>

    );

}


export default GardenLayoutPreview;