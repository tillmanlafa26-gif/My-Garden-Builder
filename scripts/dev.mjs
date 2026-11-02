import {
    spawn
} from "node:child_process";

import {
    fileURLToPath
} from "node:url";

import path
    from "node:path";

const projectRoot =
    path.resolve(
        path.dirname(
            fileURLToPath(
                import.meta.url
            )
        ),
        ".."
    );

const node =
    process.execPath;

const children =
    new Set();

function start(
    args,
    label
) {
    const child =
        spawn(
            node,
            args,
            {
                cwd:
                    projectRoot,
                env:
                    process.env,
                stdio:
                    "inherit"
            }
        );

    children.add(
        child
    );

    child.on(
        "exit",
        (
            code,
            signal
        ) => {
            children.delete(
                child
            );

            if (
                signal
            ) {
                return;
            }

            if (
                code !==
                0
            ) {
                console.error(
                    `${label} exited with code ${code}.`
                );

                shutdown(
                    code ||
                    1
                );
            }
        }
    );

    return child;
}

let shuttingDown =
    false;

function shutdown(
    exitCode =
        0
) {
    if (
        shuttingDown
    ) {
        return;
    }

    shuttingDown =
        true;

    for (
        const child
        of children
    ) {
        if (
            !child.killed
        ) {
            child.kill(
                "SIGTERM"
            );
        }
    }

    setTimeout(
        () =>
            process.exit(
                exitCode
            ),
        150
    );
}

process.on(
    "SIGINT",
    () =>
        shutdown(
            0
        )
);

process.on(
    "SIGTERM",
    () =>
        shutdown(
            0
        )
);

start(
    [
        "backend/devServer.js"
    ],
    "Backend"
);

start(
    [
        "node_modules/vite/bin/vite.js"
    ],
    "Vite"
);
