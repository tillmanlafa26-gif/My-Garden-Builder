import TaskCard
    from "./TaskCard";


function TaskList({
    tasks,
    onToggle
}) {

    return (
        <section className="tasks-section">

            <h2>
                Today's Garden Tasks
            </h2>


            {tasks.map(
                (task) => (

                    <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                    />

                )
            )}

        </section>
    );

}


export default TaskList;