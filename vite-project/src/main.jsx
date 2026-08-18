import {
    StrictMode
} from "react";


import {
    createRoot
} from "react-dom/client";


import {
    BrowserRouter
} from "react-router";


import App
    from "./App.jsx";


import ThemeToggle
    from "./components/ThemeToggle.jsx";


import {
    WeatherProvider
} from "./context/WeatherContext.jsx";


import "./index.css";


createRoot(
    document.getElementById(
        "root"
    )
).render(

    <StrictMode>

        <BrowserRouter>

            <WeatherProvider>

                <App />

                <ThemeToggle />

            </WeatherProvider>

        </BrowserRouter>

    </StrictMode>

);