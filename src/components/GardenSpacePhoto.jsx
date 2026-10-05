import {
    useEffect,
    useRef,
    useState
} from "react";


import {
    processGardenSpaceImage
} from "../utils/gardenSpaceImage";


import {
    analyzeGardenSpacePhoto
} from "../utils/gardenVisionApi";


import {
    boxToAreaPoints,
    buildPhotoCalibration,
    getOrderedAreaPoints,
    makePhotoPoint,
    photoPointsToSvg
} from "../utils/gardenPhotoGeometry";


const obstacleTypes = [
    {
        id: "tree",
        label: "Tree / Plant",
        icon: "🌳"
    },
    {
        id: "furniture",
        label: "Furniture",
        icon: "🪑"
    },
    {
        id: "door",
        label: "Door / Access",
        icon: "🚪"
    },
    {
        id: "utility",
        label: "Utility",
        icon: "⚡"
    },
    {
        id: "structure",
        label: "Structure",
        icon: "🏗️"
    },
    {
        id: "other",
        label: "Other",
        icon: "📍"
    }
];


function obstacleIcon(
    type
) {
    return (
        obstacleTypes.find(
            (item) =>
                item.id === type
        )?.icon ||
        "📍"
    );
}


function formatPhotoSize(
    bytes
) {
    const numeric =
        Number(
            bytes
        );


    if (
        !Number.isFinite(
            numeric
        ) ||
        numeric <= 0
    ) {
        return "";
    }


    if (
        numeric <
        1024 * 1024
    ) {
        return `${Math.max(
            1,
            Math.round(
                numeric / 1024
            )
        )} KB`;
    }


    return `${(
        numeric /
        (
            1024 *
            1024
        )
    ).toFixed(
        1
    )} MB`;
}


