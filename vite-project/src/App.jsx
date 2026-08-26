import {
    useEffect,
    useState
} from "react";


import {
    Navigate,
    Route,
    Routes
} from "react-router";


import Home
    from "./pages/Home";

import Garden
    from "./pages/Garden";

import Plants
    from "./pages/Plants";

import Calendar
    from "./pages/Calendar";

import Journal
    from "./pages/Journal";


import SuppliesMenu
    from "./components/SuppliesMenu";


import {
    defaultTasks
} from "./data/tasks";


import {
    createHarvestCalendarEvents
} from "./utils/harvestScheduleGenerator";


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

    } catch (error) {

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

    } catch (error) {

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
                source === "perenual"
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
   APP
========================= */

function App() {

    /* =========================
       STATE
    ========================= */

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
        () =>
            loadArray(
                "calendarEvents"
            )
    );


    const [
        wateringRecords,
        setWateringRecords
    ] = useState(
        () =>
            loadArray(
                "wateringRecords"
            )
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
       SYNC WATERING RECORDS
    ========================= */

    useEffect(() => {

        setWateringRecords(
            (currentRecords) => {

                const today =
                    getLocalDateString(
                        new Date()
                    );


                let changed =
                    false;


                const updatedRecords =
                    gardenPlants.map(
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


                            changed =
                                true;


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


                if (
                    updatedRecords.length !==
                    currentRecords.length
                ) {

                    changed =
                        true;

                }


                if (
                    !changed
                ) {

                    return currentRecords;

                }


                return updatedRecords;

            }
        );

    }, [
        gardenPlants
    ]);


    /* =========================
       SYNC HARVEST EVENTS

       This is the important fix.

       Harvest events are now stored
       directly in calendarEvents.
    ========================= */

    useEffect(() => {

        setCalendarEvents(
            (currentEvents) => {

                /*
                    Preserve manual events and
                    unrelated automatic events.
                */

                const nonHarvestSchedulerEvents =
                    currentEvents.filter(
                        (event) =>

                            event.source !==
                            "harvest-scheduler"

                    );


                const generatedHarvestEvents =
                    gardenPlants.flatMap(
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
        );

    }, [
        gardenPlants
    ]);


    /* =========================
       STORAGE
    ========================= */

    useEffect(() => {

        localStorage.setItem(
            "gardenTasks",
            JSON.stringify(
                tasks
            )
        );

    }, [
        tasks
    ]);


    useEffect(() => {

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

    }, [
        gardenProfile
    ]);


    useEffect(() => {

        localStorage.setItem(
            "ownedSupplies",
            JSON.stringify(
                ownedSupplies
            )
        );

    }, [
        ownedSupplies
    ]);


    useEffect(() => {

        localStorage.setItem(
            "gardenPlants",
            JSON.stringify(
                gardenPlants
            )
        );

    }, [
        gardenPlants
    ]);


    useEffect(() => {

        localStorage.setItem(
            "calendarEvents",
            JSON.stringify(
                calendarEvents
            )
        );

    }, [
        calendarEvents
    ]);


    useEffect(() => {

        localStorage.setItem(
            "wateringRecords",
            JSON.stringify(
                wateringRecords
            )
        );

    }, [
        wateringRecords
    ]);


    useEffect(() => {

        localStorage.setItem(
            "journalEntries",
            JSON.stringify(
                journalEntries
            )
        );

    }, [
        journalEntries
    ]);


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
            new Date()
                .toISOString();


        const normalizedPlant =
            normalizeGardenPlant({

                ...plant,

                source:
                    plant.source ||
                    "perenual",

                plantKey:
                    plant.plantKey ||
                    `${plant.source || "perenual"}:${plant.id}`,

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


        setGardenPlants(
            (currentPlants) => {

                const alreadyAdded =
                    currentPlants.some(
                        (gardenPlant) =>

                            gardenPlant.plantKey ===
                            normalizedPlant.plantKey

                    );


                if (
                    alreadyAdded
                ) {

                    return currentPlants;

                }


                return [

                    ...currentPlants,

                    normalizedPlant

                ];

            }
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
            `${plant.source || "perenual"}:${plant.id}`;


        setGardenPlants(
            (currentPlants) =>

                currentPlants.filter(
                    (gardenPlant) =>

                        gardenPlant.plantKey !==
                        plantKey

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

        setGardenPlants(
            (currentPlants) =>

                currentPlants.map(
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
                ) ||
                2
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
                ) ||
                2
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
                            ) ||
                            2
                        );

                }


                return events;

            }
        );


    /* =========================
       ALL CALENDAR EVENTS

       Harvest events are already
       stored in calendarEvents.

       Only watering remains derived.
    ========================= */

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


        </>

    );

}


export default App;