class SideIcons extends React.Component {
    render() {
        const {parentClass, clickHandler, tooltip, glyphicon} = this.props;
        return (
            <button
                className={"sidebar-icon " + parentClass}
                onClick={clickHandler}
                title={tooltip}
                type="button"
            >
                <span className={"glyphicon " + glyphicon}/>
            </button>
        );
    }
}