function GardenSpacePhoto({
    photo,
    onChange,
    spaceType,
    knownDimensions,
    unit = "ft"
}) {
    const cameraInputRef =
        useRef(
            null
        );


    const uploadInputRef =
        useRef(
            null
        );


    const [
        previewPhoto,
        setPreviewPhoto
    ] = useState(
        photo ||
        null
    );


    const [
        accepted,
        setAccepted
    ] = useState(
        Boolean(
            photo
        )
    );


    const [
        processing,
        setProcessing
    ] = useState(
        false
    );


    const [
        analyzing,
        setAnalyzing
    ] = useState(
        false
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    const [
        toolMode,
        setToolMode
    ] = useState(
        null
    );


    const [
        calibrationDraft,
        setCalibrationDraft
    ] = useState(
        []
    );


    const [
        calibrationDistance,
        setCalibrationDistance
    ] = useState(
        ""
    );


    const [
        calibrationUnit,
        setCalibrationUnit
    ] = useState(
        unit === "m"
            ? "m"
            : "ft"
    );


    const [
        obstacleType,
        setObstacleType
    ] = useState(
        "other"
    );


    const markup =
        previewPhoto?.markup ||
        {
            areaPoints: [],
            calibration: null,
            obstacles: []
        };


    const areaPoints =
        Array.isArray(
            markup.areaPoints
        )
            ? markup.areaPoints
            : [];


    const manualObstacles =
        Array.isArray(
            markup.obstacles
        )
            ? markup.obstacles
            : [];


    const analysis =
        previewPhoto?.analysis ||
        null;


    useEffect(
        () => {
            function handleOpenCamera() {
                cameraInputRef.current
                    ?.click();
            }


            window.addEventListener(
                "garden-open-camera",
                handleOpenCamera
            );


            return () => {
                window.removeEventListener(
                    "garden-open-camera",
                    handleOpenCamera
                );
            };
        },
        []
    );


    function savePreview(
        nextPhoto
    ) {
        setPreviewPhoto(
            nextPhoto
        );


        if (
            accepted
        ) {
            onChange?.(
                nextPhoto
            );
        }
    }


    async function handlePhotoFile(
        file,
        source
    ) {
        if (
            !file
        ) {
            return;
        }


        setProcessing(
            true
        );


        setMessage(
            ""
        );


        try {
            const nextPhoto =
                await processGardenSpaceImage(
                    file,
                    source
                );


            setPreviewPhoto({
                ...nextPhoto,

                markup: {
                    areaPoints: [],
                    calibration: null,
                    obstacles: []
                },

                analysis: null,
                analysisModel: null
            });


            setAccepted(
                false
            );


            setToolMode(
                null
            );


            setCalibrationDraft(
                []
            );
        } catch (
            error
        ) {
            setMessage(
                error?.message ||
                "The photo could not be prepared."
            );
        } finally {
            setProcessing(
                false
            );
        }
    }


    function usePhoto() {
        if (
            !previewPhoto
        ) {
            return;
        }


        onChange?.(
            previewPhoto
        );


        setAccepted(
            true
        );


        setMessage(
            "✓ Photo saved. You can now map the usable area, calibrate one known measurement, or run AI visual analysis."
        );
    }


    function removePhoto() {
        setPreviewPhoto(
            null
        );


        setAccepted(
            false
        );


        setToolMode(
            null
        );


        setCalibrationDraft(
            []
        );


        setMessage(
            ""
        );


        onChange?.(
            null
        );
    }


    function getPhotoPoint(
        event
    ) {
        const rect =
            event.currentTarget
                .getBoundingClientRect();


        return makePhotoPoint(
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) *
            100,

            (
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) *
            100
        );
    }


    function handlePhotoTap(
        event
    ) {
        if (
            !accepted ||
            !toolMode
        ) {
            return;
        }


        const point =
            getPhotoPoint(
                event
            );


        if (
            toolMode === "area"
        ) {
            const base =
                areaPoints.length >= 4
                    ? []
                    : areaPoints;


            const next =
                [
                    ...base,
                    point
                ].slice(
                    0,
                    4
                );


            savePreview({
                ...previewPhoto,

                markup: {
                    ...markup,
                    areaPoints:
                        next
                }
            });


            if (
                next.length === 4
            ) {
                setToolMode(
                    null
                );


                setMessage(
                    "✓ Usable area marked."
                );
            }


            return;
        }


        if (
            toolMode ===
            "calibration"
        ) {
            const next =
                calibrationDraft.length >= 2
                    ? [point]
                    : [
                        ...calibrationDraft,
                        point
                    ];


            setCalibrationDraft(
                next
            );


            if (
                next.length === 2
            ) {
                setToolMode(
                    null
                );


                setMessage(
                    "Enter the known real-world distance between the two points."
                );
            }


            return;
        }


        if (
            toolMode ===
            "obstacle"
        ) {
            savePreview({
                ...previewPhoto,

                markup: {
                    ...markup,

                    obstacles: [
                        ...manualObstacles,

                        {
                            id:
                                `manual-obstacle-${Date.now()}`,

                            type:
                                obstacleType,

                            xPercent:
                                point.xPercent,

                            yPercent:
                                point.yPercent
                        }
                    ]
                }
            });


            setMessage(
                "✓ Obstacle marker added."
            );
        }
    }


    function saveCalibration() {
        const calibration =
            buildPhotoCalibration({
                points:
                    calibrationDraft,

                distance:
                    calibrationDistance,

                unit:
                    calibrationUnit,

                photoWidth:
                    previewPhoto?.width,

                photoHeight:
                    previewPhoto?.height
            });


        if (
            !calibration
        ) {
            setMessage(
                "Mark two points and enter a valid known distance."
            );

            return;
        }


        savePreview({
            ...previewPhoto,

            markup: {
                ...markup,
                calibration
            }
        });


        setCalibrationDraft(
            []
        );


        setCalibrationDistance(
            ""
        );


        setMessage(
            `✓ Calibration saved at ${calibration.distance} ${calibration.unit}.`
        );
    }


    async function runAiAnalysis() {
        if (
            !previewPhoto?.dataUrl
        ) {
            return;
        }


        setAnalyzing(
            true
        );


        setMessage(
            ""
        );


        try {
            const result =
                await analyzeGardenSpacePhoto({
                    imageDataUrl:
                        previewPhoto.dataUrl,

                    spaceType,

                    dimensions: {
                        width:
                            Number(
                                knownDimensions?.width
                            ) ||
                            null,

                        length:
                            Number(
                                knownDimensions?.length
                            ) ||
                            null,

                        height:
                            Number(
                                knownDimensions?.height
                            ) ||
                            null,

                        unit:
                            unit === "m"
                                ? "m"
                                : "ft"
                    },

                    markup
                });


            savePreview({
                ...previewPhoto,

                analysis:
                    result.analysis,

                analysisModel:
                    result.model
            });


            setMessage(
                "✓ AI visual analysis saved. Review the suggested area and detected objects before using them."
            );
        } catch (
            error
        ) {
            setMessage(
                error?.message ||
                "AI photo analysis is unavailable. Manual mapping still works."
            );
        } finally {
            setAnalyzing(
                false
            );
        }
    }


    function useAiArea() {
        const aiPoints =
            boxToAreaPoints(
                analysis?.usableArea
            );


        if (
            !aiPoints
        ) {
            setMessage(
                "No usable-area suggestion is available."
            );

            return;
        }


        savePreview({
            ...previewPhoto,

            markup: {
                ...markup,
                areaPoints:
                    aiPoints
            }
        });


        setMessage(
            "✓ AI suggested area copied into your editable usable-area outline."
        );
    }


    const orderedArea =
        getOrderedAreaPoints(
            areaPoints
        );


    const savedCalibration =
        markup.calibration ||
        null;


    const displayedCalibration =
        calibrationDraft.length > 0
            ? calibrationDraft
            : (
                savedCalibration?.points ||
                []
            );


    return (
        <div className="garden-space-photo">

            <div className="garden-space-photo-heading">

                <span>
                    📷
                </span>


                <div>

                    <strong>
                        Capture & Map Your Space
                    </strong>


                    <p>
                        Take or upload one photo, map the usable area, give the app one known measurement, and optionally let AI identify visible surfaces and obstacles.
                    </p>

                </div>

            </div>


            <input
                ref={
                    cameraInputRef
                }
                className="garden-space-photo-hidden-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                    (event) => {
                        handlePhotoFile(
                            event.target.files?.[0],
                            "camera"
                        );

                        event.target.value =
                            "";
                    }
                }
            />


            <input
                ref={
                    uploadInputRef
                }
                className="garden-space-photo-hidden-input"
                type="file"
                accept="image/*"
                onChange={
                    (event) => {
                        handlePhotoFile(
                            event.target.files?.[0],
                            "upload"
                        );

                        event.target.value =
                            "";
                    }
                }
            />


            {
                !previewPhoto
                    ? (
                        <div className="garden-space-photo-actions">

                            <button
                                type="button"
                                onClick={() =>
                                    cameraInputRef.current
                                        ?.click()
                                }
                            >
                                <span>
                                    📸
                                </span>

                                <div>

                                    <strong>
                                        Take Photo
                                    </strong>

                                    <small>
                                        Use the rear camera on supported phones
                                    </small>

                                </div>
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    uploadInputRef.current
                                        ?.click()
                                }
                            >
                                <span>
                                    🖼️
                                </span>

                                <div>

                                    <strong>
                                        Upload Photo
                                    </strong>

                                    <small>
                                        Choose an existing image
                                    </small>

                                </div>
                            </button>

                        </div>
                    )
                    : (
                        <div className="garden-space-photo-preview">

                            <div
                                className={
                                    toolMode
                                        ? "garden-space-photo-image-wrap markup-active"
                                        : "garden-space-photo-image-wrap"
                                }
                                onClick={
                                    handlePhotoTap
                                }
                            >

                                <img
                                    src={
                                        previewPhoto.dataUrl
                                    }
                                    alt="Selected garden space"
                                    draggable="false"
                                />


                                <svg
                                    className="garden-space-photo-overlay"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >

                                    {
                                        analysis?.usableArea && (

                                            <rect
                                                className="photo-ai-usable-area"
                                                x={
                                                    analysis.usableArea.x
                                                }
                                                y={
                                                    analysis.usableArea.y
                                                }
                                                width={
                                                    analysis.usableArea.width
                                                }
                                                height={
                                                    analysis.usableArea.height
                                                }
                                            />

                                        )
                                    }


                                    {
                                        (
                                            analysis?.obstacles ||
                                            []
                                        ).map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <rect
                                                    key={
                                                        `ai-obstacle-${index}`
                                                    }
                                                    className="photo-ai-obstacle"
                                                    x={
                                                        item.x
                                                    }
                                                    y={
                                                        item.y
                                                    }
                                                    width={
                                                        item.width
                                                    }
                                                    height={
                                                        item.height
                                                    }
                                                />

                                            )
                                        )
                                    }


                                    {
                                        (
                                            analysis?.structures ||
                                            []
                                        ).map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <rect
                                                    key={
                                                        `ai-structure-${index}`
                                                    }
                                                    className="photo-ai-structure"
                                                    x={
                                                        item.x
                                                    }
                                                    y={
                                                        item.y
                                                    }
                                                    width={
                                                        item.width
                                                    }
                                                    height={
                                                        item.height
                                                    }
                                                />

                                            )
                                        )
                                    }


                                    {
                                        orderedArea && (

                                            <polygon
                                                className="photo-manual-usable-area"
                                                points={
                                                    photoPointsToSvg(
                                                        orderedArea
                                                    )
                                                }
                                            />

                                        )
                                    }


                                    {
                                        areaPoints.map(
                                            (
                                                point,
                                                index
                                            ) => (

                                                <circle
                                                    key={
                                                        `area-${index}`
                                                    }
                                                    className="photo-area-point"
                                                    cx={
                                                        point.xPercent
                                                    }
                                                    cy={
                                                        point.yPercent
                                                    }
                                                    r="1.8"
                                                />

                                            )
                                        )
                                    }


                                    {
                                        displayedCalibration.length ===
                                        2 && (

                                            <line
                                                className="photo-calibration-line"
                                                x1={
                                                    displayedCalibration[0]
                                                        .xPercent
                                                }
                                                y1={
                                                    displayedCalibration[0]
                                                        .yPercent
                                                }
                                                x2={
                                                    displayedCalibration[1]
                                                        .xPercent
                                                }
                                                y2={
                                                    displayedCalibration[1]
                                                        .yPercent
                                                }
                                            />

                                        )
                                    }


                                    {
                                        displayedCalibration.map(
                                            (
                                                point,
                                                index
                                            ) => (

                                                <circle
                                                    key={
                                                        `cal-${index}`
                                                    }
                                                    className="photo-calibration-point"
                                                    cx={
                                                        point.xPercent
                                                    }
                                                    cy={
                                                        point.yPercent
                                                    }
                                                    r="1.7"
                                                />

                                            )
                                        )
                                    }


                                    {
                                        manualObstacles.map(
                                            (item) => (

                                                <g
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <circle
                                                        className="photo-manual-obstacle"
                                                        cx={
                                                            item.xPercent
                                                        }
                                                        cy={
                                                            item.yPercent
                                                        }
                                                        r="2.6"
                                                    />

                                                    <text
                                                        className="photo-manual-obstacle-label"
                                                        x={
                                                            item.xPercent
                                                        }
                                                        y={
                                                            item.yPercent +
                                                            1.1
                                                        }
                                                        textAnchor="middle"
                                                    >
                                                        {
                                                            obstacleIcon(
                                                                item.type
                                                            )
                                                        }
                                                    </text>
                                                </g>

                                            )
                                        )
                                    }

                                </svg>


                                {
                                    accepted && (

                                        <span className="garden-space-photo-used-badge">
                                            ✓ Using this photo
                                        </span>

                                    )
                                }


                                {
                                    toolMode && (

                                        <span className="garden-space-photo-tool-badge">
                                            {
                                                toolMode ===
                                                "area"
                                                    ? `Tap corner ${Math.min(
                                                        4,
                                                        areaPoints.length + 1
                                                    )} of 4`
                                                    : toolMode ===
                                                      "calibration"
                                                        ? `Tap point ${Math.min(
                                                            2,
                                                            calibrationDraft.length + 1
                                                        )} of 2`
                                                        : "Tap each obstacle"
                                            }
                                        </span>

                                    )
                                }

                            </div>


                            <div className="garden-space-photo-meta">

                                <span>
                                    {
                                        previewPhoto.source ===
                                        "camera"
                                            ? "📸 Camera"
                                            : "🖼️ Upload"
                                    }
                                </span>


                                <span>
                                    {
                                        previewPhoto.width
                                    } × {
                                        previewPhoto.height
                                    }
                                </span>


                                <span>
                                    {
                                        formatPhotoSize(
                                            previewPhoto.storedSizeBytes
                                        )
                                    }
                                </span>

                            </div>


                            {
                                !accepted
                                    ? (
                                        <button
                                            type="button"
                                            className="garden-space-photo-use-button"
                                            onClick={
                                                usePhoto
                                            }
                                        >
                                            Use This Photo
                                        </button>
                                    )
                                    : (
                                        <div className="garden-photo-workflow">

                                            <section className="garden-photo-phase-card">

                                                <div className="garden-photo-phase-heading">

                                                    <span>
                                                        2
                                                    </span>

                                                    <div>

                                                        <strong>
                                                            Mark & Calibrate
                                                        </strong>

                                                        <small>
                                                            Tap the photo to define usable space, one known measurement, and visible obstacles.
                                                        </small>

                                                    </div>

                                                </div>


                                                <div className="garden-photo-tool-grid">

                                                    <button
                                                        type="button"
                                                        className={
                                                            toolMode ===
                                                            "area"
                                                                ? "selected"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            setToolMode(
                                                                toolMode ===
                                                                "area"
                                                                    ? null
                                                                    : "area"
                                                            )
                                                        }
                                                    >
                                                        ◻ Usable Area
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            toolMode ===
                                                            "calibration"
                                                                ? "selected"
                                                                : ""
                                                        }
                                                        onClick={() => {
                                                            setCalibrationDraft(
                                                                []
                                                            );

                                                            setToolMode(
                                                                toolMode ===
                                                                "calibration"
                                                                    ? null
                                                                    : "calibration"
                                                            );
                                                        }}
                                                    >
                                                        📏 Known Edge
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            toolMode ===
                                                            "obstacle"
                                                                ? "selected"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            setToolMode(
                                                                toolMode ===
                                                                "obstacle"
                                                                    ? null
                                                                    : "obstacle"
                                                            )
                                                        }
                                                    >
                                                        📍 Obstacles
                                                    </button>

                                                </div>


                                                {
                                                    toolMode ===
                                                    "obstacle" && (

                                                        <select
                                                            className="garden-photo-obstacle-select"
                                                            value={
                                                                obstacleType
                                                            }
                                                            onChange={
                                                                (event) =>
                                                                    setObstacleType(
                                                                        event.target.value
                                                                    )
                                                            }
                                                        >
                                                            {
                                                                obstacleTypes.map(
                                                                    (item) => (

                                                                        <option
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            value={
                                                                                item.id
                                                                            }
                                                                        >
                                                                            {
                                                                                item.icon
                                                                            } {
                                                                                item.label
                                                                            }
                                                                        </option>

                                                                    )
                                                                )
                                                            }
                                                        </select>

                                                    )
                                                }


                                                {
                                                    calibrationDraft.length ===
                                                    2 && (

                                                        <div className="garden-photo-calibration-form">

                                                            <input
                                                                type="number"
                                                                min="0.1"
                                                                step="0.1"
                                                                value={
                                                                    calibrationDistance
                                                                }
                                                                onChange={
                                                                    (event) =>
                                                                        setCalibrationDistance(
                                                                            event.target.value
                                                                        )
                                                                }
                                                                placeholder="Known distance"
                                                            />


                                                            <select
                                                                value={
                                                                    calibrationUnit
                                                                }
                                                                onChange={
                                                                    (event) =>
                                                                        setCalibrationUnit(
                                                                            event.target.value
                                                                        )
                                                                }
                                                            >
                                                                <option value="ft">
                                                                    Feet
                                                                </option>

                                                                <option value="m">
                                                                    Meters
                                                                </option>
                                                            </select>


                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    saveCalibration
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                        </div>

                                                    )
                                                }


                                                {
                                                    savedCalibration && (

                                                        <p className="garden-photo-calibration-summary">
                                                            📏 {
                                                                savedCalibration.distance
                                                            } {
                                                                savedCalibration.unit
                                                            } reference • {
                                                                savedCalibration.pixelsPerUnit
                                                            } px / {
                                                                savedCalibration.unit
                                                            }
                                                        </p>

                                                    )
                                                }


                                                <div className="garden-photo-clear-actions">

                                                    {
                                                        areaPoints.length >
                                                        0 && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    savePreview({
                                                                        ...previewPhoto,
                                                                        markup: {
                                                                            ...markup,
                                                                            areaPoints: []
                                                                        }
                                                                    })
                                                                }
                                                            >
                                                                Clear Area
                                                            </button>

                                                        )
                                                    }


                                                    {
                                                        savedCalibration && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    savePreview({
                                                                        ...previewPhoto,
                                                                        markup: {
                                                                            ...markup,
                                                                            calibration: null
                                                                        }
                                                                    })
                                                                }
                                                            >
                                                                Clear Calibration
                                                            </button>

                                                        )
                                                    }


                                                    {
                                                        manualObstacles.length >
                                                        0 && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    savePreview({
                                                                        ...previewPhoto,
                                                                        markup: {
                                                                            ...markup,
                                                                            obstacles: []
                                                                        }
                                                                    })
                                                                }
                                                            >
                                                                Clear Obstacles
                                                            </button>

                                                        )
                                                    }

                                                </div>

                                            </section>


                                            <section className="garden-photo-phase-card">

                                                <div className="garden-photo-phase-heading">

                                                    <span>
                                                        3
                                                    </span>

                                                    <div>

                                                        <strong>
                                                            AI Visual Analysis
                                                        </strong>

                                                        <small>
                                                            Detect visible surfaces, structures, obstacles, and a suggested usable region.
                                                        </small>

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="garden-photo-ai-button"
                                                    onClick={
                                                        runAiAnalysis
                                                    }
                                                    disabled={
                                                        analyzing
                                                    }
                                                >
                                                    {
                                                        analyzing
                                                            ? "Analyzing Photo…"
                                                            : "✨ Analyze Garden Space"
                                                    }
                                                </button>


                                                {
                                                    analysis && (

                                                        <div className="garden-photo-analysis">

                                                            <strong>
                                                                {
                                                                    analysis.sceneType
                                                                } • {
                                                                    analysis.surfaceType
                                                                }
                                                            </strong>


                                                            <p>
                                                                {
                                                                    analysis.summary
                                                                }
                                                            </p>


                                                            {
                                                                analysis.usableArea && (

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            useAiArea
                                                                        }
                                                                    >
                                                                        Use AI Suggested Area
                                                                    </button>

                                                                )
                                                            }


                                                            <small>
                                                                🚧 {
                                                                    analysis.obstacles.length
                                                                } obstacles • 🧱 {
                                                                    analysis.structures.length
                                                                } structures
                                                            </small>


                                                            {
                                                                analysis.lightObservations.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (

                                                                        <small
                                                                            key={
                                                                                `light-${index}`
                                                                            }
                                                                        >
                                                                            ☀️ {
                                                                                item
                                                                            }
                                                                        </small>

                                                                    )
                                                                )
                                                            }

                                                        </div>

                                                    )
                                                }

                                            </section>


                                            <section className="garden-photo-phase-card">

                                                <div className="garden-photo-phase-heading">

                                                    <span>
                                                        4
                                                    </span>

                                                    <div>

                                                        <strong>
                                                            Garden-in-Photo Preview
                                                        </strong>

                                                        <small>
                                                            After Step 5 generates the deterministic layout, My Garden will project that plan into this marked photo.
                                                        </small>

                                                    </div>

                                                </div>


                                                <p className="garden-photo-render-status">
                                                    🪄 The photo never replaces the measured build plan. It becomes a visual preview of the layout your garden engine already calculated.
                                                </p>

                                            </section>

                                        </div>
                                    )
                            }


                            <div className="garden-space-photo-secondary-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        cameraInputRef.current
                                            ?.click()
                                    }
                                    disabled={
                                        processing ||
                                        analyzing
                                    }
                                >
                                    Retake
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        uploadInputRef.current
                                            ?.click()
                                    }
                                    disabled={
                                        processing ||
                                        analyzing
                                    }
                                >
                                    Choose Different
                                </button>


                                <button
                                    type="button"
                                    className="danger"
                                    onClick={
                                        removePhoto
                                    }
                                    disabled={
                                        processing ||
                                        analyzing
                                    }
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    )
            }


            {
                processing && (

                    <p className="garden-space-photo-processing">
                        ⏳ Preparing photo…
                    </p>

                )
            }


            {
                message && (

                    <p
                        className={
                            message.startsWith(
                                "✓"
                            )
                                ? "garden-space-photo-success"
                                : "garden-space-photo-error"
                        }
                    >
                        {
                            message
                        }
                    </p>

                )
            }


            <small className="garden-space-photo-storage-note">
                Photo mapping is a planning aid. A single image cannot provide survey-grade dimensions or prove sun hours, drainage, soil quality, structural capacity, property boundaries, or hidden hazards.
            </small>

        </div>
    );
}


export default GardenSpacePhoto;
