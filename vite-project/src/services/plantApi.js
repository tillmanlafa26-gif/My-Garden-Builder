const API_BASE_URL =
    "https://perenual.com/api/v2";


const API_KEY =
    import.meta.env
        .VITE_PERENUAL_API_KEY;


/* =========================
   CHECK API KEY
========================= */

function checkApiKey() {

    if (
        !API_KEY ||
        API_KEY.includes(
            "YOUR_API_KEY"
        )
    ) {

        throw new Error(
            "Perenual API key is missing. Check your .env file and restart Vite."
        );

    }

}


/* =========================
   NORMALIZE PLANT
========================= */

function normalizePlant(
    plant
) {

    return {

        id:
            String(
                plant.id
            ),

        apiId:
            plant.id,

        name:
            plant.common_name ||
            plant.scientific_name?.[0] ||
            "Unknown Plant",

        scientificName:
            Array.isArray(
                plant.scientific_name
            )
                ? plant.scientific_name[0]
                : plant.scientific_name ||
                  "",

        otherNames:
            Array.isArray(
                plant.other_name
            )
                ? plant.other_name
                : [],

        family:
            plant.family ||
            "",

        cycle:
            plant.cycle ||
            "Unknown",

        watering:
            plant.watering ||
            "Unknown",

        sunlight:
            Array.isArray(
                plant.sunlight
            )
                ? plant.sunlight
                : [],

        image:
            plant.default_image?.medium_url ||
            plant.default_image?.regular_url ||
            plant.default_image?.small_url ||
            plant.default_image?.thumbnail ||
            "",

        source:
            "perenual"

    };

}


/* =========================
   SEARCH EDIBLE PLANTS
========================= */

export async function searchPlants(
    searchTerm = "",
    page = 1
) {

    checkApiKey();


    const parameters =
        new URLSearchParams();


    parameters.set(
        "key",
        API_KEY
    );


    parameters.set(
        "page",
        String(
            page
        )
    );


    parameters.set(
        "edible",
        "1"
    );


    parameters.set(
        "order",
        "asc"
    );


    if (
        searchTerm.trim()
    ) {

        parameters.set(
            "q",
            searchTerm.trim()
        );

    }


    const response =
        await fetch(

            `${API_BASE_URL}/species-list?${parameters.toString()}`

        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Plant API request failed: ${response.status}`
        );

    }


    const data =
        await response.json();


    return {

        plants:
            Array.isArray(
                data.data
            )
                ? data.data.map(
                    normalizePlant
                )
                : [],

        currentPage:
            data.current_page ||
            page,

        lastPage:
            data.last_page ||
            1,

        total:
            data.total ||
            0,

        perPage:
            data.per_page ||
            30

    };

}


/* =========================
   PLANT DETAILS
========================= */

export async function getPlantDetails(
    plantId
) {

    checkApiKey();


    const parameters =
        new URLSearchParams();


    parameters.set(
        "key",
        API_KEY
    );


    const response =
        await fetch(

            `${API_BASE_URL}/species/details/${plantId}?${parameters.toString()}`

        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Plant detail request failed: ${response.status}`
        );

    }


    return response.json();

}