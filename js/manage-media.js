/* =========================================
   CBRA — UNIFIED CASE MEDIA MANAGEMENT
   =========================================

   Uses the EXISTING database systems:

   Images:
   - case_crime_scene_photos
   - crime-scene-photos Storage bucket

   PDFs / Videos / Links:
   - case_media

   This intentionally does NOT create a
   third media database system.
   ========================================= */


/* -----------------------------------------
   SUPABASE
   ----------------------------------------- */

const caseMediaSupabase =
    window.supabaseClient;


/* -----------------------------------------
   EDIT STATE
   ----------------------------------------- */

let caseMediaEditingId = null;
let caseMediaEditingTable = null;


/* -----------------------------------------
   GET CURRENT CASE
   ----------------------------------------- */

function getCaseMediaCaseId() {

    const selector =
        document.getElementById(
            "case-selector"
        );

    if (
        selector &&
        selector.value
    ) {

        return selector.value;

    }


    if (
        typeof window.getCurrentCaseId ===
        "function"
    ) {

        return window.getCurrentCaseId();

    }


    return "";

}


/* -----------------------------------------
   MESSAGE
   ----------------------------------------- */

function setCaseMediaMessage(
    message,
    isError = false
) {

    const element =
        document.getElementById(
            "media-message"
        );

    if (!element) {
        return;
    }


    element.textContent =
        message || "";


    element.style.color =
        isError
            ? "red"
            : "";

}


/* -----------------------------------------
   BUILD UNIFIED FORM
   ----------------------------------------- */

function buildCaseMediaForm() {

    const container =
        document.getElementById(
            "general-media-management"
        );


    const fallback =
        document.getElementById(
            "crime-scene-photo-management"
        );


    const target =
        container ||
        fallback;


    if (!target) {
        return;
    }


    if (
        document.getElementById(
            "case-media-form"
        )
    ) {

        return;

    }


    target.innerHTML = `

        <div class="management-card">

            <div class="management-card-header">

                <h4>
                    Case Media
                </h4>

                <p>
                    Add photographs, PDFs, videos,
                    or external links associated
                    with this case.
                </p>

            </div>


            <form id="case-media-form">

                <div class="form-grid">


                    <!-- TITLE -->

                    <div class="form-group">

                        <label for="case-media-title">
                            Title
                        </label>

                        <input
                            type="text"
                            id="case-media-title"
                            placeholder="Media title"
                            required
                        >

                    </div>


                    <!-- MEDIA TYPE -->

                    <div class="form-group">

                        <label for="case-media-type">
                            Media Type
                        </label>

                        <select
                            id="case-media-type"
                            required
                        >

                            <option value="">
                                -- Select Type --
                            </option>

                            <option value="Image">
                                Image
                            </option>

                            <option value="PDF">
                                PDF
                            </option>

                            <option value="Video">
                                Video
                            </option>

                            <option value="Link">
                                Link
                            </option>

                        </select>

                    </div>


                    <!-- DATE -->

                    <div class="form-group">

                        <label for="case-media-date">
                            Date
                        </label>

                        <input
                            type="date"
                            id="case-media-date"
                        >

                    </div>


                    <!-- IMAGE / PDF FILE -->

                    <div
                        class="form-group form-group-full"
                        id="case-media-file-group"
                        style="display:none;"
                    >

                        <label for="case-media-file">
                            File
                        </label>

                        <input
                            type="file"
                            id="case-media-file"
                        >

                        <small>
                            Select an image or PDF file.
                        </small>

                    </div>


                    <!-- VIDEO / LINK URL -->

                    <div
                        class="form-group form-group-full"
                        id="case-media-url-group"
                        style="display:none;"
                    >

                        <label for="case-media-url">
                            URL
                        </label>

                        <input
                            type="url"
                            id="case-media-url"
                            placeholder="https://..."
                        >

                    </div>


                    <!-- DESCRIPTION -->

                    <div
                        class="form-group form-group-full"
                    >

                        <label for="case-media-description">
                            Description
                        </label>

                        <textarea
                            id="case-media-description"
                            rows="4"
                            placeholder="Briefly describe the media..."
                        ></textarea>

                    </div>


                    <!-- SOURCE -->

                    <div
                        class="form-group form-group-full"
                    >

                        <label for="case-media-source">
                            Source
                        </label>

                        <select
                            id="case-media-source"
                        >

                            <option value="">
                                -- No Source --
                            </option>

                        </select>

                    </div>


                </div>


                <div class="form-actions">

                    <button
                        type="submit"
                        id="case-media-submit"
                        class="primary-button"
                    >
                        Add Media
                    </button>


                    <button
                        type="button"
                        id="case-media-cancel"
                        class="secondary-button"
                        style="display:none;"
                    >
                        Cancel Edit
                    </button>

                </div>


                <div
                    id="media-message"
                    class="manage-message"
                ></div>

            </form>

        </div>


        <div
            id="case-media-list"
            class="manage-record-list"
        >

            <p class="empty-message">
                Select a case to view media.
            </p>

        </div>

    `;


    const form =
        document.getElementById(
            "case-media-form"
        );


    const typeSelector =
        document.getElementById(
            "case-media-type"
        );


    const cancelButton =
        document.getElementById(
            "case-media-cancel"
        );


    if (typeSelector) {

        typeSelector.addEventListener(
            "change",
            updateCaseMediaInput
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            saveCaseMedia
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelCaseMediaEdit
        );

    }


    updateCaseMediaInput();

}


