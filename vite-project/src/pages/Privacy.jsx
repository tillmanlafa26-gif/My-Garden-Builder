import {
    Link
} from "react-router";

import BottomNav from "../components/BottomNav";
import Icon from "../components/Icon";

function Privacy() {
    return (
        <div className="app-container legal-page">
            <header className="app-header legal-page-header">
                <span className="legal-page-icon">
                    <Icon
                        name="shield"
                        size={26}
                    />
                </span>

                <h1>Privacy</h1>

                <p>
                    How the current version of My Garden Builder handles your garden data.
                </p>
            </header>

            <section className="legal-card">
                <h2>Data stored on your device</h2>
                <p>
                    Garden profiles, crops, tracked plants, watering records, calendar events, journal entries, supplies, theme preferences, and onboarding status are currently stored in your browser on this device.
                </p>
                <p>
                    My Garden Builder does not currently include user accounts or cloud synchronization. Clearing browser storage or using the Reset option in Settings can remove this information.
                </p>
            </section>

            <section className="legal-card">
                <h2>Location</h2>
                <p>
                    Location access is optional. If you enable it, your browser provides coordinates that are used to request weather and historical climate information for your area. Your saved garden may keep those coordinates locally so the app can reuse your growing conditions.
                </p>
            </section>

            <section className="legal-card">
                <h2>Third-party garden data</h2>
                <p>
                    Weather and historical climate requests use Open-Meteo. Plant-library searches use Perenual. Those services may receive the information required to answer a request, such as coordinates for weather or a plant-search term. Their own privacy practices apply to their services.
                </p>
            </section>

            <section className="legal-card">
                <h2>Tracking and advertising</h2>
                <p>
                    The current app source does not include advertising, analytics tracking, or a system that sells personal garden data. If those capabilities are added later, this notice should be updated before release.
                </p>
            </section>

            <section className="legal-card">
                <h2>Your controls</h2>
                <p>
                    You can deny location access, continue using manual growing information, and use Settings → Reset to Original State to remove app data stored by My Garden Builder in the current browser.
                </p>
            </section>

            <div className="legal-page-actions">
                <Link
                    to="/terms"
                    className="legal-link-button"
                >
                    Read Terms
                </Link>

                <Link
                    to="/"
                    className="legal-link-button secondary"
                >
                    Return Home
                </Link>
            </div>

            <BottomNav />
        </div>
    );
}

export default Privacy;
