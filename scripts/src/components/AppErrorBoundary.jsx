import React from "react";

import Icon from "./Icon";

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, info) {
        console.error("My Garden Builder encountered an unexpected UI error:", error, info);
    }

    reloadApp = () => {
        window.location.reload();
    };

    goHome = () => {
        window.location.assign("/");
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <main className="app-error-boundary" role="alert">
                <div className="app-error-boundary-card">
                    <span className="app-error-boundary-icon">
                        <Icon name="warning" size={28} />
                    </span>

                    <h1>My Garden Builder hit a problem</h1>

                    <p>
                        Your saved garden data has not been intentionally cleared. Reload the app first. If the problem continues, return to Home and try the action again.
                    </p>

                    <div className="app-error-boundary-actions">
                        <button type="button" onClick={this.reloadApp}>
                            Reload App
                        </button>

                        <button type="button" className="secondary" onClick={this.goHome}>
                            Go Home
                        </button>
                    </div>

                    {import.meta.env.DEV && this.state.error?.message && (
                        <details className="app-error-boundary-details">
                            <summary>Developer details</summary>
                            <code>{this.state.error.message}</code>
                        </details>
                    )}
                </div>
            </main>
        );
    }
}

export default AppErrorBoundary;
