import Icon from "./Icon";


function Header() {

    return (
        <header className="app-header app-brand-header">
            <div className="app-brand-mark" aria-hidden="true">
                <Icon
                    name="sprout"
                    size={24}
                    strokeWidth={1.9}
                />
            </div>

            <div>
                <h1>
                    My Garden Builder
                </h1>

                <p>
                    Design smarter. Build sustainably.
                    Grow with confidence.
                </p>
            </div>
        </header>
    );
}


export default Header;