/* -----------------------------------------
   UPDATE INPUT BASED ON MEDIA TYPE
   ----------------------------------------- */

function updateCaseMediaInput() {

    const type =
        document.getElementById(
            "case-media-type"
        )?.value;


    const fileGroup =
        document.getElementById(
            "case-media-file-group"
        );


    const urlGroup =
        document.getElementById(
            "case-media-url-group"
        );


    const fileInput =
        document.getElementById(
            "case-media-file"
        );


    const urlInput =
        document.getElementById(
            "case-media-url"
        );


    if (fileGroup) {

        fileGroup.style.display =
            (
                type === "Image" ||
                type === "PDF"
            )
                ? "block"
                : "none";

    }


    if (urlGroup) {

        urlGroup.style.display =
            (
                type === "Video" ||
                type === "Link"
            )
                ? "block"
                : "none";

    }


    if (fileInput) {

        if (type === "Image") {

            fileInput.accept =
                "image/*";

        } else if (type === "PDF") {

            fileInput.accept =
                "application/pdf";

        } else {

            fileInput.value =
                "";

        }

    }


    if (urlInput) {

        if (
            type !== "Video" &&
            type !== "Link"
        ) {

            urlInput.value =
                "";

        }

    }

}


/* -----------------------------------------
   LOAD SOURCES
   ----------------------------------------- */

async function loadCaseMediaSources(
    caseId,
    selectedSourceId = ""
) {

    const selector =
        document.getElementById(
            "case-media-source"
        );


    if (!selector) {
        return;
    }


    selector.innerHTML =
        '<option value="">-- No Source --</option>';


    if (!caseId) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await caseMediaSupabase
                .from("sources")
                .select(`
                    id,
                    title
                `)
                .eq(
                    "case_id",
                    Number(caseId)
                )
                .order(
                    "title",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        (data || []).forEach(
            function(source) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        source.id
                    );


                option.textContent =
                    source.title ||
                    "Untitled Source";


                selector.appendChild(
                    option
                );

            }
        );


        if (
            selectedSourceId !== null &&
            selectedSourceId !== undefined &&
            String(selectedSourceId) !== ""
        ) {

            selector.value =
                String(
                    selectedSourceId
                );

        }

    } catch (error) {

        console.error(
            "Case media source loading error:",
            error
        );

    }

}


/* -----------------------------------------
   LOAD UNIFIED MEDIA
   ----------------------------------------- */

