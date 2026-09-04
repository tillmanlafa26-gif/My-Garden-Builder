import {
    useMemo,
    useState
} from "react";


import BottomNav
    from "../components/BottomNav";


function Calendar({
    calendarEvents = [],
    gardenPlants = [],
    onAddCalendarEvent,
    onDeleteCalendarEvent,
    onMarkPlantWatered
}) {

    /* =========================
       DATE HELPER
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


    function formatCalendarDate(
        dateString
    ) {

        if (
            !dateString
        ) {

            return "";

        }


        return new Date(
            `${dateString}T12:00:00`
        ).toLocaleDateString(
            undefined,
            {
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );

    }


    const today =
        getLocalDateString(
            new Date()
        );


    /* =========================
       CURRENT MONTH
    ========================= */

    const [
        currentMonth,
        setCurrentMonth
    ] = useState(
        () => {

            const now =
                new Date();


            return new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        }
    );


    /* =========================
       FORM STATE
    ========================= */

    const [
        eventDate,
        setEventDate
    ] = useState(
        today
    );


    const [
        eventType,
        setEventType
    ] = useState(
        "watering"
    );


    const [
        eventTitle,
        setEventTitle
    ] = useState(
        ""
    );


    const [
        selectedPlantKey,
        setSelectedPlantKey
    ] = useState(
        ""
    );


    const [
        message,
        setMessage
    ] = useState(
        ""
    );


    /* =========================
       MONTH INFORMATION
    ========================= */

    const year =
        currentMonth.getFullYear();


    const monthIndex =
        currentMonth.getMonth();


    const monthName =
        currentMonth.toLocaleDateString(
            undefined,
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );


    const firstDayOfMonth =
        new Date(
            year,
            monthIndex,
            1
        ).getDay();


    const numberOfDays =
        new Date(
            year,
            monthIndex + 1,
            0
        ).getDate();


    /* =========================
       CALENDAR DAYS
    ========================= */

    const calendarDays =
        useMemo(
            () => {

                const days = [];


                for (
                    let blank = 0;
                    blank < firstDayOfMonth;
                    blank++
                ) {

                    days.push({
                        type:
                            "blank",

                        key:
                            `blank-${blank}`
                    });

                }


                for (
                    let day = 1;
                    day <= numberOfDays;
                    day++
                ) {

                    const date =
                        new Date(
                            year,
                            monthIndex,
                            day
                        );


                    const dateString =
                        getLocalDateString(
                            date
                        );


                    const events =
                        calendarEvents.filter(
                            (calendarEvent) =>
                                calendarEvent.date ===
                                dateString
                        );


                    days.push({

                        type:
                            "day",

                        key:
                            dateString,

                        day,

                        dateString,

                        events

                    });

                }


                return days;

            },
            [
                year,
                monthIndex,
                firstDayOfMonth,
                numberOfDays,
                calendarEvents
            ]
        );


    /* =========================
       PLANT LOOKUP
    ========================= */

    function findGardenPlant(
        calendarEvent
    ) {

        if (
            calendarEvent.plantKey
        ) {

            const plant =
                gardenPlants.find(
                    (item) =>
                        item.plantKey ===
                        calendarEvent.plantKey
                );


            if (
                plant
            ) {

                return plant;

            }

        }


        if (
            calendarEvent.plantId
        ) {

            return gardenPlants.find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        calendarEvent.plantId
                    )
            );

        }


        return null;

    }


    /* =========================
       MONTH NAVIGATION
    ========================= */

    function previousMonth() {

        setCurrentMonth(
            new Date(
                year,
                monthIndex - 1,
                1
            )
        );

    }


    function nextMonth() {

        setCurrentMonth(
            new Date(
                year,
                monthIndex + 1,
                1
            )
        );

    }


    function goToToday() {

        const now =
            new Date();


        setCurrentMonth(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )
        );


        setEventDate(
            today
        );

    }


    /* =========================
       CREATE TITLE
    ========================= */

    function createPlantEventTitle(
        type,
        plantKey
    ) {

        const plant =
            gardenPlants.find(
                (item) =>
                    item.plantKey ===
                    plantKey
            );


        if (
            !plant
        ) {

            return "";

        }


        if (
            type ===
            "watering"
        ) {

            return `Water ${plant.name}`;

        }


        if (
            type ===
            "planting"
        ) {

            return `Plant ${plant.name}`;

        }


        if (
            type ===
            "harvest"
        ) {

            return `Harvest ${plant.name}`;

        }


        return "";

    }


    /* =========================
       PLANT CHANGE
    ========================= */

    function handlePlantChange(
        event
    ) {

        const plantKey =
            event.target.value;


        setSelectedPlantKey(
            plantKey
        );


        if (
            plantKey &&
            eventType !==
            "general"
        ) {

            setEventTitle(
                createPlantEventTitle(
                    eventType,
                    plantKey
                )
            );

        }

    }


    /* =========================
       TYPE CHANGE
    ========================= */

    function handleTypeChange(
        event
    ) {

        const newType =
            event.target.value;


        setEventType(
            newType
        );


        if (
            newType ===
            "general"
        ) {

            setEventTitle(
                ""
            );


            return;

        }


        if (
            selectedPlantKey
        ) {

            setEventTitle(
                createPlantEventTitle(
                    newType,
                    selectedPlantKey
                )
            );

        }

    }


    /* =========================
       ADD EVENT
    ========================= */

    function handleSubmit(
        event
    ) {

        event.preventDefault();


        const cleanTitle =
            eventTitle.trim();


        if (
            !eventDate
        ) {

            setMessage(
                "Please choose a date."
            );


            return;

        }


        if (
            !cleanTitle
        ) {

            setMessage(
                "Please enter an event title."
            );


            return;

        }


        const selectedPlant =
            gardenPlants.find(
                (plant) =>
                    plant.plantKey ===
                    selectedPlantKey
            );


        const newEvent = {

            id:
                Date.now(),

            date:
                eventDate,

            type:
                eventType,

            title:
                cleanTitle,

            plantKey:
                selectedPlant?.plantKey ||
                null,

            plantId:
                selectedPlant?.id ||
                null,

            automatic:
                false,

            source:
                "manual"

        };


        onAddCalendarEvent(
            newEvent
        );


        const newEventDate =
            new Date(
                `${eventDate}T12:00:00`
            );


        setCurrentMonth(
            new Date(
                newEventDate.getFullYear(),
                newEventDate.getMonth(),
                1
            )
        );


        setMessage(
            "✓ Garden event added!"
        );


        setEventTitle(
            ""
        );


        setSelectedPlantKey(
            ""
        );

    }


    /* =========================
       EVENT ICON
    ========================= */

    function getEventIcon(
        calendarEvent
    ) {

        if (
            calendarEvent.type ===
            "watering"
        ) {

            return "💧";

        }


        if (
            calendarEvent.type ===
            "harvest"
        ) {

            return "🧺";

        }


        if (
            calendarEvent.type ===
            "planting"
        ) {

            if (
                calendarEvent.plantingAction ===
                "start-indoors"
            ) {

                return "🏠";

            }


            if (
                calendarEvent.plantingAction ===
                "transplant-outside"
            ) {

                return "🪴";

            }


            if (
                calendarEvent.plantingAction ===
                "fall-planting"
            ) {

                return "🍂";

            }


            return "🌱";

        }


        return "📌";

    }


    /* =========================
       SOURCE LABEL
    ========================= */

    function getAutomaticLabel(
        calendarEvent
    ) {

        if (
            calendarEvent.source ===
            "seasonal-planting-planner"
        ) {

            return "Planting Plan";

        }


        if (
            calendarEvent.source ===
            "harvest-scheduler"
        ) {

            return "Harvest Plan";

        }


        if (
            calendarEvent.source ===
            "watering-scheduler"
        ) {

            return "Watering Plan";

        }


        if (
            calendarEvent.automatic
        ) {

            return "Automatic";

        }


        return "";

    }


    /* =========================
       UPCOMING
    ========================= */

    const upcomingEvents =
        [...calendarEvents]
            .filter(
                (calendarEvent) =>
                    calendarEvent.date >=
                    today
            )
            .sort(
                (
                    eventA,
                    eventB
                ) =>
                    eventA.date.localeCompare(
                        eventB.date
                    )
            )
            .slice(
                0,
                12
            );


    const upcomingPlantingEvents =
        [...calendarEvents]
            .filter(
                (calendarEvent) =>
                    calendarEvent.date >=
                    today &&
                    calendarEvent.source ===
                    "seasonal-planting-planner"
            )
            .sort(
                (
                    eventA,
                    eventB
                ) =>
                    eventA.date.localeCompare(
                        eventB.date
                    )
            )
            .slice(
                0,
                4
            );


    return (

        <div className="app-container">


            <header className="app-header">

                <h1>
                    📅 Garden Calendar
                </h1>


                <p>
                    Planting, watering,
                    maintenance, and harvests
                    in one place.
                </p>

            </header>


            {/* =========================
                AUTOMATIC PLANTING PLAN
            ========================= */}

            {
                upcomingPlantingEvents.length > 0 && (

                    <section className="calendar-planting-plan-card">

                        <div className="calendar-planting-plan-heading">

                            <span>
                                🌱
                            </span>


                            <div>

                                <h2>
                                    Local Planting Plan
                                </h2>


                                <p>
                                    Automatically calculated
                                    from your crops and local
                                    frost dates.
                                </p>

                            </div>

                        </div>


                        <div className="calendar-planting-plan-list">

                            {
                                upcomingPlantingEvents.map(
                                    (calendarEvent) => (

                                        <div
                                            key={
                                                calendarEvent.id
                                            }

                                            className="calendar-planting-plan-item"
                                        >

                                            <span>
                                                {
                                                    getEventIcon(
                                                        calendarEvent
                                                    )
                                                }
                                            </span>


                                            <div>

                                                <strong>
                                                    {
                                                        calendarEvent.title
                                                    }
                                                </strong>


                                                <small>
                                                    {
                                                        formatCalendarDate(
                                                            calendarEvent.date
                                                        )
                                                    }
                                                </small>

                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    </section>

                )
            }


            {/* =========================
                ADD EVENT
            ========================= */}

            <section className="calendar-form-card">

                <h2>
                    Add Garden Event
                </h2>


                <form
                    className="calendar-form"

                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="calendar-form-field">

                        <label htmlFor="calendar-date">
                            Date
                        </label>


                        <input
                            id="calendar-date"

                            type="date"

                            value={
                                eventDate
                            }

                            onChange={
                                (event) =>
                                    setEventDate(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="calendar-form-field">

                        <label htmlFor="calendar-type">
                            Event Type
                        </label>


                        <select
                            id="calendar-type"

                            value={
                                eventType
                            }

                            onChange={
                                handleTypeChange
                            }
                        >

                            <option value="watering">
                                💧 Watering
                            </option>

                            <option value="planting">
                                🌱 Planting
                            </option>

                            <option value="harvest">
                                🧺 Harvest
                            </option>

                            <option value="general">
                                📌 General
                            </option>

                        </select>

                    </div>


                    <div className="calendar-form-field">

                        <label htmlFor="calendar-plant">
                            Garden Plant
                        </label>


                        <select
                            id="calendar-plant"

                            value={
                                selectedPlantKey
                            }

                            onChange={
                                handlePlantChange
                            }
                        >

                            <option value="">
                                No plant selected
                            </option>


                            {
                                gardenPlants.map(
                                    (plant) => (

                                        <option
                                            key={
                                                plant.plantKey
                                            }

                                            value={
                                                plant.plantKey
                                            }
                                        >

                                            {
                                                plant.name
                                            }

                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>


                    <div className="calendar-form-field">

                        <label htmlFor="calendar-title">
                            Event
                        </label>


                        <input
                            id="calendar-title"

                            type="text"

                            placeholder="Example: Water tomatoes"

                            value={
                                eventTitle
                            }

                            onChange={
                                (event) =>
                                    setEventTitle(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    {
                        message && (

                            <p className="calendar-message">
                                {
                                    message
                                }
                            </p>

                        )
                    }


                    <button
                        type="submit"

                        className="calendar-add-button"
                    >

                        + Add to Calendar

                    </button>

                </form>

            </section>


            {/* =========================
                MONTH CALENDAR
            ========================= */}

            <section className="calendar-card">

                <div className="calendar-header">

                    <button
                        type="button"

                        onClick={
                            previousMonth
                        }

                        aria-label="Previous month"
                    >

                        ‹

                    </button>


                    <div>

                        <h2>
                            {
                                monthName
                            }
                        </h2>


                        <button
                            type="button"

                            className="calendar-today-button"

                            onClick={
                                goToToday
                            }
                        >

                            Today

                        </button>

                    </div>


                    <button
                        type="button"

                        onClick={
                            nextMonth
                        }

                        aria-label="Next month"
                    >

                        ›

                    </button>

                </div>


                <div className="calendar-weekdays">

                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>

                </div>


                <div className="calendar-grid">

                    {
                        calendarDays.map(
                            (calendarDay) => {

                                if (
                                    calendarDay.type ===
                                    "blank"
                                ) {

                                    return (

                                        <div
                                            key={
                                                calendarDay.key
                                            }

                                            className="calendar-day blank"
                                        />

                                    );

                                }


                                const isToday =
                                    calendarDay.dateString ===
                                    today;


                                return (

                                    <div
                                        key={
                                            calendarDay.key
                                        }

                                        className={
                                            isToday
                                                ? "calendar-day today"
                                                : "calendar-day"
                                        }
                                    >

                                        <span className="calendar-day-number">
                                            {
                                                calendarDay.day
                                            }
                                        </span>


                                        <div className="calendar-day-events">

                                            {
                                                calendarDay.events
                                                    .slice(
                                                        0,
                                                        2
                                                    )
                                                    .map(
                                                        (calendarEvent) => (

                                                            <span
                                                                key={
                                                                    calendarEvent.id
                                                                }

                                                                className={
                                                                    `calendar-event-dot ${calendarEvent.type}`
                                                                }

                                                                title={
                                                                    calendarEvent.title
                                                                }
                                                            >

                                                                {
                                                                    getEventIcon(
                                                                        calendarEvent
                                                                    )
                                                                }

                                                            </span>

                                                        )
                                                    )
                                            }


                                            {
                                                calendarDay.events.length >
                                                2 && (

                                                    <small>

                                                        +

                                                        {
                                                            calendarDay.events.length -
                                                            2
                                                        }

                                                    </small>

                                                )
                                            }

                                        </div>

                                    </div>

                                );

                            }
                        )
                    }

                </div>

            </section>


            {/* =========================
                UPCOMING
            ========================= */}

            <section className="upcoming-events">

                <div className="upcoming-events-header">

                    <h2>
                        Upcoming
                    </h2>


                    <span>
                        {
                            upcomingEvents.length
                        } events
                    </span>

                </div>


                {
                    upcomingEvents.length ===
                    0
                        ? (

                            <div className="calendar-empty">

                                <span>
                                    📅
                                </span>


                                <p>
                                    No upcoming garden
                                    events yet.
                                </p>

                            </div>

                        )
                        : (

                            upcomingEvents.map(
                                (calendarEvent) => {

                                    const plant =
                                        findGardenPlant(
                                            calendarEvent
                                        );


                                    const wateringPlantKey =
                                        calendarEvent.plantKey ||
                                        plant?.plantKey;


                                    const automaticLabel =
                                        getAutomaticLabel(
                                            calendarEvent
                                        );


                                    const isAutomaticWatering =
                                        calendarEvent.source ===
                                        "watering-scheduler" &&
                                        wateringPlantKey;


                                    const isAutomaticPlanningEvent =
                                        calendarEvent.source ===
                                            "seasonal-planting-planner" ||
                                        calendarEvent.source ===
                                            "harvest-scheduler";


                                    return (

                                        <article
                                            className="upcoming-event-card"

                                            key={
                                                calendarEvent.id
                                            }
                                        >

                                            <span className="upcoming-event-icon">

                                                {
                                                    getEventIcon(
                                                        calendarEvent
                                                    )
                                                }

                                            </span>


                                            <div className="upcoming-event-info">

                                                <strong>
                                                    {
                                                        calendarEvent.title
                                                    }
                                                </strong>


                                                <small>

                                                    {
                                                        formatCalendarDate(
                                                            calendarEvent.date
                                                        )
                                                    }


                                                    {
                                                        plant
                                                            ? ` • ${plant.name}`
                                                            : ""
                                                    }


                                                    {
                                                        automaticLabel
                                                            ? ` • ${automaticLabel}`
                                                            : ""
                                                    }

                                                </small>

                                            </div>


                                            {
                                                isAutomaticWatering
                                                    ? (

                                                        <button
                                                            type="button"

                                                            className="calendar-watered-button"

                                                            aria-label={`Mark ${calendarEvent.title} complete`}

                                                            onClick={() =>
                                                                onMarkPlantWatered(
                                                                    wateringPlantKey
                                                                )
                                                            }
                                                        >

                                                            ✓

                                                        </button>

                                                    )
                                                    : isAutomaticPlanningEvent
                                                        ? (

                                                            <span
                                                                className="calendar-auto-badge"

                                                                title="Automatically generated from your garden plan"
                                                            >

                                                                Auto

                                                            </span>

                                                        )
                                                        : (

                                                            <button
                                                                type="button"

                                                                aria-label={`Delete ${calendarEvent.title}`}

                                                                onClick={() =>
                                                                    onDeleteCalendarEvent(
                                                                        calendarEvent.id
                                                                    )
                                                                }
                                                            >

                                                                ✕

                                                            </button>

                                                        )
                                            }

                                        </article>

                                    );

                                }
                            )

                        )
                }

            </section>


            <BottomNav />

        </div>

    );

}


export default Calendar;