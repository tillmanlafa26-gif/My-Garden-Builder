import Icon from "./Icon";
export default function Header() {
    return <header className="app-header app-brand-header leafy-brand-header leafy-brand-header-v2">
        <span className="reference-brand-leaves" aria-hidden="true"><Icon name="leaf" size={38}/><Icon name="leaf" size={24}/></span>
        <div className="app-brand-copy"><h1>My Garden Builder</h1><span className="app-brand-kicker">PLAN • PLANT • GROW A GREENER TOMORROW</span></div>
    </header>;
}