async function loadCaseMedia(
    caseId
) {

    buildCaseMediaForm();


    const list =
        document.getElementById(
            "case-media-list"
        );


    if (!list) {
        return;
    }


    if (!caseId) {

        list.innerHTML =
            '<p class="empty-message">Select a case to view media.</p>';

        return;

    }


    list.innerHTML =
        "<p>Loading media...</p>";


    try {

        /* -----------------------------------------
           LOAD CRIME SCENE PHOTOS
           ----------------------------------------- */

        const {
            data: photos,
            error: photoError
        } =
            await caseMediaSupabase
                .from(
                    "case_crime_scene_photos"
                )
                .select(
                    "*"
                )
                .eq(
                    "case_id",
                    caseId
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (photoError) {
            throw photoError;
        }


        /* -----------------------------------------
           LOAD GENERAL CASE MEDIA
           ----------------------------------------- */

        const {
            data: generalMedia,
            error: generalError
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .select(
                    "*"
                )
                .eq(
                    "case_id",
                    caseId
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (generalError) {
            throw generalError;
        }


        /* -----------------------------------------
           LOAD SOURCE NAMES
           ----------------------------------------- */

        const allSourceIds =
            Array.from(
                new Set(
                    [
                        ...(photos || []),
                        ...(generalMedia || [])
                    ]
                        .map(
                            function(item) {

                                return item.source_id;

                            }
                        )
                        .filter(
                            function(id) {

                                return (
                                    id !== null &&
                                    id !== undefined &&
                                    id !== ""
                                );

                            }
                        )
                        .map(
                            function(id) {

                                return String(
                                    id
                                );

                            }
                        )
                )
            );


        const sourceMap =
            new Map();


        if (
            allSourceIds.length > 0
        ) {

            const {
                data: sources,
                error: sourceError
            } =
                await caseMediaSupabase
                    .from(
                        "sources"
                    )
                    .select(
                        "id, title"
                    )
                    .in(
                        "id",
                        allSourceIds
                    );


            if (sourceError) {

                console.error(
                    "Case media source lookup error:",
                    sourceError
                );

            }


            (sources || []).forEach(
                function(source) {

                    sourceMap.set(
                        String(
                            source.id
                        ),
                        source.title ||
                        "Untitled Source"
                    );

                }
            );

        }


        list.innerHTML =
            "";


        const total =
            (
                photos?.length || 0
            ) +
            (
                generalMedia?.length || 0
            );


        if (total === 0) {

            list.innerHTML =
                '<p class="empty-message">No case media added yet.</p>';

            return;

        }


        /* -----------------------------------------
           DISPLAY IMAGES
           ----------------------------------------- */

        (photos || []).forEach(
            function(photo) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "manage-record";


                const title =
                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    photo.title ||
                    "Untitled Image";


                card.appendChild(
                    title
                );


                addCaseMediaText(
                    card,
                    "Type: Image"
                );


                if (
                    photo.date_taken
                ) {

                    addCaseMediaText(
                        card,
                        "Date: " +
                        photo.date_taken
                    );

                }


                if (
                    photo.description
                ) {

                    addCaseMediaText(
                        card,
                        photo.description
                    );

                }


                if (
                    photo.source_id
                ) {

                    addCaseMediaText(
                        card,
                        "Source: " +
                        (
                            sourceMap.get(
                                String(
                                    photo.source_id
                                )
                            ) ||
                            "Source unavailable"
                        )
                    );

                }


                if (
                    photo.image_url
                ) {

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        photo.image_url;


                    image.alt =
                        photo.title ||
                        "Case image";


                    image.style.maxWidth =
                        "300px";


                    image.style.display =
                        "block";


                    image.style.margin =
                        "12px 0";


                    card.appendChild(
                        image
                    );


                    addCaseMediaLink(
                        card,
                        photo.image_url,
                        "Open Full Image"
                    );

                }


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "manage-record-actions";


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.type =
                    "button";


                removeButton.textContent =
                    "Remove";


                removeButton.addEventListener(
                    "click",
                    function() {

                        removeCaseCrimeScenePhoto(
                            photo.id
                        );

                    }
                );


                actions.appendChild(
                    removeButton
                );


                card.appendChild(
                    actions
                );


                list.appendChild(
                    card
                );

            }
        );


        /* -----------------------------------------
           DISPLAY PDF / VIDEO / LINK
           ----------------------------------------- */

        (generalMedia || []).forEach(
            function(media) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "manage-record";


                const title =
                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    media.title ||
                    "Untitled Media";


                card.appendChild(
                    title
                );


                if (
                    media.media_type
                ) {

                    addCaseMediaText(
                        card,
                        "Type: " +
                        media.media_type
                    );

                }


                if (
                    media.media_date
                ) {

                    addCaseMediaText(
                        card,
                        "Date: " +
                        media.media_date
                    );

                }


                if (
                    media.description
                ) {

                    addCaseMediaText(
                        card,
                        media.description
                    );

                }


                if (
                    media.source_id
                ) {

                    addCaseMediaText(
                        card,
                        "Source: " +
                        (
                            sourceMap.get(
                                String(
                                    media.source_id
                                )
                            ) ||
                            "Source unavailable"
                        )
                    );

                }


                if (
                    media.media_url
                ) {

                    addCaseMediaLink(
                        card,
                        media.media_url,
                        media.media_type === "PDF"
                            ? "Open PDF"
                            : "Open Media"
                    );

                }


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "manage-record-actions";


                const editButton =
                    document.createElement(
                        "button"
                    );


                editButton.type =
                    "button";


                editButton.textContent =
                    "Edit";


                editButton.addEventListener(
                    "click",
                    function() {

                        editCaseGeneralMedia(
                            media.id
                        );

                    }
                );


                actions.appendChild(
                    editButton
                );


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.type =
                    "button";


                removeButton.textContent =
                    "Remove";


                removeButton.addEventListener(
                    "click",
                    function() {

                        removeCaseGeneralMedia(
                            media.id
                        );

                    }
                );


                actions.appendChild(
                    removeButton
                );


                card.appendChild(
                    actions
                );


                list.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(
            "Case media loading error:",
            error
        );


        list.innerHTML =
            '<p class="form-message">Unable to load case media.</p>';

    }

}


/* -----------------------------------------
   HELPERS
   ----------------------------------------- */

function addCaseMediaText(
    card,
    text
) {

    const element =
        document.createElement(
            "p"
        );


    element.textContent =
        text;


    card.appendChild(
        element
    );

}


function addCaseMediaLink(
    card,
    url,
    text
) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    link.textContent =
        text;


    card.appendChild(
        link
    );

}


/* -----------------------------------------
   SAVE CASE MEDIA
   ----------------------------------------- */

async function saveCaseMedia(
    event
) {

    event.preventDefault();


    const caseId =
        getCaseMediaCaseId();


    if (!caseId) {

        setCaseMediaMessage(
            "Please select a case first.",
            true
        );

        return;

    }


    const title =
        document.getElementById(
            "case-media-title"
        )?.value.trim();


    const type =
        document.getElementById(
            "case-media-type"
        )?.value;


    const date =
        document.getElementById(
            "case-media-date"
        )?.value ||
        null;


    const description =
        document.getElementById(
            "case-media-description"
        )?.value.trim();


    const sourceValue =
        document.getElementById(
            "case-media-source"
        )?.value;


    const sourceId =
        sourceValue
            ? Number(sourceValue)
            : null;


    const file =
        document.getElementById(
            "case-media-file"
        )?.files?.[0];


    const url =
        document.getElementById(
            "case-media-url"
        )?.value.trim();


    if (!title) {

        setCaseMediaMessage(
            "Please enter a title.",
            true
        );

        return;

    }


    if (!type) {

        setCaseMediaMessage(
            "Please select a media type.",
            true
        );

        return;

    }


    /* -----------------------------------------
       EDIT EXISTING CASE MEDIA
       ----------------------------------------- */

    if (
        caseMediaEditingId &&
        caseMediaEditingTable === "case_media"
    ) {

        let mediaUrl =
            url ||
            null;


        /* -----------------------------------------
           KEEP EXISTING PDF IF NO NEW FILE
           ----------------------------------------- */

        if (
            type === "PDF" &&
            !file
        ) {

            const {
                data: existingMedia,
                error: fetchError
            } =
                await caseMediaSupabase
                    .from(
                        "case_media"
                    )
                    .select(
                        "media_url"
                    )
                    .eq(
                        "id",
                        caseMediaEditingId
                    )
                    .single();


            if (fetchError) {

                console.error(
                    "Existing PDF lookup error:",
                    fetchError
                );


                setCaseMediaMessage(
                    "Unable to load the existing PDF.",
                    true
                );


                return;

            }


            mediaUrl =
                existingMedia?.media_url ||
                null;

        }


        /* -----------------------------------------
           VIDEO / LINK
           ----------------------------------------- */

        if (
            type === "Video" ||
            type === "Link"
        ) {

            if (!mediaUrl) {

                setCaseMediaMessage(
                    "Please enter a URL.",
                    true
                );

                return;

            }


            try {

                new URL(
                    mediaUrl
                );

            } catch {

                setCaseMediaMessage(
                    "Please enter a valid URL.",
                    true
                );

                return;

            }

        }


        /* -----------------------------------------
           REPLACEMENT PDF
           ----------------------------------------- */

        if (
            type === "PDF" &&
            file
        ) {

            if (
                file.type !==
                "application/pdf"
            ) {

                setCaseMediaMessage(
                    "Please select a PDF file.",
                    true
                );

                return;

            }


            setCaseMediaMessage(
                "Uploading replacement PDF..."
            );


            const fileName =
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10) +
                ".pdf";


            const filePath =
                caseId +
                "/documents/" +
                fileName;


            const {
                error: uploadError
            } =
                await caseMediaSupabase
                    .storage
                    .from(
                        "crime-scene-photos"
                    )
                    .upload(
                        filePath,
                        file,
                        {
                            cacheControl:
                                "3600",
                            upsert:
                                false,
                            contentType:
                                "application/pdf"
                        }
                    );


            if (uploadError) {

                console.error(
                    "Replacement PDF upload error:",
                    uploadError
                );


                setCaseMediaMessage(
                    uploadError.message ||
                    "Unable to upload the replacement PDF.",
                    true
                );


                return;

            }


            const {
                data: publicData
            } =
                caseMediaSupabase
                    .storage
                    .from(
                        "crime-scene-photos"
                    )
                    .getPublicUrl(
                        filePath
                    );


            mediaUrl =
                publicData?.publicUrl;


            if (!mediaUrl) {

                setCaseMediaMessage(
                    "The PDF uploaded, but its public URL could not be created.",
                    true
                );

                return;

            }

        }


        /* -----------------------------------------
           UPDATE DATABASE RECORD
           ----------------------------------------- */

        setCaseMediaMessage(
            "Saving changes..."
        );


        const {
            error: updateError
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .update({

                    case_id:
                        caseId,

                    title:
                        title,

                    media_type:
                        type,

                    media_url:
                        mediaUrl,

                    media_date:
                        date,

                    description:
                        description ||
                        null,

                    source_id:
                        sourceId

                })
                .eq(
                    "id",
                    caseMediaEditingId
                );


        if (updateError) {

            console.error(
                "Case media update error:",
                updateError
            );


            setCaseMediaMessage(
                updateError.message ||
                "Unable to save changes.",
                true
            );


            return;

        }


        resetCaseMediaForm();


        setCaseMediaMessage(
            "Media updated successfully."
        );


        await loadCaseMedia(
            caseId
        );


        return;

    }


    /* -----------------------------------------
       NEW IMAGE
       ----------------------------------------- */

    if (
        type === "Image"
    ) {

        if (!file) {

            setCaseMediaMessage(
                "Please select an image.",
                true
            );

            return;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            setCaseMediaMessage(
                "Please select a valid image file.",
                true
            );

            return;

        }


        await saveCrimeSceneImage(
            caseId,
            title,
            date,
            description,
            sourceId,
            file
        );


        return;

    }


    /* -----------------------------------------
       NEW PDF
       ----------------------------------------- */

    if (
        type === "PDF"
    ) {

        if (!file) {

            setCaseMediaMessage(
                "Please select a PDF.",
                true
            );

            return;

        }


        if (
            file.type !==
            "application/pdf"
        ) {

            setCaseMediaMessage(
                "Please select a PDF file.",
                true
            );

            return;

        }


        await saveGeneralMediaFile(
            caseId,
            title,
            type,
            date,
            description,
            sourceId,
            file
        );


        return;

    }


    /* -----------------------------------------
       NEW VIDEO / LINK
       ----------------------------------------- */

    if (
        type === "Video" ||
        type === "Link"
    ) {

        if (!url) {

            setCaseMediaMessage(
                "Please enter a URL.",
                true
            );

            return;

        }


        try {

            new URL(
                url
            );

        } catch {

            setCaseMediaMessage(
                "Please enter a valid URL.",
                true
            );

            return;

        }


        await saveGeneralMediaUrl(
            caseId,
            title,
            type,
            date,
            description,
            sourceId,
            url
        );

    }

}


/* -----------------------------------------
   SAVE IMAGE
   ----------------------------------------- */

async function saveCrimeSceneImage(
    caseId,
    title,
    date,
    description,
    sourceId,
    file
) {

    setCaseMediaMessage(
        "Uploading image..."
    );


    const extension =
        file.name.includes(".")
            ? file.name
                .split(".")
                .pop()
                .toLowerCase()
            : "jpg";


    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "." +
        extension;


    const filePath =
        caseId +
        "/" +
        fileName;


    try {

        const {
            error: uploadError
        } =
            await caseMediaSupabase
                .storage
                .from(
                    "crime-scene-photos"
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            false
                    }
                );


        if (uploadError) {
            throw uploadError;
        }


        const {
            data: publicData
        } =
            caseMediaSupabase
                .storage
                .from(
                    "crime-scene-photos"
                )
                .getPublicUrl(
                    filePath
                );


        const imageUrl =
            publicData?.publicUrl;


        if (!imageUrl) {

            throw new Error(
                "Unable to create the image URL."
            );

        }


        const {
            error
        } =
            await caseMediaSupabase
                .from(
                    "case_crime_scene_photos"
                )
                .insert({

                    case_id:
                        caseId,

                    title:
                        title,

                    image_url:
                        imageUrl,

                    date_taken:
                        date || null,

                    description:
                        description || null,

                    source_id:
                        sourceId

                });


        if (error) {
            throw error;
        }


        resetCaseMediaForm();


        setCaseMediaMessage(
            "Image added successfully."
        );


        await loadCaseMedia(
            caseId
        );


    } catch (error) {

        console.error(
            "Image save error:",
            error
        );


        setCaseMediaMessage(
            error.message ||
            "Unable to add image.",
            true
        );

    }

}


/* -----------------------------------------
   SAVE PDF
   ----------------------------------------- */

async function saveGeneralMediaFile(
    caseId,
    title,
    type,
    date,
    description,
    sourceId,
    file
) {

    setCaseMediaMessage(
        "Uploading PDF..."
    );


    const extension =
        "pdf";


    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "." +
        extension;


    const filePath =
        caseId +
        "/documents/" +
        fileName;


    try {

        const {
            error: uploadError
        } =
            await caseMediaSupabase
                .storage
                .from(
                    "crime-scene-photos"
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            false,
                        contentType:
                            "application/pdf"
                    }
                );


        if (uploadError) {
            throw uploadError;
        }


        const {
            data: publicData
        } =
            caseMediaSupabase
                .storage
                .from(
                    "crime-scene-photos"
                )
                .getPublicUrl(
                    filePath
                );


        const fileUrl =
            publicData?.publicUrl;


        if (!fileUrl) {

            throw new Error(
                "Unable to create the PDF URL."
            );

        }


        const {
            error
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .insert({

                    case_id:
                        caseId,

                    title:
                        title,

                    media_type:
                        type,

                    media_url:
                        fileUrl,

                    media_date:
                        date ||
                        null,

                    description:
                        description ||
                        null,

                    source_id:
                        sourceId

                });


        if (error) {
            throw error;
        }


        resetCaseMediaForm();


        setCaseMediaMessage(
            "PDF added successfully."
        );


        await loadCaseMedia(
            caseId
        );


    } catch (error) {

        console.error(
            "PDF save error:",
            error
        );


        setCaseMediaMessage(
            error.message ||
            "Unable to add PDF.",
            true
        );

    }

}


/* -----------------------------------------
   SAVE VIDEO / LINK
   ----------------------------------------- */

async function saveGeneralMediaUrl(
    caseId,
    title,
    type,
    date,
    description,
    sourceId,
    url
) {

    setCaseMediaMessage(
        "Saving media..."
    );


    try {

        const {
            error
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .insert({

                    case_id:
                        caseId,

                    title:
                        title,

                    media_type:
                        type,

                    media_url:
                        url,

                    media_date:
                        date ||
                        null,

                    description:
                        description ||
                        null,

                    source_id:
                        sourceId

                });


        if (error) {
            throw error;
        }


        resetCaseMediaForm();


        setCaseMediaMessage(
            "Media added successfully."
        );


        await loadCaseMedia(
            caseId
        );


    } catch (error) {

        console.error(
            "Media URL save error:",
            error
        );


        setCaseMediaMessage(
            error.message ||
            "Unable to save media.",
            true
        );

    }

}


/* -----------------------------------------
   EDIT EXISTING GENERAL MEDIA
   ----------------------------------------- */

async function editCaseGeneralMedia(
    mediaId
) {

    try {

        const {
            data: media,
            error
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    mediaId
                )
                .single();


        if (error) {
            throw error;
        }


        if (!media) {

            throw new Error(
                "Media item could not be found."
            );

        }


        caseMediaEditingId =
            media.id;


        caseMediaEditingTable =
            "case_media";


        const title =
            document.getElementById(
                "case-media-title"
            );


        const type =
            document.getElementById(
                "case-media-type"
            );


        const date =
            document.getElementById(
                "case-media-date"
            );


        const description =
            document.getElementById(
                "case-media-description"
            );


        const url =
            document.getElementById(
                "case-media-url"
            );


        if (title) {

            title.value =
                media.title ||
                "";

        }


        if (type) {

            type.value =
                media.media_type ||
                "";

        }


        if (date) {

            date.value =
                media.media_date ||
                "";

        }


        if (description) {

            description.value =
                media.description ||
                "";

        }


        if (url) {

            url.value =
                media.media_url ||
                "";

        }


        await loadCaseMediaSources(
            media.case_id,
            media.source_id || ""
        );


        updateCaseMediaInput();


        const submitButton =
            document.getElementById(
                "case-media-submit"
            );


        const cancelButton =
            document.getElementById(
                "case-media-cancel"
            );


        if (submitButton) {

            submitButton.textContent =
                "Save Changes";

        }


        if (cancelButton) {

            cancelButton.style.display =
                "inline-block";

        }


        setCaseMediaMessage(
            "Editing media. Make your changes and click Save Changes."
        );


        document
            .getElementById(
                "case-media-form"
            )
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "center"
            });


    } catch (error) {

        console.error(
            "Media edit error:",
            error
        );


        setCaseMediaMessage(
            "Unable to load this media item.",
            true
        );

    }

}


