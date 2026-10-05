export function clampPercent(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
        return 0;
    }

    return Math.min(100, Math.max(0, n));
}


export function makePhotoPoint(xPercent, yPercent) {
    return {
        xPercent: Number(clampPercent(xPercent).toFixed(2)),
        yPercent: Number(clampPercent(yPercent).toFixed(2))
    };
}


export function getOrderedAreaPoints(points) {
    if (!Array.isArray(points) || points.length !== 4) {
        return null;
    }

    const p = points.map((point) =>
        makePhotoPoint(point.xPercent, point.yPercent)
    );

    const sum = (point) => point.xPercent + point.yPercent;
    const diff = (point) => point.xPercent - point.yPercent;

    const topLeft = p.reduce((a, b) => sum(a) < sum(b) ? a : b);
    const bottomRight = p.reduce((a, b) => sum(a) > sum(b) ? a : b);
    const topRight = p.reduce((a, b) => diff(a) > diff(b) ? a : b);
    const bottomLeft = p.reduce((a, b) => diff(a) < diff(b) ? a : b);

    const ordered = [
        topLeft,
        topRight,
        bottomRight,
        bottomLeft
    ];

    if (new Set(ordered).size !== 4) {
        return p;
    }

    return ordered;
}


export function boxToAreaPoints(box) {
    if (!box) {
        return null;
    }

    const x = clampPercent(box.x);
    const y = clampPercent(box.y);
    const width = Math.min(
        100 - x,
        Math.max(0, Number(box.width || 0))
    );
    const height = Math.min(
        100 - y,
        Math.max(0, Number(box.height || 0))
    );

    if (width <= 0 || height <= 0) {
        return null;
    }

    return [
        makePhotoPoint(x, y),
        makePhotoPoint(x + width, y),
        makePhotoPoint(x + width, y + height),
        makePhotoPoint(x, y + height)
    ];
}


export function photoPointDistancePixels(
    first,
    second,
    photoWidth,
    photoHeight
) {
    if (!first || !second) {
        return 0;
    }

    const width = Number(photoWidth);
    const height = Number(photoHeight);

    if (
        !Number.isFinite(width) ||
        width <= 0 ||
        !Number.isFinite(height) ||
        height <= 0
    ) {
        return 0;
    }

    const dx =
        ((Number(second.xPercent) - Number(first.xPercent)) / 100) *
        width;

    const dy =
        ((Number(second.yPercent) - Number(first.yPercent)) / 100) *
        height;

    return Math.sqrt((dx * dx) + (dy * dy));
}


export function buildPhotoCalibration({
    points,
    distance,
    unit,
    photoWidth,
    photoHeight
}) {
    if (!Array.isArray(points) || points.length !== 2) {
        return null;
    }

    const realDistance = Number(distance);

    if (!Number.isFinite(realDistance) || realDistance <= 0) {
        return null;
    }

    const pixelDistance = photoPointDistancePixels(
        points[0],
        points[1],
        photoWidth,
        photoHeight
    );

    if (pixelDistance <= 0) {
        return null;
    }

    return {
        points: points.map((point) =>
            makePhotoPoint(point.xPercent, point.yPercent)
        ),
        distance: realDistance,
        unit: unit === "m" ? "m" : "ft",
        pixelDistance: Number(pixelDistance.toFixed(2)),
        pixelsPerUnit: Number((pixelDistance / realDistance).toFixed(3)),
        savedAt: new Date().toISOString()
    };
}


export function mapUnitPointToQuad(
    u,
    v,
    areaPoints
) {
    const ordered = getOrderedAreaPoints(areaPoints);

    if (!ordered) {
        return null;
    }

    const [
        topLeft,
        topRight,
        bottomRight,
        bottomLeft
    ] = ordered;

    const cu = Math.min(1, Math.max(0, Number(u)));
    const cv = Math.min(1, Math.max(0, Number(v)));

    const top = {
        x:
            topLeft.xPercent +
            ((topRight.xPercent - topLeft.xPercent) * cu),
        y:
            topLeft.yPercent +
            ((topRight.yPercent - topLeft.yPercent) * cu)
    };

    const bottom = {
        x:
            bottomLeft.xPercent +
            ((bottomRight.xPercent - bottomLeft.xPercent) * cu),
        y:
            bottomLeft.yPercent +
            ((bottomRight.yPercent - bottomLeft.yPercent) * cu)
    };

    return {
        xPercent: top.x + ((bottom.x - top.x) * cv),
        yPercent: top.y + ((bottom.y - top.y) * cv)
    };
}


export function mapNormalizedRectToQuad({
    x,
    y,
    width,
    height,
    areaPoints
}) {
    const left = Number(x);
    const top = Number(y);
    const right = left + Number(width);
    const bottom = top + Number(height);

    const points = [
        mapUnitPointToQuad(left, top, areaPoints),
        mapUnitPointToQuad(right, top, areaPoints),
        mapUnitPointToQuad(right, bottom, areaPoints),
        mapUnitPointToQuad(left, bottom, areaPoints)
    ].filter(Boolean);

    return points.length === 4
        ? points
        : null;
}


export function photoPointsToSvg(points) {
    return Array.isArray(points)
        ? points
            .map((point) =>
                `${Number(point.xPercent).toFixed(2)},${Number(point.yPercent).toFixed(2)}`
            )
            .join(" ")
        : "";
}
