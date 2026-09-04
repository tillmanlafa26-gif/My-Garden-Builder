import {
    useEffect,
    useState
} from "react";

import {
    Navigate,
    Route,
    Routes
} from "react-router";

import Home from "./pages/Home";
import Garden from "./pages/Garden";
import Plants from "./pages/Plants";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";

import SuppliesMenu from "./components/SuppliesMenu";
import AppSettings from "./components/AppSettings";

import {
    defaultTasks
} from "./data/tasks";

import {
    getCropById
} from "./data/cropPlanningData";

import {
    createHarvestCalendarEvents
} from "./utils/harvestScheduleGenerator";


/* =========================
   APP STORAGE KEYS
========================= */

const appStorageKeys = [
    "gardenPlants",
    "gardenTasks",
    "gardenProfile",
    "ownedSupplies",
    "wateringRecords",
    "calendarEvents",
    "journalEntries",
    "gardenTheme",
    "gardenScore",
    "gardenOnboardingSeen"
];


/* =========================
   STORAGE HELPERS
========================= */

function loadArray(
    key,
    fallback = []
) {

    try {

        const savedValue =
            localStorage.getItem(
                key
            );


        if (
            savedValue
        ) {

            const parsedValue =
                JSON.parse(
                    savedValue
                );


            if (
                Array.isArray(
                    parsedValue
                )
            ) {

                return parsedValue;

            }

        }

    } catch (
        error
    ) {

        console.error(
            `Unable to load ${key}:`,
            error
        );

    }


    return fallback;

}


function loadObject(
    key,
    fallback = null
) {

    try {

        const savedValue =
            localStorage.getItem(
                key
            );


        if (
            savedValue
        ) {

            return JSON.parse(
                savedValue
            );

        }

    } catch (
        error
    ) {

        console.error(
            `Unable to load ${key}:`,
            error
        );

    }


    return fallback;

}


/* =========================
   DATE HELPERS
========================= */

