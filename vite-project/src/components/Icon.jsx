const ICONS = {
    home: (
        <>
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10.5V20h13v-9.5" />
            <path d="M9.5 20v-5.5h5V20" />
        </>
    ),
    garden: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M8 4v16M16 4v16M3 12h18" />
            <path d="M12 9c0-2 1.4-3.4 3.5-3.5C15.4 7.6 14 9 12 9Z" />
            <path d="M12 9c0-1.8-1.2-3-3-3.1.1 1.8 1.2 3 3 3.1Z" />
        </>
    ),
    leaf: (
        <>
            <path d="M20 4C12.5 4 6 7 5 13c-.7 4.1 2.6 7 6.4 6.2C17.6 17.9 20 11 20 4Z" />
            <path d="M5 20c2-5 5.5-8.5 11-11" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M7 3v4M17 3v4M3 10h18" />
            <path d="M8 14h2M14 14h2M8 18h2M14 18h2" />
        </>
    ),
    journal: (
        <>
            <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5Z" />
            <path d="M5 4.5v17M9 7h7M9 11h7M9 15h4" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
        </>
    ),
    close: (
        <>
            <path d="M6 6l12 12M18 6 6 18" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
    ),
    moon: (
        <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 9 9 0 1 0 20.5 15.5Z" />
    ),
    menu: (
        <>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </>
    ),
    toolbox: (
        <>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M8 8V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V8M3 13h18M10 12v2h4v-2" />
        </>
    ),
    sprout: (
        <>
            <path d="M12 21v-9" />
            <path d="M12 12c0-4.2-2.8-6.7-7-7 .2 4.1 2.8 6.7 7 7Z" />
            <path d="M12 14c0-4.2 2.8-6.7 7-7-.2 4.1-2.8 6.7-7 7Z" />
        </>
    ),
    book: (
        <>
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
            <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
        </>
    ),
    database: (
        <>
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
            <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </>
    ),
    rotate: (
        <>
            <path d="M4 10a8 8 0 1 1 2.3 7" />
            <path d="M4 4v6h6" />
        </>
    ),
    warning: (
        <>
            <path d="M10.3 4.1 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
    ),
    chevronRight: <path d="m9 18 6-6-6-6" />,
    mapPin: (
        <>
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
    thermometer: (
        <>
            <path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z" />
            <path d="M12 8v8" />
        </>
    ),
    cloudSun: (
        <>
            <path d="M8.5 15.5H6.8a3.8 3.8 0 1 1 .6-7.55A5.5 5.5 0 0 1 18 9.6a3 3 0 1 1 .2 5.9H8.5Z" />
            <path d="M15 3v2M19.2 4.8l-1.4 1.4M10.8 4.8l1.4 1.4" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    circle: <circle cx="12" cy="12" r="8" />,
    arrowRight: <path d="M5 12h14M14 7l5 5-5 5" />,
};

function Icon({
    name,
    size = 20,
    strokeWidth = 1.8,
    className = ""
}) {
    const icon = ICONS[name];

    if (!icon) {
        return null;
    }

    return (
        <svg
            className={`ui-icon ${className}`.trim()}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {icon}
        </svg>
    );
}

export default Icon;
