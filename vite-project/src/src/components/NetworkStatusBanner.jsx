import {
    useEffect,
    useState
} from "react";

import {
    STORAGE_WARNING_EVENT
} from "../utils/safeStorage";

import Icon from "./Icon";

function NetworkStatusBanner() {
    const [isOnline, setIsOnline] = useState(
        () => typeof navigator === "undefined" ? true : navigator.onLine
    );

    const [reconnected, setReconnected] = useState(false);
    const [storageMessage, setStorageMessage] = useState("");

    useEffect(() => {
        let reconnectTimer = null;
        let storageTimer = null;

        function handleOffline() {
            setIsOnline(false);
            setReconnected(false);
        }

        function handleOnline() {
            setIsOnline(true);
            setReconnected(true);

            window.clearTimeout(reconnectTimer);
            reconnectTimer = window.setTimeout(
                () => setReconnected(false),
                3500
            );
        }

        function handleStorageWarning(event) {
            setStorageMessage(
                event.detail?.message ||
                "A browser storage issue occurred."
            );

            window.clearTimeout(storageTimer);
            storageTimer = window.setTimeout(
                () => setStorageMessage(""),
                7000
            );
        }

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        window.addEventListener(STORAGE_WARNING_EVENT, handleStorageWarning);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener(STORAGE_WARNING_EVENT, handleStorageWarning);
            window.clearTimeout(reconnectTimer);
            window.clearTimeout(storageTimer);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="network-status-banner offline" role="status" aria-live="polite">
                <Icon name="wifiOff" size={16} />
                <span>
                    You’re offline. Saved garden tools still work; live weather and new plant searches may use cached data.
                </span>
            </div>
        );
    }

    if (storageMessage) {
        return (
            <div className="network-status-banner warning" role="status" aria-live="polite">
                <Icon name="warning" size={16} />
                <span>{storageMessage}</span>
            </div>
        );
    }

    if (reconnected) {
        return (
            <div className="network-status-banner online" role="status" aria-live="polite">
                <Icon name="check" size={16} />
                <span>Back online. Live garden data can refresh again.</span>
            </div>
        );
    }

    return null;
}

export default NetworkStatusBanner;
