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
                    How My Garden Builder handles garden and account data.
                </p>
            </header>

            <section className="legal-card">
                <h2>Local garden data</h2>
                <p>
                    My Garden Builder keeps a local browser copy of your garden profile, crops, tracked plants, watering records, calendar events, journal entries, supplies, theme preferences, and onboarding status so the app can remain responsive and continue working when cloud sync is unavailable.
                </p>
                <p>
                    Clearing browser storage or using Reset to Original State removes this device's local copy. If you are signed in, that reset does not delete your cloud garden.
                </p>
            </section>

            <section className="legal-card">
                <h2>Optional account and cloud sync</h2>
                <p>
                    When Supabase cloud sync is configured, you can create an account or sign in to synchronize garden records across devices. Account authentication and synchronized garden records are handled through Supabase.
                </p>
                <p>
                    Cloud sync is optional. If it is not configured, you are signed out, or a cloud request fails, My Garden Builder continues using the local browser copy.
                </p>
            </section>

            <section className="legal-card">
                <h2>Garden photos</h2>
                <p>
                    Camera images can be used locally by the garden designer. Raw image data is excluded from normal garden snapshot synchronization. Private cloud photo storage is prepared separately so images do not need to be embedded as large base64 values inside garden records.
                </p>
            </section>

            <section className="legal-card">
                <h2>Location</h2>
                <p>
                    Location access is optional. If you enable it, your browser provides coordinates that are used to request weather and historical climate information for your area. Your saved garden may keep those coordinates so the app can reuse your growing conditions.
                </p>
            </section>

            <section className="legal-card">
                <h2>Third-party garden data</h2>
                <p>
                    Weather and historical climate requests use Open-Meteo. Plant-library searches use Perenual. AI garden-assistant or garden-photo analysis requests may use the server-side AI integration enabled for this deployment. Those services receive only the information required to answer the request, and their own privacy practices apply.
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
                    You can deny location access, use manual growing information, remain signed out and local-only, sign out of cloud sync, and reset the local app data from Settings.
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
