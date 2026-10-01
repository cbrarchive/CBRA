/* =========================================
   CBRA — CASE PAGE
   ========================================= */


/* -----------------------------------------
   SUPABASE
   ----------------------------------------- */

const SUPABASE_URL =
    "https://xjbysfrceqtljatsijsy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_iRC9CutWA2fMgucVMtiOEw_f7uSu-3W";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* -----------------------------------------
   BASIC HELPERS
   ----------------------------------------- */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        element.textContent = "—";
        return;
    }

    element.textContent = value;

}


/* -----------------------------------------
   ESCAPE HTML
   ----------------------------------------- */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* -----------------------------------------
   FORMAT DATE
   ----------------------------------------- */

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const parts = String(dateValue).split("-");

    if (parts.length === 3) {

        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (
            Number.isInteger(year) &&
            Number.isInteger(month) &&
            Number.isInteger(day)
        ) {

            const date = new Date(
                year,
                month - 1,
                day
            );

            return date.toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        }

    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* -----------------------------------------
   EXTERNAL LINK
   ----------------------------------------- */

function createExternalLink(
    url,
    label = "View Source"
) {

    if (!url) {
        return "—";
    }

    return `
        <a
            href="${escapeHTML(url)}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${escapeHTML(label)}
        </a>
    `;

}


/* -----------------------------------------
   EMPTY STATE
   ----------------------------------------- */

function showEmpty(
    containerId,
    message = "No information available."
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            ${escapeHTML(message)}
        </div>
    `;

}


/* -----------------------------------------
   GET CASE ID
   ----------------------------------------- */

const params =
    new URLSearchParams(
        window.location.search
    );

const caseId =
    params.get("id");


/* =========================================
   SENSITIVE MEDIA HELPERS
   ========================================= */


/* -----------------------------------------
   CREATE CONTENT WARNING
   ----------------------------------------- */

function createSensitiveMediaGate(
    media,
    revealCallback
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "media-warning";


    const heading =
        document.createElement(
            "h4"
        );

    heading.className =
        "media-warning-title";

    heading.textContent =
        "Content Warning";


    const type =
        document.createElement(
            "p"
        );

    type.className =
        "media-warning-type";

    type.innerHTML =
        "<strong>Warning:</strong> " +
        escapeHTML(
            media.warning_type ||
            "Sensitive Content"
        );


    wrapper.appendChild(
        heading
    );

    wrapper.appendChild(
        type
    );


    if (
        media.warning_text &&
        String(
            media.warning_text
        ).trim() !== ""
    ) {

        const warningText =
            document.createElement(
                "p"
            );

        warningText.className =
            "media-warning-text";

        warningText.textContent =
            media.warning_text;


        wrapper.appendChild(
            warningText
        );

    }


    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "media-warning-button";

    button.textContent =
        "I Understand — Show Media";


    button.addEventListener(
        "click",
        function() {

            wrapper.remove();

            revealCallback();

        }
    );


    wrapper.appendChild(
        button
    );


    return wrapper;

}


/* -----------------------------------------
   CREATE IMAGE
   ----------------------------------------- */

function createCaseMediaImage(
    photo
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "crime-scene-photo-image";


    const image =
        document.createElement(
            "img"
        );

    image.src =
        photo.image_url;

    image.alt =
        photo.title ||
        "Crime scene photo";

    image.loading =
        "lazy";


    wrapper.appendChild(
        image
    );


    const link =
        document.createElement(
            "a"
        );

    link.href =
        photo.image_url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.textContent =
        "Open Full Image";


    wrapper.appendChild(
        link
    );


    return wrapper;

}


/* -----------------------------------------
   CREATE MEDIA LINK
   ----------------------------------------- */

function createCaseMediaLink(
    media
) {

    const wrapper =
        document.createElement(
            "div"
        );


    const link =
        document.createElement(
            "a"
        );

    link.href =
        media.media_url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";


    if (
        media.media_type ===
        "PDF"
    ) {

        link.textContent =
            "Open PDF";

    } else if (
        media.media_type ===
        "Video"
    ) {

        link.textContent =
            "Open Video";

    } else {

        link.textContent =
            "Open Media";

    }


    wrapper.appendChild(
        link
    );


    return wrapper;

}


/* -----------------------------------------
   ADD MEDIA CONTENT WITH WARNING
   ----------------------------------------- */

function addSensitiveMediaContent(
    container,
    media,
    revealCallback
) {

    if (
        media.is_sensitive === true
    ) {

        const gate =
            createSensitiveMediaGate(
                media,
                revealCallback
            );

        container.appendChild(
            gate
        );

        return;

    }


    revealCallback();

}


/* =========================================
   LOAD CASE
   ========================================= */

async function loadCase() {

    if (!caseId) {

        console.error(
            "CBRA: No case ID was provided."
        );

        return;

    }

    const {
        data: caseData,
        error
    } =
        await supabaseClient
            .from("cases")
            .select(`
                id,
                case_name,
                case_date,
                country,
                state_province,
                city,
                classification,
                offense,
                additional_offenses,
                outcome,
                victim_count,
                fatality_count,
                description
            `)
            .eq(
                "id",
                caseId
            )
            .single();

    if (error) {

        console.error(
            "CBRA: Error loading case:",
            error
        );

        return;

    }

    if (!caseData) {

        console.error(
            "CBRA: Case not found."
        );

        return;

    }


    /* -----------------------------------------
       HEADER
       ----------------------------------------- */

    setText(
        "case-name",
        caseData.case_name
    );

    setText(
        "case-location",
        [
            caseData.city,
            caseData.state_province,
            caseData.country
        ]
            .filter(Boolean)
            .join(", ")
    );

    setText(
        "case-date-header",
        formatDate(
            caseData.case_date
        )
    );


    /* -----------------------------------------
       CASE INFORMATION
       ----------------------------------------- */

    setText(
        "case-date",
        formatDate(
            caseData.case_date
        )
    );

    setText(
        "case-country",
        caseData.country
    );

    setText(
        "case-state",
        caseData.state_province
    );

    setText(
        "case-city",
        caseData.city
    );

    setText(
        "case-classification",
        caseData.classification
    );

    setText(
        "case-offense",
        caseData.offense
    );

    setText(
        "case-outcome",
        caseData.outcome
    );

    setText(
        "case-victims",
        caseData.victim_count
    );

    setText(
        "case-fatalities",
        caseData.fatality_count
    );

    setText(
        "case-description",
        caseData.description
    );


    /* -----------------------------------------
       ADDITIONAL OFFENSES
       ----------------------------------------- */

    const additionalContainer =
        document.getElementById(
            "case-additional-offenses"
        );

    if (additionalContainer) {

        if (
            !caseData.additional_offenses ||
            String(
                caseData.additional_offenses
            ).trim() === ""
        ) {

            additionalContainer.textContent =
                "—";

        } else {

            const offenses =
                String(
                    caseData.additional_offenses
                )
                    .split(/\s*(?:,|;|\n)\s*/)
                    .map(
                        offense =>
                            offense.trim()
                    )
                    .filter(Boolean);

            additionalContainer.innerHTML = `
                <ul class="additional-offenses-list">
                    ${
                        offenses
                            .map(
                                offense => `
                                    <li>
                                        ${escapeHTML(
                                            offense
                                        )}
                                    </li>
                                `
                            )
                            .join("")
                    }
                </ul>
            `;

        }

    }

}


/* =========================================
   LOAD PEOPLE
   ========================================= */

async function loadPeople() {

    const container =
        document.getElementById(
            "case-people"
        );

    if (!container) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("case_people")
            .select(`
                role,
                person:people (
                    id,
                    display_name,
                    date_of_birth,
                    age_at_case,
                    gender
                )
            `)
            .eq(
                "case_id",
                caseId
            );

    if (error) {

        console.error(
            "CBRA: Error loading people:",
            error
        );

        showEmpty(
            "case-people",
            "Unable to load people."
        );

        return;

    }

    if (!data || data.length === 0) {

        showEmpty(
            "case-people",
            "No people are linked to this case."
        );

        return;

    }


    const rolePriority = {

        offender: 1,
        defendant: 1,
        suspect: 1,
        perpetrator: 1,
        accused: 1,
        "person of interest": 1,

        victim: 2,

        witness: 3,

        other: 4

    };


    data.sort((a, b) => {

        const roleA =
            String(
                a.role || ""
            )
                .trim()
                .toLowerCase();

        const roleB =
            String(
                b.role || ""
            )
                .trim()
                .toLowerCase();

        const priorityA =
            rolePriority[roleA] ?? 4;

        const priorityB =
            rolePriority[roleB] ?? 4;

        return priorityA - priorityB;

    });


    const html =
        data
            .map(item => {

                const person =
                    item.person;

                if (!person) {
                    return "";
                }

                const role =
                    String(
                        item.role || ""
                    )
                        .trim()
                        .toLowerCase();

                const displayName =
                    escapeHTML(
                        person.display_name ||
                        "Unnamed Person"
                    );

                const nameHTML =
                    role === "victim"
                        ? displayName
                        : `
                            <a
                                href="person.html?id=${encodeURIComponent(
                                    person.id
                                )}"
                            >
                                ${displayName}
                            </a>
                        `;

                return `
                    <div class="person-card">

                        <h3>
                            ${nameHTML}
                        </h3>

                        <p>
                            <strong>Role:</strong>
                            ${escapeHTML(
                                item.role ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Age:</strong>
                            ${escapeHTML(
                                person.age_at_case ?? "—"
                            )}
                        </p>

                        <p>
                            <strong>Date of Birth:</strong>
                            ${
                                person.date_of_birth
                                    ? escapeHTML(
                                        formatDate(
                                            person.date_of_birth
                                        )
                                    )
                                    : "—"
                            }
                        </p>

                        <p>
                            <strong>Gender:</strong>
                            ${escapeHTML(
                                person.gender ||
                                "—"
                            )}
                        </p>

                    </div>
                `;

            })
            .join("");

    container.innerHTML =
        html ||
        `<div class="empty-state">No people are linked to this case.</div>`;

}


/* =========================================
   LOAD TAGS
   ========================================= */

async function loadTags() {

    const {
        data: caseTags,
        error: caseTagError
    } =
        await supabaseClient
            .from("case_tags")
            .select(`
                tag_id
            `)
            .eq(
                "case_id",
                caseId
            );

    if (caseTagError) {

        console.error(
            "CBRA: Error loading case tags:",
            caseTagError
        );

        showEmpty(
            "case-crime-tags",
            "Unable to load tags."
        );

        showEmpty(
            "case-influence-tags",
            "Unable to load tags."
        );

        showEmpty(
            "case-mental-health-tags",
            "Unable to load tags."
        );

        return;

    }

    if (!caseTags || caseTags.length === 0) {

        showEmpty(
            "case-crime-tags",
            "No crime tags are linked to this case."
        );

        showEmpty(
            "case-influence-tags",
            "No influence tags are linked to this case."
        );

        showEmpty(
            "case-mental-health-tags",
            "No mental-health tags are linked to this case."
        );

        return;

    }

    const tagIds =
        caseTags
            .map(
                item => item.tag_id
            )
            .filter(Boolean);

    if (tagIds.length === 0) {
        return;
    }

    const {
        data: tags,
        error: tagError
    } =
        await supabaseClient
            .from("tags")
            .select(`
                id,
                name,
                category
            `)
            .in(
                "id",
                tagIds
            );

    if (tagError) {

        console.error(
            "CBRA: Error loading tag details:",
            tagError
        );

        return;

    }

    if (!tags || tags.length === 0) {
        return;
    }

    const containers = {
        crime:
            document.getElementById(
                "case-crime-tags"
            ),

        influence:
            document.getElementById(
                "case-influence-tags"
            ),

        mental_health:
            document.getElementById(
                "case-mental-health-tags"
            )
    };

    Object.values(containers)
        .forEach(container => {

            if (container) {
                container.innerHTML = "";
            }

        });

    tags
        .sort(
            (a, b) =>
                (a.name || "")
                    .localeCompare(
                        b.name || ""
                    )
        )
        .forEach(tag => {

            const container =
                containers[
                    tag.category
                ];

            if (!container) {
                return;
            }

            const link =
                document.createElement("a");

            link.className =
                "case-tag";

            link.href =
                "archive.html?tag=" +
                encodeURIComponent(
                    tag.name
                );

            link.textContent =
                tag.name;

            container.appendChild(
                link
            );

        });

    Object.entries(containers)
        .forEach(
            ([category, container]) => {

                if (
                    container &&
                    container.children.length === 0
                ) {

                    const labels = {
                        crime:
                            "No crime tags are linked to this case.",

                        influence:
                            "No influence tags are linked to this case.",

                        mental_health:
                            "No mental-health tags are linked to this case."
                    };

                    container.innerHTML = `
                        <div class="empty-state">
                            ${escapeHTML(
                                labels[category]
                            )}
                        </div>
                    `;

                }

            }
        );

}


/* =========================================
   LOAD CRIME SCENE PHOTOS
   ========================================= */

async function loadCrimeScenePhotos() {

    const container =
        document.getElementById(
            "case-crime-scene-photos"
        );

    if (!container) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "case_crime_scene_photos"
            )
            .select(`
                id,
                title,
                image_url,
                date_taken,
                description,
                source_id,
                is_sensitive,
                warning_type,
                warning_text
            `)
            .eq(
                "case_id",
                caseId
            );

    if (error) {

        console.error(
            "CBRA: Error loading crime scene photos:",
            error
        );

        showEmpty(
            "case-crime-scene-photos",
            "Unable to load crime scene photos."
        );

        return;

    }

    if (!data || data.length === 0) {

        showEmpty(
            "case-crime-scene-photos",
            "No crime scene photos are available."
        );

        return;

    }

    data.sort(
        (a, b) => {

            if (!a.date_taken) return 1;

            if (!b.date_taken) return -1;

            return (
                new Date(a.date_taken) -
                new Date(b.date_taken)
            );

        }
    );


    container.innerHTML = "";


    data.forEach(photo => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "crime-scene-photo-card";


        const imageArea =
            document.createElement(
                "div"
            );

        imageArea.className =
            "crime-scene-photo-image";


        const info =
            document.createElement(
                "div"
            );

        info.className =
            "crime-scene-photo-info";


        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            photo.title ||
            "Untitled Photo";

        info.appendChild(
            title
        );


        const date =
            document.createElement(
                "p"
            );

        date.innerHTML =
            "<strong>Date Taken:</strong> " +
            escapeHTML(
                photo.date_taken
                    ? formatDate(
                        photo.date_taken
                    )
                    : "—"
            );

        info.appendChild(
            date
        );


        if (
            photo.description
        ) {

            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                photo.description;

            info.appendChild(
                description
            );

        }


        card.appendChild(
            imageArea
        );

        card.appendChild(
            info
        );


        container.appendChild(
            card
        );


        const revealImage =
            function() {

                const image =
                    createCaseMediaImage(
                        photo
                    );

                imageArea.innerHTML =
                    "";

                imageArea.appendChild(
                    image
                );

            };


        addSensitiveMediaContent(
            imageArea,
            photo,
            revealImage
        );

    });

}


/* =========================================
   LOAD MEDIA
   ========================================= */

async function loadMedia() {

    const container =
        document.getElementById(
            "case-media"
        );

    if (!container) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("case_media")
            .select(`
                id,
                title,
                media_type,
                description,
                media_url,
                media_date,
                source_id,
                is_sensitive,
                warning_type,
                warning_text
            `)
            .eq(
                "case_id",
                caseId
            );

    if (error) {

        console.error(
            "CBRA: Error loading media:",
            error
        );

        showEmpty(
            "case-media",
            "Unable to load media."
        );

        return;

    }

    if (!data || data.length === 0) {

        showEmpty(
            "case-media",
            "No media is available."
        );

        return;

    }


    const sourceIds =
        data
            .map(
                media =>
                    media.source_id
            )
            .filter(Boolean);


    let sources = [];


    if (sourceIds.length > 0) {

        const {
            data: sourceData,
            error: sourceError
        } =
            await supabaseClient
                .from("sources")
                .select(`
                    id,
                    title,
                    url
                `)
                .in(
                    "id",
                    sourceIds
                );

        if (sourceError) {

            console.warn(
                "CBRA: Could not load media sources:",
                sourceError
            );

        } else {

            sources =
                sourceData || [];

        }

    }


    const sourceMap =
        new Map(
            sources.map(
                source => [
                    source.id,
                    source
                ]
            )
        );


    container.innerHTML =
        "";


    data.forEach(media => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "media-card";


        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            media.title ||
            "Untitled Media";

        card.appendChild(
            title
        );


        const type =
            document.createElement(
                "p"
            );

        type.innerHTML =
            "<strong>Type:</strong> " +
            escapeHTML(
                media.media_type ||
                "—"
            );

        card.appendChild(
            type
        );


        if (
            media.media_date
        ) {

            const date =
                document.createElement(
                    "p"
                );

            date.innerHTML =
                "<strong>Date:</strong> " +
                escapeHTML(
                    formatDate(
                        media.media_date
                    )
                );

            card.appendChild(
                date
            );

        }


        if (
            media.description
        ) {

            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                media.description;

            card.appendChild(
                description
            );

        }


        const mediaArea =
            document.createElement(
                "div"
            );

        mediaArea.className =
            "case-media-content";


        card.appendChild(
            mediaArea
        );


        const revealMedia =
            function() {

                mediaArea.innerHTML =
                    "";

                if (
                    media.media_url
                ) {

                    mediaArea.appendChild(
                        createCaseMediaLink(
                            media
                        )
                    );

                }

            };


        addSensitiveMediaContent(
            mediaArea,
            media,
            revealMedia
        );


        const source =
            media.source_id
                ? sourceMap.get(
                    media.source_id
                )
                : null;


        if (source) {

            const sourceInfo =
                document.createElement(
                    "div"
                );

            sourceInfo.className =
                "media-source";


            const sourceText =
                document.createElement(
                    "p"
                );

            sourceText.innerHTML =
                "<strong>Source:</strong> " +
                escapeHTML(
                    source.title ||
                    "Untitled Source"
                );

            sourceInfo.appendChild(
                sourceText
            );


            if (
                source.url
            ) {

                const sourceLink =
                    document.createElement(
                        "div"
                    );

                sourceLink.innerHTML =
                    createExternalLink(
                        source.url,
                        "View Source"
                    );

                sourceInfo.appendChild(
                    sourceLink
                );

            }


            card.appendChild(
                sourceInfo
            );

        }


        container.appendChild(
            card
        );

    });

}


/* =========================================
   LOAD DOCUMENTS
   ========================================= */

async function loadDocuments() {

    const container =
        document.getElementById(
            "case-documents"
        );

    if (!container) return;

    const {
        data: documentCases,
        error: documentCaseError
    } =
        await supabaseClient
            .from("document_cases")
            .select(`
                document_id
            `)
            .eq(
                "case_id",
                caseId
            );

    if (documentCaseError) {

        console.error(
            "CBRA: Error loading document links:",
            documentCaseError
        );

        showEmpty(
            "case-documents",
            "Unable to load documents."
        );

        return;

    }

    if (
        !documentCases ||
        documentCases.length === 0
    ) {

        showEmpty(
            "case-documents",
            "No documents are linked to this case."
        );

        return;

    }

    const documentIds =
        documentCases
            .map(
                item =>
                    item.document_id
            )
            .filter(Boolean);

    const {
        data: documents,
        error
    } =
        await supabaseClient
            .from("documents")
            .select(`
                id,
                title,
                document_type,
                publication_date,
                description,
                document_url,
                source_id
            `)
            .in(
                "id",
                documentIds
            );

    if (error) {

        console.error(
            "CBRA: Error loading documents:",
            error
        );

        showEmpty(
            "case-documents",
            "Unable to load documents."
        );

        return;

    }

    if (!documents || documents.length === 0) {

        showEmpty(
            "case-documents",
            "No documents are available."
        );

        return;

    }

    const sourceIds =
        documents
            .map(
                document =>
                    document.source_id
            )
            .filter(Boolean);

    let sources = [];

    if (sourceIds.length > 0) {

        const {
            data: sourceData
        } =
            await supabaseClient
                .from("sources")
                .select(`
                    id,
                    title,
                    url
                `)
                .in(
                    "id",
                    sourceIds
                );

        sources =
            sourceData || [];

    }

    const sourceMap =
        new Map(
            sources.map(
                source => [
                    source.id,
                    source
                ]
            )
        );

    documents.sort(
        (a, b) => {

            if (!a.publication_date) return 1;

            if (!b.publication_date) return -1;

            return (
                new Date(
                    b.publication_date
                ) -
                new Date(
                    a.publication_date
                )
            );

        }
    );

    container.innerHTML =
        documents
            .map(document => {

                const source =
                    document.source_id
                        ? sourceMap.get(
                            document.source_id
                        )
                        : null;

                return `
                    <div class="document-card">

                        <h3>
                            ${escapeHTML(
                                document.title ||
                                "Untitled Document"
                            )}
                        </h3>

                        <p>
                            <strong>Type:</strong>
                            ${escapeHTML(
                                document.document_type ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Publication Date:</strong>
                            ${
                                document.publication_date
                                    ? escapeHTML(
                                        formatDate(
                                            document.publication_date
                                        )
                                    )
                                    : "—"
                            }
                        </p>

                        ${
                            document.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            document.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                        ${
                            document.document_url
                                ? createExternalLink(
                                    document.document_url,
                                    "View Document"
                                )
                                : ""
                        }

                        ${
                            source
                                ? `
                                    <p>
                                        <strong>Source:</strong>
                                        ${escapeHTML(
                                            source.title ||
                                            "Untitled Source"
                                        )}
                                    </p>

                                    ${
                                        source.url
                                            ? createExternalLink(
                                                source.url,
                                                "View Source"
                                            )
                                            : ""
                                    }
                                `
                                : ""
                        }

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   LOAD CASE SOURCES
   ========================================= */

async function loadCaseSources() {

    const container =
        document.getElementById(
            "case-sources"
        );

    if (!container) return;

    const {
        data: sourceCases,
        error: sourceCaseError
    } =
        await supabaseClient
            .from("source_cases")
            .select(`
                source_id
            `)
            .eq(
                "case_id",
                caseId
            );

    if (sourceCaseError) {

        console.error(
            "CBRA: Error loading source_cases:",
            sourceCaseError
        );

        showEmpty(
            "case-sources",
            "Unable to load sources."
        );

        return;

    }

    if (
        !sourceCases ||
        sourceCases.length === 0
    ) {

        showEmpty(
            "case-sources",
            "No sources are linked to this case."
        );

        return;

    }

    const sourceIds =
        sourceCases
            .map(
                relationship =>
                    relationship.source_id
            )
            .filter(
                sourceId =>
                    sourceId !== null &&
                    sourceId !== undefined
            );

    if (sourceIds.length === 0) {

        showEmpty(
            "case-sources",
            "No sources are linked to this case."
        );

        return;

    }

    const {
        data: sources,
        error: sourceError
    } =
        await supabaseClient
            .from("sources")
            .select(`
                id,
                title,
                url,
                source_type,
                publication_date
            `)
            .in(
                "id",
                sourceIds
            );

    if (sourceError) {

        console.error(
            "CBRA: Error loading source records:",
            sourceError
        );

        showEmpty(
            "case-sources",
            "Unable to load sources."
        );

        return;

    }

    if (
        !sources ||
        sources.length === 0
    ) {

        showEmpty(
            "case-sources",
            "The linked source records could not be found."
        );

        return;

    }

    sources.sort(
        (a, b) => {

            if (!a.publication_date) return 1;

            if (!b.publication_date) return -1;

            return (
                new Date(
                    b.publication_date
                ) -
                new Date(
                    a.publication_date
                )
            );

        }
    );

    container.innerHTML =
        sources
            .map(source => {

                return `
                    <div class="source-card">

                        <h3>
                            ${escapeHTML(
                                source.title ||
                                "Untitled Source"
                            )}
                        </h3>

                        <p>
                            <strong>Type:</strong>
                            ${escapeHTML(
                                source.source_type ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Publication Date:</strong>
                            ${
                                source.publication_date
                                    ? escapeHTML(
                                        formatDate(
                                            source.publication_date
                                        )
                                    )
                                    : "—"
                            }
                        </p>

                        ${
                            source.url
                                ? createExternalLink(
                                    source.url,
                                    "View Source"
                                )
                                : ""
                        }

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   LOAD LINKS
   ========================================= */

async function loadLinks() {

    const container =
        document.getElementById(
            "case-links"
        );

    if (!container) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("case_links")
            .select(`
                id,
                title,
                url,
                description
            `)
            .eq(
                "case_id",
                caseId
            );

    if (error) {

        console.error(
            "CBRA: Error loading links:",
            error
        );

        showEmpty(
            "case-links",
            "Unable to load links."
        );

        return;

    }

    if (!data || data.length === 0) {

        showEmpty(
            "case-links",
            "No additional links are available."
        );

        return;

    }

    container.innerHTML =
        data
            .map(link => {

                return `
                    <div class="case-link-card">

                        <h3>
                            ${escapeHTML(
                                link.title ||
                                "Untitled Link"
                            )}
                        </h3>

                        ${
                            link.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            link.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                        ${
                            link.url
                                ? createExternalLink(
                                    link.url,
                                    "Open Link"
                                )
                                : ""
                        }

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   LOAD RELATED CASES
   ========================================= */

async function loadRelatedCases() {

    const container =
        document.getElementById(
            "case-related"
        );

    if (!container) return;

    const {
        data: relationships,
        error: relationshipError
    } =
        await supabaseClient
            .from("related_cases")
            .select(`
                related_case_id,
                relationship_type
            `)
            .eq(
                "case_id",
                caseId
            );

    if (relationshipError) {

        console.error(
            "CBRA: Error loading related cases:",
            relationshipError
        );

        showEmpty(
            "case-related",
            "Unable to load related cases."
        );

        return;

    }

    if (
        !relationships ||
        relationships.length === 0
    ) {

        showEmpty(
            "case-related",
            "No related cases are linked."
        );

        return;

    }

    const relatedCaseIds =
        relationships
            .map(
                relationship =>
                    relationship.related_case_id
            )
            .filter(Boolean);

    const {
        data: cases,
        error: caseError
    } =
        await supabaseClient
            .from("cases")
            .select(`
                id,
                case_name,
                case_date,
                classification,
                offense
            `)
            .in(
                "id",
                relatedCaseIds
            );

    if (caseError) {

        console.error(
            "CBRA: Error loading related case details:",
            caseError
        );

        showEmpty(
            "case-related",
            "Unable to load related cases."
        );

        return;

    }

    if (!cases || cases.length === 0) {

        showEmpty(
            "case-related",
            "No related cases were found."
        );

        return;

    }

    const caseMap =
        new Map(
            cases.map(
                relatedCase => [
                    relatedCase.id,
                    relatedCase
                ]
            )
        );

    container.innerHTML =
        relationships
            .map(relationship => {

                const relatedCase =
                    caseMap.get(
                        relationship.related_case_id
                    );

                if (!relatedCase) {
                    return "";
                }

                return `
                    <div class="related-case-card">

                        <h3>

                            <a
                                href="case.html?id=${encodeURIComponent(
                                    relatedCase.id
                                )}"
                            >
                                ${escapeHTML(
                                    relatedCase.case_name ||
                                    "Unnamed Case"
                                )}
                            </a>

                        </h3>

                        <p>
                            <strong>Relationship:</strong>
                            ${escapeHTML(
                                relationship.relationship_type ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Date:</strong>
                            ${
                                relatedCase.case_date
                                    ? escapeHTML(
                                        formatDate(
                                            relatedCase.case_date
                                        )
                                    )
                                    : "—"
                            }
                        </p>

                        <p>
                            <strong>Classification:</strong>
                            ${escapeHTML(
                                relatedCase.classification ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Primary Offense:</strong>
                            ${escapeHTML(
                                relatedCase.offense ||
                                "—"
                            )}
                        </p>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   LOAD EVERYTHING
   ========================================= */

loadCase();
loadPeople();
loadTags();
loadCrimeScenePhotos();
loadMedia();
loadDocuments();
loadCaseSources();
loadLinks();
loadRelatedCases();