function getLocalDateString(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function addDaysToDateString(
    dateString,
    numberOfDays
) {

    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    date.setDate(
        date.getDate() +
        numberOfDays
    );


    return getLocalDateString(
        date
    );

}


function getDateFromIsoValue(
    value
) {

    if (
        !value
    ) {

        return null;

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return getLocalDateString(
        date
    );

}


/* =========================
   WATERING CONVERSION
========================= */

function getApiWaterEveryDays(
    watering
) {

    const value =
        String(
            watering ||
            ""
        ).toLowerCase();


    if (
        value.includes(
            "frequent"
        )
    ) {

        return 1;

    }


    if (
        value.includes(
            "average"
        )
    ) {

        return 2;

    }


    if (
        value.includes(
            "minimum"
        )
    ) {

        return 4;

    }


    if (
        value.includes(
            "none"
        )
    ) {

        return 5;

    }


    return 2;

}


/* =========================
   CROP IDENTIFICATION
========================= */

function resolveCropIdFromPlant(
    plant
) {

    if (
        plant?.cropId
    ) {

        return plant.cropId;

    }


    const scientificNames =
        Array.isArray(
            plant?.scientific_name
        )
            ? plant.scientific_name.join(
                " "
            )
            : plant?.scientific_name ||
              "";


    const text = [
        plant?.name,
        plant?.common_name,
        plant?.commonName,
        scientificNames
    ]
        .filter(
            Boolean
        )
        .join(
            " "
        )
        .toLowerCase();


    const aliases = [

        {
            cropId: "tomato",
            terms: [
                "tomato",
                "solanum lycopersicum",
                "lycopersicon esculentum"
            ]
        },

        {
            cropId: "pepper",
            terms: [
                "pepper",
                "capsicum"
            ]
        },

        {
            cropId: "cucumber",
            terms: [
                "cucumber",
                "cucumis sativus"
            ]
        },

        {
            cropId: "beans",
            terms: [
                "pole bean",
                "green bean",
                "common bean",
                "phaseolus vulgaris"
            ]
        },

        {
            cropId: "lettuce",
            terms: [
                "lettuce",
                "lactuca sativa"
            ]
        },

        {
            cropId: "kale",
            terms: [
                "kale"
            ]
        },

        {
            cropId: "carrot",
            terms: [
                "carrot",
                "daucus carota"
            ]
        },

        {
            cropId: "radish",
            terms: [
                "radish",
                "raphanus sativus"
            ]
        },

        {
            cropId: "basil",
            terms: [
                "basil",
                "ocimum basilicum"
            ]
        },

        {
            cropId: "strawberry",
            terms: [
                "strawberry",
                "fragaria"
            ]
        },

        {
            cropId: "broccoli",
            terms: [
                "broccoli"
            ]
        },

        {
            cropId: "cauliflower",
            terms: [
                "cauliflower"
            ]
        },

        {
            cropId: "cabbage",
            terms: [
                "cabbage"
            ]
        },

        {
            cropId: "spinach",
            terms: [
                "spinach",
                "spinacia oleracea"
            ]
        },

        {
            cropId: "peas",
            terms: [
                "pea",
                "pisum sativum"
            ]
        },

        {
            cropId: "corn",
            terms: [
                "sweet corn",
                "corn",
                "zea mays"
            ]
        },

        {
            cropId: "zucchini",
            terms: [
                "zucchini",
                "courgette"
            ]
        },

        {
            cropId: "eggplant",
            terms: [
                "eggplant",
                "aubergine",
                "solanum melongena"
            ]
        },

        {
            cropId: "onion",
            terms: [
                "onion",
                "allium cepa"
            ]
        },

        {
            cropId: "sweet-potato",
            terms: [
                "sweet potato",
                "ipomoea batatas"
            ]
        },

        {
            cropId: "potato",
            terms: [
                "potato",
                "solanum tuberosum"
            ]
        },

        {
            cropId: "beet",
            terms: [
                "beet",
                "beetroot",
                "beta vulgaris"
            ]
        },

        {
            cropId: "celery",
            terms: [
                "celery",
                "apium graveolens"
            ]
        },

        {
            cropId: "brussels-sprouts",
            terms: [
                "brussels sprout",
                "brussel sprout"
            ]
        }

    ];


    const match =
        aliases.find(
            (item) =>
                item.terms.some(
                    (term) =>
                        text.includes(
                            term
                        )
                )
        );


    return (
        match?.cropId ||
        null
    );

}


/* =========================
   PLANT START DATE
========================= */

function resolvePlantStartDate(
    plant
) {

    if (
        plant?.startDate
    ) {

        return plant.startDate;

    }


    if (
        plant?.plantedDate
    ) {

        return plant.plantedDate;

    }


    if (
        plant?.dateStarted
    ) {

        return plant.dateStarted;

    }


    const addedDate =
        getDateFromIsoValue(
            plant?.addedAt
        );


    if (
        addedDate
    ) {

        return addedDate;

    }


    return getLocalDateString(
        new Date()
    );

}


/* =========================
   NORMALIZE PLANT
========================= */

function normalizeGardenPlant(
    plant
) {

    if (
        !plant ||
        plant.id === undefined ||
        plant.id === null
    ) {

        return null;

    }


    const source =
        plant.source ||
        (
            plant.apiId
                ? "perenual"
                : "starter"
        );


    const plantKey =
        plant.plantKey ||
        `${source}:${plant.id}`;


    return {

        ...plant,

        source,

        plantKey,

        cropId:
            resolveCropIdFromPlant(
                plant
            ),

        startDate:
            resolvePlantStartDate(
                plant
            ),

        startMethod:
            plant.startMethod ||
            null,

        category:
            plant.category ||
            (
                source ===
                "perenual"
                    ? "Edible Plant"
                    : "Plant"
            ),

        icon:
            plant.icon ||
            "🌱",

        water:
            plant.water ||
            plant.watering ||
            "Unknown",

        waterEveryDays:
            Number(
                plant.waterEveryDays
            ) ||
            getApiWaterEveryDays(
                plant.watering
            )

    };

}


/* =========================
   LOAD GARDEN PLANTS
========================= */

function loadGardenPlants() {

    return loadArray(
        "gardenPlants"
    )
        .map(
            normalizeGardenPlant
        )
        .filter(
            Boolean
        );

}


/* =========================
   WATERING RECORD SYNC
========================= */

function syncWateringRecordsForPlants(
    plants,
    currentRecords = []
) {

    const today =
        getLocalDateString(
            new Date()
        );


    return plants.map(
        (plant) => {

            const existingRecord =
                currentRecords.find(
                    (record) =>
                        record.plantKey ===
                        plant.plantKey
                );


            if (
                existingRecord
            ) {

                return existingRecord;

            }


            return {

                plantKey:
                    plant.plantKey,

                plantId:
                    plant.id,

                lastWatered:
                    null,

                lastWateringMethod:
                    null,

                nextWatering:
                    today

            };

        }
    );

}


/* =========================
   HARVEST EVENT SYNC
========================= */

function syncHarvestEventsForPlants(
    plants,
    currentEvents = []
) {

    const nonHarvestSchedulerEvents =
        currentEvents.filter(
            (event) =>
                event.source !==
                "harvest-scheduler"
        );


    const generatedHarvestEvents =
        plants.flatMap(
            (plant) => {

                if (
                    !plant.cropId ||
                    !plant.startDate
                ) {

                    return [];

                }


                return createHarvestCalendarEvents({

                    plantKey:
                        plant.plantKey,

                    plantId:
                        plant.id,

                    cropId:
                        plant.cropId,

                    plantName:
                        plant.name ||
                        plant.common_name,

                    startDate:
                        plant.startDate,

                    startMethod:
                        plant.startMethod

                });

            }
        );


    return [
        ...nonHarvestSchedulerEvents,
        ...generatedHarvestEvents
    ];

}


/* =========================
   PLANTING EVENT HELPERS
========================= */

function getPlantingCompletion(
    gardenProfile,
    eventId
) {

    const completions =
        gardenProfile
            ?.designSpace
            ?.completedPlantingEvents;


    if (
        !Array.isArray(
            completions
        )
    ) {

        return null;

    }


    return completions.find(
        (completion) => {

            if (
                typeof completion ===
                "string"
            ) {

                return completion ===
                    eventId;

            }


            return completion?.eventId ===
                eventId;

        }
    ) || null;

}


function getStartMethodForPlantingEvent(
    calendarEvent,
    crop
) {

    if (
        calendarEvent?.plantingAction ===
        "start-indoors"
    ) {

        return "seed";

    }


    if (
        calendarEvent?.plantingAction ===
        "direct-sow"
    ) {

        return "direct-sow";

    }


    if (
        calendarEvent?.plantingAction ===
        "transplant-outside"
    ) {

        return "transplant";

    }


    return (
        crop?.preferredStartMethod ||
        "direct-sow"
    );

}


function getPlantStageForAction(
    plantingAction
) {

    if (
        plantingAction ===
        "start-indoors"
    ) {

        return "seedling";

    }


    if (
        plantingAction ===
        "transplant-outside"
    ) {

        return "transplanted";

    }


    return "planted";

}


function applyPlantingEventToPlant(
    plant,
    calendarEvent,
    crop
) {

    const startMethod =
        getStartMethodForPlantingEvent(
            calendarEvent,
            crop
        );


    const eventDate =
        calendarEvent.date;


    const nextPlant = {

        ...plant,

        cropId:
            crop.id,

        startDate:
            eventDate,

        startMethod,

        currentStage:
            getPlantStageForAction(
                calendarEvent.plantingAction
            ),

        lastPlantingAction:
            calendarEvent.plantingAction,

        lastPlantingActionDate:
            eventDate,

        lastPlantingEventId:
            calendarEvent.id

    };


    if (
        calendarEvent.plantingAction ===
        "start-indoors"
    ) {

        nextPlant.seedStartDate =
            eventDate;

    }


    if (
        calendarEvent.plantingAction ===
        "direct-sow"
    ) {

        nextPlant.directSowDate =
            eventDate;

    }


    if (
        calendarEvent.plantingAction ===
        "transplant-outside"
    ) {

        nextPlant.transplantDate =
            eventDate;

    }


    if (
        calendarEvent.plantingAction ===
        "fall-planting"
    ) {

        nextPlant.fallPlantDate =
            eventDate;

    }


    return nextPlant;

}


function createCorePlantFromPlantingEvent(
    calendarEvent,
    crop
) {

    const addedAt =
        new Date()
            .toISOString();


    return normalizeGardenPlant(
        applyPlantingEventToPlant(
            {

                id:
                    `core-${crop.id}`,

                cropId:
                    crop.id,

                plantKey:
                    `core:${crop.id}`,

                source:
                    "core",

                name:
                    crop.name,

                common_name:
                    crop.name,

                icon:
                    crop.icon,

                category:
                    "Garden Crop",

                sunlight:
                    crop.minimumSunlight,

                watering:
                    "Average",

                water:
                    "Average",

                addedAt,

                addedFrom:
                    "seasonal-calendar"

            },
            calendarEvent,
            crop
        )
    );

}


/* =========================
   SEASONAL PLANTING EVENTS
========================= */

function createSeasonalPlantingCalendarEvents(
    gardenProfile
) {

    const seasonalGuide =
        gardenProfile
            ?.designSpace
            ?.seasonalGuide;


    const cropSchedules =
        Array.isArray(
            seasonalGuide?.crops
        )
            ? seasonalGuide.crops
            : [];


    function createEvent({
        id,
        date,
        title,
        crop,
        plantingAction
    }) {

        const completion =
            getPlantingCompletion(
                gardenProfile,
                id
            );


        return {

            id,

            date,

            type:
                "planting",

            title,

            cropId:
                crop.cropId,

            cropName:
                crop.name,

            plantingAction,

            automatic:
                true,

            completed:
                Boolean(
                    completion
                ),

            completedAt:
                completion &&
                typeof completion ===
                    "object"
                    ? completion.completedAt ||
                      null
                    : null,

            source:
                "seasonal-planting-planner"

        };

    }


    return cropSchedules.flatMap(
        (crop) => {

            const events = [];


            /* =========================
               START INDOORS
            ========================= */

            if (
                crop.indoorStartDate
            ) {

                const eventId =
                    `seasonal-${crop.cropId}-indoor-${crop.indoorStartDate}`;


                events.push(
                    createEvent({

                        id:
                            eventId,

                        date:
                            crop.indoorStartDate,

                        title:
                            `Start ${crop.name} Indoors`,

                        crop,

                        plantingAction:
                            "start-indoors"

                    })
                );

            }


            /* =========================
               SPRING PLANTING
            ========================= */

            if (
                crop.springPlantDate
            ) {

                let title =
                    `Plant ${crop.name}`;


                let plantingAction =
                    "plant-outside";


                if (
                    crop.springAction ===
                    "Direct sow"
                ) {

                    title =
                        `Direct Sow ${crop.name}`;


                    plantingAction =
                        "direct-sow";

                }


                if (
                    crop.springAction ===
                    "Transplant outside"
                ) {

                    title =
                        `Transplant ${crop.name} Outside`;


                    plantingAction =
                        "transplant-outside";

                }


                const eventId =
                    `seasonal-${crop.cropId}-spring-${crop.springPlantDate}`;


                events.push(
                    createEvent({

                        id:
                            eventId,

                        date:
                            crop.springPlantDate,

                        title,

                        crop,

                        plantingAction

                    })
                );

            }


            /* =========================
               FALL PLANTING
            ========================= */

            if (
                crop.fallPlantDate
            ) {

                const eventId =
                    `seasonal-${crop.cropId}-fall-${crop.fallPlantDate}`;


                events.push(
                    createEvent({

                        id:
                            eventId,

                        date:
                            crop.fallPlantDate,

                        title:
                            `Fall Plant ${crop.name}`,

                        crop,

                        plantingAction:
                            "fall-planting"

                    })
                );

            }


            return events;

        }
    );

}


/* =========================
   SEASONAL EVENT SYNC
========================= */

function syncSeasonalPlantingEventsForProfile(
    gardenProfile,
    currentEvents = []
) {

    const nonSeasonalEvents =
        currentEvents.filter(
            (event) =>
                event.source !==
                "seasonal-planting-planner"
        );


    const seasonalEvents =
        createSeasonalPlantingCalendarEvents(
            gardenProfile
        );


    return [
        ...nonSeasonalEvents,
        ...seasonalEvents
    ];

}


/* =========================
   INITIAL WATERING RECORDS
========================= */

function loadWateringRecords() {

    const plants =
        loadGardenPlants();


    const records =
        loadArray(
            "wateringRecords"
        );


    return syncWateringRecordsForPlants(
        plants,
        records
    );

}


/* =========================
   INITIAL CALENDAR EVENTS
========================= */

function loadCalendarEvents() {

    const plants =
        loadGardenPlants();


    const profile =
        loadObject(
            "gardenProfile",
            null
        );


    const events =
        loadArray(
            "calendarEvents"
        );


    const harvestSyncedEvents =
        syncHarvestEventsForPlants(
            plants,
            events
        );


    return syncSeasonalPlantingEventsForProfile(
        profile,
        harvestSyncedEvents
    );

}


/* =========================
   APP
========================= */

function App() {


    const [
        tasks,
        setTasks
    ] = useState(
        () =>
            loadArray(
                "gardenTasks",
                defaultTasks
            )
    );


    const [
        gardenProfile,
        setGardenProfile
    ] = useState(
        () =>
            loadObject(
                "gardenProfile",
                null
            )
    );


    const [
        ownedSupplies,
        setOwnedSupplies
    ] = useState(
        () =>
            loadArray(
                "ownedSupplies"
            )
    );


    const [
        gardenPlants,
        setGardenPlants
    ] = useState(
        loadGardenPlants
    );


    const [
        calendarEvents,
        setCalendarEvents
    ] = useState(
        loadCalendarEvents
    );


    const [
        wateringRecords,
        setWateringRecords
    ] = useState(
        loadWateringRecords
    );


    const [
        journalEntries,
        setJournalEntries
    ] = useState(
        () =>
            loadArray(
                "journalEntries"
            )
    );


    const [
        suppliesOpen,
        setSuppliesOpen
    ] = useState(
        false
    );


    /* =========================
       STORAGE
    ========================= */

    useEffect(
        () => {

            localStorage.setItem(
                "gardenTasks",
                JSON.stringify(
                    tasks
                )
            );

        },
        [
            tasks
        ]
    );


    useEffect(
        () => {

            if (
                gardenProfile
            ) {

                localStorage.setItem(
                    "gardenProfile",
                    JSON.stringify(
                        gardenProfile
                    )
                );

            } else {

                localStorage.removeItem(
                    "gardenProfile"
                );

            }

        },
        [
            gardenProfile
        ]
    );


    useEffect(
        () => {

            localStorage.setItem(
                "ownedSupplies",
                JSON.stringify(
                    ownedSupplies
                )
            );

        },
        [
            ownedSupplies
        ]
    );


    useEffect(
        () => {

            localStorage.setItem(
                "gardenPlants",
                JSON.stringify(
                    gardenPlants
                )
            );

        },
        [
            gardenPlants
        ]
    );


    useEffect(
        () => {

            localStorage.setItem(
                "calendarEvents",
                JSON.stringify(
                    calendarEvents
                )
            );

        },
        [
            calendarEvents
        ]
    );


    useEffect(
        () => {

            localStorage.setItem(
                "wateringRecords",
                JSON.stringify(
                    wateringRecords
                )
            );

        },
        [
            wateringRecords
        ]
    );


    useEffect(
        () => {

            localStorage.setItem(
                "journalEntries",
                JSON.stringify(
                    journalEntries
                )
            );

        },
        [
            journalEntries
        ]
    );


    /* =========================
       RESET APP
    ========================= */

    function resetAppToOriginalState() {

        try {

            appStorageKeys.forEach(
                (key) => {

                    localStorage.removeItem(
                        key
                    );

                }
            );


            document.documentElement
                .classList
                .remove(
                    "dark-mode"
                );


            window.location.reload();

        } catch (
        error
        ) {

            console.error(
                "Unable to reset My Garden Builder:",
                error
            );

        }

    }


    /* =========================
       TASKS
    ========================= */

    function addTask(
        newTask
    ) {

        setTasks(
            (currentTasks) => [
                ...currentTasks,
                newTask
            ]
        );

    }


    function toggleTask(
        taskId
    ) {

        setTasks(
            (currentTasks) =>
                currentTasks.map(
                    (task) => {

                        if (
                            task.id ===
                            taskId
                        ) {

                            return {
                                ...task,
                                completed:
                                    !task.completed
                            };

                        }


                        return task;

                    }
                )
        );

    }


    /* =========================
       GARDEN PROFILE
    ========================= */

    function saveGardenProfile(
        newProfile
    ) {

        setGardenProfile(
            newProfile
        );


        /*
            Rebuild automatic seasonal planting
            events whenever the garden profile
            changes.

            If no seasonal guide exists,
            previously generated seasonal
            events are removed.
        */

        setCalendarEvents(
            (currentEvents) =>
                syncSeasonalPlantingEventsForProfile(
                    newProfile,
                    currentEvents
                )
        );

    }


    /* =========================
       SUPPLIES
    ========================= */

    function toggleSupply(
        supplyId
    ) {

        setOwnedSupplies(
            (currentSupplies) => {

                if (
                    currentSupplies.includes(
                        supplyId
                    )
                ) {

                    return currentSupplies.filter(
                        (id) =>
                            id !==
                            supplyId
                    );

                }


                return [
                    ...currentSupplies,
                    supplyId
                ];

            }
        );

    }


    /* =========================
       ADD GARDEN PLANT
    ========================= */

    function addGardenPlant(
        plant
    ) {

        const addedAt =
            plant.addedAt ||
            new Date().toISOString();


        const normalizedPlant =
            normalizeGardenPlant({

                ...plant,

                source:
                    plant.source ||
                    "perenual",

                plantKey:
                    plant.plantKey ||
                    `${
                        plant.source ||
                        "perenual"
                    }:${plant.id}`,

                addedAt,

                startDate:
                    plant.startDate ||
                    getDateFromIsoValue(
                        addedAt
                    ) ||
                    getLocalDateString(
                        new Date()
                    )

            });


        if (
            !normalizedPlant
        ) {

            return;

        }


        const alreadyAdded =
            gardenPlants.some(
                (gardenPlant) =>
                    gardenPlant.plantKey ===
                    normalizedPlant.plantKey
            );


        if (
            alreadyAdded
        ) {

            return;

        }


        const nextPlants = [
            ...gardenPlants,
            normalizedPlant
        ];


        setGardenPlants(
            nextPlants
        );


        setWateringRecords(
            (currentRecords) =>
                syncWateringRecordsForPlants(
                    nextPlants,
                    currentRecords
                )
        );


        setCalendarEvents(
            (currentEvents) =>
                syncHarvestEventsForPlants(
                    nextPlants,
                    currentEvents
                )
        );

    }


    /* =========================
       REMOVE GARDEN PLANT
    ========================= */

    function removeGardenPlant(
        plant
    ) {

        if (
            !plant
        ) {

            return;

        }


        const plantKey =
            plant.plantKey ||
            `${
                plant.source ||
                "perenual"
            }:${plant.id}`;


        const nextPlants =
            gardenPlants.filter(
                (gardenPlant) =>
                    gardenPlant.plantKey !==
                    plantKey
            );


        setGardenPlants(
            nextPlants
        );


        setWateringRecords(
            (currentRecords) =>
                syncWateringRecordsForPlants(
                    nextPlants,
                    currentRecords
                )
        );


        setCalendarEvents(
            (currentEvents) =>
                syncHarvestEventsForPlants(
                    nextPlants,
                    currentEvents
                )
        );

    }


    /* =========================
       UPDATE PLANT START
    ========================= */

    function updateGardenPlantStart({
        plantKey,
        startDate,
        startMethod
    }) {

        const nextPlants =
            gardenPlants.map(
                (plant) => {

                    if (
                        plant.plantKey !==
                        plantKey
                    ) {

                        return plant;

                    }


                    return {

                        ...plant,

                        startDate:
                            startDate ||
                            plant.startDate,

                        startMethod:
                            startMethod ||
                            plant.startMethod

                    };

                }
            );


        setGardenPlants(
            nextPlants
        );


        setCalendarEvents(
            (currentEvents) =>
                syncHarvestEventsForPlants(
                    nextPlants,
                    currentEvents
                )
        );

    }


    /* =========================
       WATER PLANT
    ========================= */

    function markPlantWatered(
        plantKey
    ) {

        const plant =
            gardenPlants.find(
                (gardenPlant) =>
                    gardenPlant.plantKey ===
                    plantKey
            );


        if (
            !plant
        ) {

            return;

        }


        const today =
            getLocalDateString(
                new Date()
            );


        const nextWatering =
            addDaysToDateString(
                today,
                Number(
                    plant.waterEveryDays
                ) || 2
            );


        setWateringRecords(
            (currentRecords) => {

                const recordExists =
                    currentRecords.some(
                        (record) =>
                            record.plantKey ===
                            plantKey
                    );


                if (
                    !recordExists
                ) {

                    return [
                        ...currentRecords,
                        {
                            plantKey,

                            plantId:
                                plant.id,

                            lastWatered:
                                today,

                            lastWateringMethod:
                                "manual",

                            nextWatering
                        }
                    ];

                }


                return currentRecords.map(
                    (record) => {

                        if (
                            record.plantKey ===
                            plantKey
                        ) {

                            return {

                                ...record,

                                plantId:
                                    plant.id,

                                lastWatered:
                                    today,

                                lastWateringMethod:
                                    "manual",

                                nextWatering

                            };

                        }


                        return record;

                    }
                );

            }
        );

    }


    /* =========================
       DELAY WATERING
    ========================= */

    function delayWatering(
        plantKey
    ) {

        setWateringRecords(
            (currentRecords) =>
                currentRecords.map(
                    (record) => {

                        if (
                            record.plantKey !==
                            plantKey
                        ) {

                            return record;

                        }


                        const startingDate =
                            record.nextWatering ||
                            getLocalDateString(
                                new Date()
                            );


                        return {

                            ...record,

                            nextWatering:
                                addDaysToDateString(
                                    startingDate,
                                    1
                                ),

                            lastScheduleAction:
                                "delayed",

                            lastScheduleActionDate:
                                getLocalDateString(
                                    new Date()
                                )

                        };

                    }
                )
        );

    }


    /* =========================
       RAIN WATERING
    ========================= */

    function markRainWatered(
        plantKey
    ) {

        const plant =
            gardenPlants.find(
                (gardenPlant) =>
                    gardenPlant.plantKey ===
                    plantKey
            );


        if (
            !plant
        ) {

            return;

        }


        const today =
            getLocalDateString(
                new Date()
            );


        const nextWatering =
            addDaysToDateString(
                today,
                Number(
                    plant.waterEveryDays
                ) || 2
            );


        setWateringRecords(
            (currentRecords) =>
                currentRecords.map(
                    (record) => {

                        if (
                            record.plantKey !==
                            plantKey
                        ) {

                            return record;

                        }


                        return {

                            ...record,

                            plantId:
                                plant.id,

                            lastWatered:
                                today,

                            lastWateringMethod:
                                "rain",

                            nextWatering,

                            lastScheduleAction:
                                "rain",

                            lastScheduleActionDate:
                                today

                        };

                    }
                )
        );

    }


    /* =========================
       CALENDAR
    ========================= */

    function addCalendarEvent(
        newEvent
    ) {

        setCalendarEvents(
            (currentEvents) => [
                ...currentEvents,
                newEvent
            ]
        );

    }


    function deleteCalendarEvent(
        eventId
    ) {

        setCalendarEvents(
            (currentEvents) =>
                currentEvents.filter(
                    (calendarEvent) =>
                        calendarEvent.id !==
                        eventId
                )
        );

    }


    /* =========================
       COMPLETE PLANTING EVENT
    ========================= */

    function completeSeasonalPlantingEvent(
        calendarEvent
    ) {

        if (
            !calendarEvent ||
            calendarEvent.source !==
                "seasonal-planting-planner" ||
            !calendarEvent.cropId ||
            !calendarEvent.date ||
            !gardenProfile
                ?.designSpace
                ?.isActive
        ) {

            return;

        }


        const crop =
            getCropById(
                calendarEvent.cropId
            );


        if (
            !crop
        ) {

            console.error(
                "Unable to track planting event because the crop could not be found:",
                calendarEvent.cropId
            );

            return;

        }


        const existingPlant =
            gardenPlants.find(
                (plant) =>
                    plant.cropId ===
                        crop.id ||
                    plant.plantKey ===
                        `core:${crop.id}`
            );


        let nextPlants;


        if (
            existingPlant
        ) {

            nextPlants =
                gardenPlants.map(
                    (plant) => {

                        if (
                            plant.plantKey !==
                            existingPlant.plantKey
                        ) {

                            return plant;

                        }


                        return normalizeGardenPlant(
                            applyPlantingEventToPlant(
                                plant,
                                calendarEvent,
                                crop
                            )
                        );

                    }
                );

        } else {

            const newPlant =
                createCorePlantFromPlantingEvent(
                    calendarEvent,
                    crop
                );


            if (
                !newPlant
            ) {

                return;

            }


            nextPlants = [
                ...gardenPlants,
                newPlant
            ];

        }


        const currentCompletions =
            Array.isArray(
                gardenProfile
                    ?.designSpace
                    ?.completedPlantingEvents
            )
                ? gardenProfile
                    .designSpace
                    .completedPlantingEvents
                : [];


        const nextCompletions = [

            ...currentCompletions.filter(
                (completion) => {

                    const completionId =
                        typeof completion ===
                            "string"
                            ? completion
                            : completion?.eventId;


                    return completionId !==
                        calendarEvent.id;

                }
            ),

            {
                eventId:
                    calendarEvent.id,

                cropId:
                    crop.id,

                date:
                    calendarEvent.date,

                plantingAction:
                    calendarEvent.plantingAction,

                completedAt:
                    new Date()
                        .toISOString()
            }

        ];


        const nextProfile = {

            ...gardenProfile,

            designSpace: {

                ...gardenProfile.designSpace,

                completedPlantingEvents:
                    nextCompletions

            }

        };


        setGardenProfile(
            nextProfile
        );


        setGardenPlants(
            nextPlants
        );


        setWateringRecords(
            (currentRecords) =>
                syncWateringRecordsForPlants(
                    nextPlants,
                    currentRecords
                )
        );


        setCalendarEvents(
            (currentEvents) => {

                const harvestSyncedEvents =
                    syncHarvestEventsForPlants(
                        nextPlants,
                        currentEvents
                    );


                return syncSeasonalPlantingEventsForProfile(
                    nextProfile,
                    harvestSyncedEvents
                );

            }
        );

    }


    /* =========================
       JOURNAL
    ========================= */

    function addJournalEntry(
        newEntry
    ) {

        setJournalEntries(
            (currentEntries) => [
                ...currentEntries,
                newEntry
            ]
        );

    }


    function deleteJournalEntry(
        entryId
    ) {

        setJournalEntries(
            (currentEntries) =>
                currentEntries.filter(
                    (entry) =>
                        entry.id !==
                        entryId
                )
        );

    }


    /* =========================
       AUTOMATIC WATERING EVENTS
    ========================= */

    const automaticWateringEvents =
        gardenPlants.flatMap(
            (plant) => {

                const wateringRecord =
                    wateringRecords.find(
                        (record) =>
                            record.plantKey ===
                            plant.plantKey
                    );


                if (
                    !wateringRecord ||
                    !wateringRecord.nextWatering
                ) {

                    return [];

                }


                const events = [];


                let eventDate =
                    wateringRecord.nextWatering;


                const endDate =
                    addDaysToDateString(
                        getLocalDateString(
                            new Date()
                        ),
                        42
                    );


                while (
                    eventDate <=
                    endDate
                ) {

                    events.push({

                        id:
                            `auto-water-${plant.plantKey}-${eventDate}`,

                        date:
                            eventDate,

                        type:
                            "watering",

                        title:
                            `Water ${plant.name}`,

                        plantKey:
                            plant.plantKey,

                        plantId:
                            plant.id,

                        automatic:
                            true,

                        source:
                            "watering-scheduler"

                    });


                    eventDate =
                        addDaysToDateString(
                            eventDate,
                            Number(
                                plant.waterEveryDays
                            ) || 2
                        );

                }


                return events;

            }
        );


    const allCalendarEvents = [
        ...calendarEvents,
        ...automaticWateringEvents
    ];


    /* =========================
       SCORE
    ========================= */

    const completedPoints =
        tasks.reduce(
            (
                total,
                task
            ) => {

                if (
                    task.completed
                ) {

                    return (
                        total +
                        Number(
                            task.points
                        )
                    );

                }


                return total;

            },
            0
        );


    const sustainabilityScore =
        Math.min(
            100,
            72 +
            completedPoints
        );


    /* =========================
       ROUTES
    ========================= */

    return (

        <>

            <Routes>


                <Route
                    path="/"

                    element={

                        <Home
                            tasks={
                                tasks
                            }

                            onAddTask={
                                addTask
                            }

                            onToggleTask={
                                toggleTask
                            }

                            sustainabilityScore={
                                sustainabilityScore
                            }

                            gardenProfile={
                                gardenProfile
                            }

                            onSaveGardenProfile={
                                saveGardenProfile
                            }

                            gardenPlants={
                                gardenPlants
                            }

                            onRemoveGardenPlant={
                                removeGardenPlant
                            }

                            wateringRecords={
                                wateringRecords
                            }

                            onMarkPlantWatered={
                                markPlantWatered
                            }

                            onDelayWatering={
                                delayWatering
                            }

                            onRainWatered={
                                markRainWatered
                            }
                        />

                    }
                />


                <Route
                    path="/plants"

                    element={

                        <Plants
                            gardenProfile={
                                gardenProfile
                            }

                            gardenPlants={
                                gardenPlants
                            }

                            onAddPlant={
                                addGardenPlant
                            }

                            onRemovePlant={
                                removeGardenPlant
                            }

                            onUpdatePlantStart={
                                updateGardenPlantStart
                            }
                        />

                    }
                />


                <Route
                    path="/garden"

                    element={

                        <Garden
                            gardenProfile={
                                gardenProfile
                            }

                            onSaveGardenProfile={
                                saveGardenProfile
                            }
                        />

                    }
                />


                <Route
                    path="/calendar"

                    element={

                        <Calendar
                            calendarEvents={
                                allCalendarEvents
                            }

                            gardenPlants={
                                gardenPlants
                            }

                            onAddCalendarEvent={
                                addCalendarEvent
                            }

                            onDeleteCalendarEvent={
                                deleteCalendarEvent
                            }

                            onMarkPlantWatered={
                                markPlantWatered
                            }

                            gardenActive={
                                Boolean(
                                    gardenProfile
                                        ?.designSpace
                                        ?.isActive
                                )
                            }

                            onCompletePlantingEvent={
                                completeSeasonalPlantingEvent
                            }
                        />

                    }
                />


                <Route
                    path="/journal"

                    element={

                        <Journal
                            journalEntries={
                                journalEntries
                            }

                            gardenPlants={
                                gardenPlants
                            }

                            onAddJournalEntry={
                                addJournalEntry
                            }

                            onDeleteJournalEntry={
                                deleteJournalEntry
                            }
                        />

                    }
                />


                <Route
                    path="*"

                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>


            <SuppliesMenu
                isOpen={
                    suppliesOpen
                }

                onOpen={() =>
                    setSuppliesOpen(
                        true
                    )
                }

                onClose={() =>
                    setSuppliesOpen(
                        false
                    )
                }

                gardenProfile={
                    gardenProfile
                }

                ownedSupplies={
                    ownedSupplies
                }

                onToggleSupply={
                    toggleSupply
                }
            />


            <AppSettings
                onResetApp={
                    resetAppToOriginalState
                }
            />


        </>

    );

}


export default App;