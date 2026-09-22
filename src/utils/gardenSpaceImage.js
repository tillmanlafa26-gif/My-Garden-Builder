const MAX_INPUT_BYTES =
    20 *
    1024 *
    1024;


const TARGET_STORED_BYTES =
    550 *
    1024;


const INITIAL_MAX_DIMENSION =
    1100;


const REDUCED_MAX_DIMENSION =
    900;


function readBlobAsDataUrl(
    blob
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const reader =
                new FileReader();


            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );


            reader.onerror =
                () =>
                    reject(
                        new Error(
                            "The photo could not be read."
                        )
                    );


            reader.readAsDataURL(
                blob
            );
        }
    );
}


function loadImageFromFile(
    file
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const objectUrl =
                URL.createObjectURL(
                    file
                );


            const image =
                new Image();


            image.onload =
                () => {
                    URL.revokeObjectURL(
                        objectUrl
                    );


                    resolve(
                        image
                    );
                };


            image.onerror =
                () => {
                    URL.revokeObjectURL(
                        objectUrl
                    );


                    reject(
                        new Error(
                            "This image format could not be processed by this browser. Try a JPEG, PNG, WebP, or a new camera photo."
                        )
                    );
                };


            image.src =
                objectUrl;
        }
    );
}


function getScaledSize(
    width,
    height,
    maxDimension
) {
    const largest =
        Math.max(
            width,
            height
        );


    if (
        largest <=
        maxDimension
    ) {
        return {
            width,
            height
        };
    }


    const scale =
        maxDimension /
        largest;


    return {
        width:
            Math.max(
                1,
                Math.round(
                    width *
                    scale
                )
            ),

        height:
            Math.max(
                1,
                Math.round(
                    height *
                    scale
                )
            )
    };
}


function renderImageToCanvas(
    image,
    maxDimension
) {
    const size =
        getScaledSize(
            image.naturalWidth ||
            image.width,
            image.naturalHeight ||
            image.height,
            maxDimension
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        size.width;


    canvas.height =
        size.height;


    const context =
        canvas.getContext(
            "2d",
            {
                alpha:
                    false
            }
        );


    if (
        !context
    ) {
        throw new Error(
            "This browser could not prepare the garden photo."
        );
    }


    context.fillStyle =
        "#ffffff";


    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    return canvas;
}


function canvasToBlob(
    canvas,
    quality
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            canvas.toBlob(
                (blob) => {
                    if (
                        !blob
                    ) {
                        reject(
                            new Error(
                                "The garden photo could not be compressed."
                            )
                        );

                        return;
                    }


                    resolve(
                        blob
                    );
                },
                "image/jpeg",
                quality
            );
        }
    );
}


async function createStoredPhotoBlob(
    image
) {
    const qualitySteps = [
        0.8,
        0.7,
        0.6
    ];


    let canvas =
        renderImageToCanvas(
            image,
            INITIAL_MAX_DIMENSION
        );


    let blob =
        null;


    for (
        const quality of qualitySteps
    ) {
        blob =
            await canvasToBlob(
                canvas,
                quality
            );


        if (
            blob.size <=
            TARGET_STORED_BYTES
        ) {
            return {
                blob,
                width:
                    canvas.width,
                height:
                    canvas.height
            };
        }
    }


    canvas =
        renderImageToCanvas(
            image,
            REDUCED_MAX_DIMENSION
        );


    blob =
        await canvasToBlob(
            canvas,
            0.64
        );


    return {
        blob,
        width:
            canvas.width,
        height:
            canvas.height
    };
}


export async function processGardenSpaceImage(
    file,
    source = "upload"
) {
    if (
        !file
    ) {
        throw new Error(
            "Choose a photo first."
        );
    }


    if (
        file.size >
        MAX_INPUT_BYTES
    ) {
        throw new Error(
            "That photo is larger than 20 MB. Choose a smaller image."
        );
    }


    const looksLikeImage =
        String(
            file.type ||
            ""
        ).startsWith(
            "image/"
        );


    if (
        !looksLikeImage
    ) {
        throw new Error(
            "Choose an image file."
        );
    }


    const image =
        await loadImageFromFile(
            file
        );


    if (
        !image.naturalWidth ||
        !image.naturalHeight
    ) {
        throw new Error(
            "The selected photo does not contain readable image dimensions."
        );
    }


    const processed =
        await createStoredPhotoBlob(
            image
        );


    const dataUrl =
        await readBlobAsDataUrl(
            processed.blob
        );


    return {
        id:
            `garden-space-photo-${Date.now()}`,

        dataUrl,

        mimeType:
            "image/jpeg",

        source:
            source ===
            "camera"
                ? "camera"
                : "upload",

        originalName:
            file.name ||
            "garden-space-photo",

        originalSizeBytes:
            Number(
                file.size ||
                0
            ),

        storedSizeBytes:
            processed.blob.size,

        width:
            processed.width,

        height:
            processed.height,

        addedAt:
            new Date()
                .toISOString()
    };
}
