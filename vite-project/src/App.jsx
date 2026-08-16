import {
    useEffect,
    useState
} from "react";


import Header
    from "./components/Header";

import WeatherCard
    from "./components/WeatherCard";

import TaskForm
    from "./components/TaskForm";

import TaskList
    from "./components/TaskList";

import SustainabilityScore
    from "./components/SustainabilityScore";


import {
    defaultTasks
} from "./data/tasks";


function App() {

    /* =========================
       LOAD TASKS
    ========================= */

    const [
        tasks,
        setTasks
    ] = useState(() => {

        try {

            const savedTasks =
                localStorage.getItem(
                    "gardenTasks"
                );


            if (savedTasks) {

                const parsedTasks =
                    JSON.parse(
                        savedTasks
                    );


                if (
                    Array.isArray(
                        parsedTasks
                    )
                ) {

                    return parsedTasks;

                }

            }

        } catch (error) {

            console.error(
                "Unable to load garden tasks:",
                error
            );

        }


        return defaultTasks;

    });


    /* =========================
       SAVE TASKS
    ========================= */

    useEffect(() => {

        localStorage.setItem(
            "gardenTasks",
            JSON.stringify(tasks)
        );

    }, [tasks]);


    /* =========================
       ADD TASK
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


    /* =========================
       TOGGLE TASK
    ========================= */

    function toggleTask(
        taskId
    ) {

        setTasks(
            (currentTasks) =>

                currentTasks.map(
                    (task) => {

                        if (
                            task.id === taskId
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
       SCORE
    ========================= */

    const completedPoints =
        tasks.reduce(
            (total, task) => {

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
            72 + completedPoints
        );


    return (
        <div className="app-container">

            <Header />


            <WeatherCard />


            <TaskForm
                onAddTask={
                    addTask
                }
            />


            <TaskList
                tasks={
                    tasks
                }
                onToggle={
                    toggleTask
                }
            />


            <SustainabilityScore
                score={
                    sustainabilityScore
                }
            />

        </div>
    );

}


export default App;