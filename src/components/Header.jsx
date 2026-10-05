import Icon from "./Icon";


function Header() {

    return (
        <header className="app-header app-brand-header leafy-brand-header leafy-brand-header-v2">

            <div
                className="leafy-brand-vine leafy-brand-vine-left"
                aria-hidden="true"
            />

            <div
                className="leafy-brand-vine leafy-brand-vine-right"
                aria-hidden="true"
            />


            <div className="app-brand-mark" aria-hidden="true">

                <Icon
                    name="leaf"
                    size={29}
                    strokeWidth={1.85}
                />

            </div>


            <div className="app-brand-copy">

                <h1>
                    My Garden Builder
                </h1>


                <span className="app-brand-kicker">
                    PLAN • PLANT • GROW A GREENER TOMORROW
                </span>


                <p className="app-brand-script">
                    Your dream garden starts here.
                </p>

            </div>


            <div
                className="app-brand-leaf-chip"
                aria-label="Garden profile"
                title="Garden profile"
            >
                <Icon
                    name="sprout"
                    size={21}
                    strokeWidth={1.9}
                />
            </div>

        </header>
    );

}


export default Header;
