class SideIcon extends React.Component {
    render() {
        const {parentClass, clickHandler, tooltip, icon, subtext} = this.props;
        return (
            <button
                className={"sidebar-icon " + parentClass}
                onClick={clickHandler}
                title={tooltip}
                type="button"
            >
                <div style={{padding: "6px"}}><SvgIcon icon={icon} size="38px"/></div>
                {subtext && <span className="advanced-text mb-3">{subtext}</span>}
            </button>
        );
    }
}
