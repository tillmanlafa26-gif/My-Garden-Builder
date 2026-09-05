import {
    Link
} from "react-router";

import BottomNav from "../components/BottomNav";
import Icon from "../components/Icon";

function Terms() {
    return (
        <div className="app-container legal-page">
            <header className="app-header legal-page-header">
                <span className="legal-page-icon">
                    <Icon
                        name="document"
                        size={26}
                    />
                </span>

                <h1>Terms & Garden Disclaimer</h1>

                <p>
                    Practical limits for planning, building, and growing with My Garden Builder.
                </p>
            </header>

            <section className="legal-card">
                <h2>Planning estimates</h2>
                <p>
                    Garden layouts, spacing, materials, planting dates, watering schedules, frost dates, maturity dates, and harvest windows are planning estimates. Real results can vary with cultivar, microclimate, soil, pests, weather, construction methods, and plant health.
                </p>
            </section>

            <section className="legal-card">
                <h2>Building responsibility</h2>
                <p>
                    Before digging, building beds, installing irrigation, attaching structures, or changing a property, confirm utility locations, property rules, local requirements, manufacturer instructions, and any landlord or homeowners-association restrictions that apply to you.
                </p>
            </section>

            <section className="legal-card">
                <h2>Third-party information</h2>
                <p>
                    Some plant, weather, and climate information comes from third-party services. Availability and accuracy can change, and My Garden Builder cannot guarantee uninterrupted access to those services.
                </p>
            </section>

            <section className="legal-card">
                <h2>Local browser storage</h2>
                <p>
                    The current version stores garden information locally in your browser. You are responsible for keeping any separate records you cannot afford to lose. Cloud backup and account synchronization are not yet part of this version.
                </p>
            </section>

            <section className="legal-card">
                <h2>Use of recommendations</h2>
                <p>
                    Use the app as a planning and garden-management aid rather than as a guarantee of crop success, structural suitability, or a substitute for local professional guidance when a project requires it.
                </p>
            </section>

            <div className="legal-page-actions">
                <Link
                    to="/privacy"
                    className="legal-link-button"
                >
                    Read Privacy
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

export default Terms;
