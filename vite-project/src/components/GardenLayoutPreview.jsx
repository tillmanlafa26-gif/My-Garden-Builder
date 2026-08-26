function GardenLayoutPreview({
    layout,
    bedPlantingPlan
}) {

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


        const markers =
            plantingBed
                ?.visualMarkers ||
            [];


        return (

            <>

                {
                    markers.length >
                    0
                        ? (

                            <>
                                {
                                    markers.map(
                                        (marker) => (

                                            <span
                                                key={
                                                    marker.id
                                                }

                                                title={
                                                    marker.name
                                                }

                                                style={{

                                                    position:
                                                        "absolute",

                                                    left:
                                                        `${marker.xPercent}%`,

                                                    top:
                                                        `${marker.yPercent}%`,

                                                    transform:
                                                        "translate(-50%, -50%)",

                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    justifyContent:
                                                        "center",

                                                    width:
                                                        "18px",

                                                    height:
                                                        "18px",

                                                    borderRadius:
                                                        "50%",

                                                    background:
                                                        "rgba(255,255,255,0.82)",

                                                    fontSize:
                                                        "11px",

                                                    lineHeight:
                                                        1,

                                                    boxShadow:
                                                        "0 1px 3px rgba(0,0,0,0.18)",

                                                    pointerEvents:
                                                        "none"

                                                }}
                                            >

                                                {
                                                    marker.icon
                                                }

                                            </span>

                                        )
                                    )
                                }


                                <small
                                    style={{

                                        position:
                                            "absolute",

                                        left:
                                            "50%",

                                        bottom:
                                            "2px",

                                        transform:
                                            "translateX(-50%)",

                                        maxWidth:
                                            "90%",

                                        padding:
                                            "1px 4px",

                                        borderRadius:
                                            "5px",

                                        background:
                                            "rgba(60,40,20,0.72)",

                                        color:
                                            "white",

                                        fontSize:
                                            "8px",

                                        whiteSpace:
                                            "nowrap",

                                        overflow:
                                            "hidden",

                                        textOverflow:
                                            "ellipsis"

                                    }}
                                >

                                    {
                                        plantingBed
                                            .crops
                                            .map(
                                                (crop) =>
                                                    `${crop.icon} ${crop.quantity}`
                                            )
                                            .join(
                                                " • "
                                            )
                                    }

                                </small>

                            </>

                        )
                        : (

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

                        )
                }

            </>

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
                        A scaled planning view of
                        your available garden space.
                    </p>

                </div>

            </div>


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