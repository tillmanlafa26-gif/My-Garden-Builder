import {
    useRef,
    useState
} from "react";


import {
    processGardenSpaceImage
} from "../utils/gardenSpaceImage";


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
        1024 *
        1024
    ) {
        return `${Math.max(
            1,
            Math.round(
                numeric /
                1024
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
    onChange
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
        processing,
        setProcessing
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
        accepted,
        setAccepted
    ] = useState(
        Boolean(
            photo
        )
    );


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


            setPreviewPhoto(
                nextPhoto
            );


            setAccepted(
                false
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
            "✓ Photo selected. It will be saved with this space when you continue."
        );
    }


    function removePhoto() {
        setPreviewPhoto(
            null
        );


        setAccepted(
            false
        );


        setMessage(
            ""
        );


        onChange?.(
            null
        );


        if (
            cameraInputRef.current
        ) {
            cameraInputRef.current.value =
                "";
        }


        if (
            uploadInputRef.current
        ) {
            uploadInputRef.current.value =
                "";
        }
    }


    function openCamera() {
        cameraInputRef.current
            ?.click();
    }


    function openUpload() {
        uploadInputRef.current
            ?.click();
    }


    return (
        <div className="garden-space-photo">

            <div className="garden-space-photo-heading">

                <span>
                    📷
                </span>


                <div>

                    <strong>
                        Add a Photo of Your Space
                    </strong>


                    <p>
                        Optional for now. Take a photo with your phone or choose one you already have. This photo will become the starting point for the upcoming visual space-analysis feature.
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
                        const file =
                            event.target.files?.[0];


                        handlePhotoFile(
                            file,
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
                        const file =
                            event.target.files?.[0];


                        handlePhotoFile(
                            file,
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
                                onClick={
                                    openCamera
                                }
                                disabled={
                                    processing
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
                                        Opens the rear camera on supported phones
                                    </small>

                                </div>
                            </button>


                            <button
                                type="button"
                                onClick={
                                    openUpload
                                }
                                disabled={
                                    processing
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
                                        Choose an existing garden-space image
                                    </small>

                                </div>
                            </button>

                        </div>
                    )
                    : (
                        <div className="garden-space-photo-preview">

                            <div className="garden-space-photo-image-wrap">

                                <img
                                    src={
                                        previewPhoto.dataUrl
                                    }
                                    alt="Selected garden space"
                                />


                                {
                                    accepted && (

                                        <span className="garden-space-photo-used-badge">
                                            ✓ Using this photo
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


                                {
                                    previewPhoto.storedSizeBytes && (

                                        <span>
                                            {
                                                formatPhotoSize(
                                                    previewPhoto.storedSizeBytes
                                                )
                                            }
                                        </span>

                                    )
                                }

                            </div>


                            {
                                !accepted && (

                                    <button
                                        type="button"
                                        className="garden-space-photo-use-button"
                                        onClick={
                                            usePhoto
                                        }
                                        disabled={
                                            processing
                                        }
                                    >
                                        Use This Photo
                                    </button>

                                )
                            }


                            <div className="garden-space-photo-secondary-actions">

                                <button
                                    type="button"
                                    onClick={
                                        openCamera
                                    }
                                    disabled={
                                        processing
                                    }
                                >
                                    Retake
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        openUpload
                                    }
                                    disabled={
                                        processing
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
                                        processing
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

                    <div
                        className="garden-space-photo-processing"
                        role="status"
                    >
                        <span>
                            ⏳
                        </span>

                        <p>
                            Preparing photo for the garden project…
                        </p>
                    </div>

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
                        role="status"
                    >
                        {
                            message
                        }
                    </p>

                )
            }


            <small className="garden-space-photo-storage-note">
                The image is resized and compressed before it is stored with your garden. The original full-resolution photo is not copied into the project.
            </small>

        </div>
    );
}


export default GardenSpacePhoto;
