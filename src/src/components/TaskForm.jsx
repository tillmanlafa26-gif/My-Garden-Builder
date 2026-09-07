import {
    useState
} from "react";


function TaskForm({
    onAddTask
}) {

    const [
        taskName,
        setTaskName
    ] = useState("");


    const [
        taskPoints,
        setTaskPoints
    ] = useState(3);


    function handleSubmit(event) {

        event.preventDefault();


        const cleanName =
            taskName.trim();


        if (!cleanName) {

            return;

        }


        const newTask = {

            id:
                Date.now(),

            name:
                cleanName,

            description:
                "Custom garden task",

            icon:
                "🌱",

            points:
                Number(taskPoints),

            completed:
                false

        };


        onAddTask(
            newTask
        );


        setTaskName("");

        setTaskPoints(3);

    }


    return (
        <section className="add-task-section">

            <h2>
                Add Garden Task
            </h2>


            <form
                id="task-form"
                onSubmit={handleSubmit}
            >

                <input
                    id="task-input"
                    type="text"
                    placeholder="Example: Plant lettuce"
                    value={taskName}
                    onChange={
                        (event) =>
                            setTaskName(
                                event.target.value
                            )
                    }
                />


                <select
                    id="task-points"
                    value={taskPoints}
                    onChange={
                        (event) =>
                            setTaskPoints(
                                event.target.value
                            )
                    }
                >

                    <option value="1">
                        1 point
                    </option>

                    <option value="2">
                        2 points
                    </option>

                    <option value="3">
                        3 points
                    </option>

                    <option value="5">
                        5 points
                    </option>

                </select>


                <button type="submit">
                    Add Task
                </button>

            </form>

        </section>
    );

}


export default TaskForm;