/* -----------------------------------------
   RESET FORM
   ----------------------------------------- */

function resetCaseMediaForm() {

    const form =
        document.getElementById(
            "case-media-form"
        );


    if (form) {

        form.reset();

    }


    caseMediaEditingId =
        null;


    caseMediaEditingTable =
        null;


    const submitButton =
        document.getElementById(
            "case-media-submit"
        );


    const cancelButton =
        document.getElementById(
            "case-media-cancel"
        );


    if (submitButton) {

        submitButton.textContent =
            "Add Media";

    }


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    updateCaseMediaInput();

}


/* -----------------------------------------
   CANCEL EDIT
   ----------------------------------------- */

function cancelCaseMediaEdit() {

    resetCaseMediaForm();


    setCaseMediaMessage(
        "Edit cancelled."
    );

}


/* -----------------------------------------
   REMOVE CRIME SCENE PHOTO
   ----------------------------------------- */

async function removeCaseCrimeScenePhoto(
    id
) {

    if (
        !confirm(
            "Remove this image?"
        )
    ) {

        return;

    }


    try {

        const {
            data: photo,
            error: fetchError
        } =
            await caseMediaSupabase
                .from(
                    "case_crime_scene_photos"
                )
                .select(
                    "image_url"
                )
                .eq(
                    "id",
                    id
                )
                .single();


        if (fetchError) {
            throw fetchError;
        }


        const {
            error: databaseError
        } =
            await caseMediaSupabase
                .from(
                    "case_crime_scene_photos"
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (databaseError) {
            throw databaseError;
        }


        if (
            photo &&
            photo.image_url
        ) {

            await deleteCaseMediaStorageFile(
                photo.image_url,
                "crime-scene-photos"
            );

        }


        await loadCaseMedia(
            getCaseMediaCaseId()
        );


    } catch (error) {

        console.error(
            "Image removal error:",
            error
        );


        setCaseMediaMessage(
            "Unable to remove this image.",
            true
        );

    }

}


/* -----------------------------------------
   REMOVE GENERAL MEDIA
   ----------------------------------------- */

async function removeCaseGeneralMedia(
    id
) {

    if (
        !confirm(
            "Remove this media item?"
        )
    ) {

        return;

    }


    try {

        const {
            data: media,
            error: fetchError
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .select(
                    "media_url"
                )
                .eq(
                    "id",
                    id
                )
                .single();


        if (fetchError) {
            throw fetchError;
        }


        const {
            error: databaseError
        } =
            await caseMediaSupabase
                .from(
                    "case_media"
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (databaseError) {
            throw databaseError;
        }


        /*
           Only attempt Storage deletion if
           this is one of our uploaded files.

           External URLs such as YouTube or
           news websites are NOT touched.
        */

        if (
            media &&
            media.media_url &&
            media.media_url.includes(
                "/crime-scene-photos/"
            )
        ) {

            await deleteCaseMediaStorageFile(
                media.media_url,
                "crime-scene-photos"
            );

        }


        await loadCaseMedia(
            getCaseMediaCaseId()
        );


    } catch (error) {

        console.error(
            "General media removal error:",
            error
        );


        setCaseMediaMessage(
            "Unable to remove this media item.",
            true
        );

    }

}


/* -----------------------------------------
   DELETE STORAGE FILE
   ----------------------------------------- */

async function deleteCaseMediaStorageFile(
    publicUrl,
    bucketName
) {

    try {

        const marker =
            "/" +
            bucketName +
            "/";


        const markerIndex =
            publicUrl.indexOf(
                marker
            );


        if (
            markerIndex === -1
        ) {

            return;

        }


        const storagePath =
            decodeURIComponent(
                publicUrl.substring(
                    markerIndex +
                    marker.length
                )
            );


        if (!storagePath) {
            return;
        }


        const {
            error
        } =
            await caseMediaSupabase
                .storage
                .from(
                    bucketName
                )
                .remove([
                    storagePath
                ]);


        if (error) {

            console.error(
                "Storage deletion error:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Storage deletion exception:",
            error
        );

    }

}


/* -----------------------------------------
   CASE SELECTOR
   ----------------------------------------- */

function initializeCaseMediaCaseListener() {

    const selector =
        document.getElementById(
            "case-selector"
        );


    if (!selector) {
        return;
    }


    selector.addEventListener(
        "change",
        async function() {

            resetCaseMediaForm();


            const caseId =
                selector.value;


            await loadCaseMediaSources(
                caseId
            );


            await loadCaseMedia(
                caseId
            );

        }
    );

}


/* -----------------------------------------
   INITIALIZE
   ----------------------------------------- */

function initializeCaseMedia() {

    buildCaseMediaForm();


    const caseId =
        getCaseMediaCaseId();


    if (caseId) {

        loadCaseMediaSources(
            caseId
        );


        loadCaseMedia(
            caseId
        );

    }

}


/* -----------------------------------------
   DOM READY
   ----------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeCaseMedia();

        initializeCaseMediaCaseListener();

    }
);


/* -----------------------------------------
   PUBLIC FUNCTIONS
   ----------------------------------------- */

window.loadCaseMedia =
    loadCaseMedia;


window.loadCaseMediaSources =
    loadCaseMediaSources;


window.saveCaseMedia =
    saveCaseMedia;


window.editCaseGeneralMedia =
    editCaseGeneralMedia;


window.cancelCaseMediaEdit =
    cancelCaseMediaEdit;


window.removeCaseCrimeScenePhoto =
    removeCaseCrimeScenePhoto;


window.removeCaseGeneralMedia =
    removeCaseGeneralMedia;


/* -----------------------------------------
   COMPATIBILITY NAMES
   ----------------------------------------- */

window.loadCrimeScenePhotos =
    loadCaseMedia;


window.loadCrimeScenePhotoSources =
    loadCaseMediaSources;


window.addCrimeScenePhoto =
    saveCaseMedia;


window.removeCrimeScenePhoto =
    removeCaseCrimeScenePhoto;


window.loadGeneralMedia =
    loadCaseMedia;


window.loadGeneralMediaSources =
    loadCaseMediaSources;


window.editGeneralMedia =
    editCaseGeneralMedia;


window.saveGeneralMedia =
    saveCaseMedia;


window.cancelGeneralMediaEdit =
    cancelCaseMediaEdit;


window.removeGeneralMedia =
    removeCaseGeneralMedia;


window.loadMediaSources =
    loadCaseMediaSources;


window.loadMedia =
    loadCaseMedia;