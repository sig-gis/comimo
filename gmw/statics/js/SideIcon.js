class SideIcon extends React.Component {
    render() {
        const {parentClass, clickHandler, tooltip, glyphIcon, subtext} = this.props;
        return (
            <button
                className={"sidebar-icon " + parentClass}
                onClick={clickHandler}
                title={tooltip}
                type="button"
            >
                <div className="center">
                    <span className={"glyphicon " + glyphIcon}/>
                    {subtext && <span className="advanced-text">{subtext}</span>}
                </div>
            </button>
        );
    }
}
