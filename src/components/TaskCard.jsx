function TaskCard({
    task,
    onToggle
}) {

    return (
        <div
            className={
                task.completed
                    ? "task-card completed"
                    : "task-card"
            }
            onClick={() =>
                onToggle(task.id)
            }
        >

            <span className="task-icon">
                {task.icon}
            </span>


            <div className="task-info">

                <h3>
                    {task.name}
                </h3>

                <p>
                    {task.description}
                </p>

                <small>
                    +{task.points} points
                </small>

            </div>


            <span className="task-check">

                {
                    task.completed
                        ? "✓"
                        : "○"
                }

            </span>

        </div>
    );

}


export default TaskCard;