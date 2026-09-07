import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import { WeatherProvider } from "./context/WeatherContext.jsx";
import { registerServiceWorker } from "./utils/registerServiceWorker.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AppErrorBoundary>
            <BrowserRouter>
                <WeatherProvider>
                    <App />
                </WeatherProvider>
            </BrowserRouter>
        </AppErrorBoundary>
    </StrictMode>
);

registerServiceWorker();
