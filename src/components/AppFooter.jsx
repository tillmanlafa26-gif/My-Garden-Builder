function AppFooter() {
    const currentYear =
        new Date().getFullYear();


    return (
        <footer className="app-footer">

            <div
                className="app-footer-logo"
                aria-label="N logo"
            >
                N.
            </div>


            <div className="app-footer-copy">

                <strong>
                    My Garden Builder
                </strong>


                <small>
                    © {currentYear} My Garden Builder.
                    All rights reserved.
                </small>

            </div>

        </footer>
    );
}


export default AppFooter;
