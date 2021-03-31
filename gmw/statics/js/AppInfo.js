class AppInfo extends React.Component {
    render() {
        return (
            <div
                className={["info-modal ", this.props.ishidden ? "see-through" : ""].join(" ")}
                onClick={this.props.onOuterClick}
            >
                <div className="inner-container" onClick={e => e.stopPropagation()}>
                    <div className="user-section" style={{float: "right"}}>
                        {USER_ADM && (
                            <a style={{marginRight: "1rem"}} href="/download">
                                Download Validated data
                            </a>
                        )}
                        <a href="/accounts/logout">Log out</a>
                    </div>
                    <h3 className="heading3"> APP INFO </h3>
                    <label style={{margin: "1rem 0"}}>Condiciones De Uso</label>
                    <p>
                        Bienvenidos a la Plataforma Colombian Mining Monitoring (COMIMO). Todos los
                        servicios disponibles a través de nuestro sitio web son operados por la
                        Universidad del Rosario, y ésta es su única propietaria. Al acceder a COMIMO
                        y usar sus servicios, acepta cumplir con nuestros Términos de Uso y evitar
                        cualquier utilizations indebida de la plataforma y su contenido.
                    </p>
                    <a
                        href="https://docs.google.com/document/d/1xrLgL_Ai8lR8E4ZsF0AnzjlZESMVwKuUjOgSBJE3bqo"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{margin: ".5rem 0"}}
                    >
                        Hacer clic aquí del condiciones de uso
                    </a>
                    <br />
                    <label style={{margin: "1rem 0"}}>Terms of Use</label>
                    <p>
                        Welcome to Colombian Mining Monitoring. All services available through our
                        website are owned and operated by Universidad del Rosario. By accessing and
                        using the Colombian Mining Monitoring platform, you agree to comply with our
                        Terms of Service and avoid any misuse of its contents.
                    </p>
                    <a
                        href="https://docs.google.com/document/d/1kJrlXUlyDRVeVEb1WcPOWBNnzJ1s-9spLTHCxnk8o5E"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{margin: ".5rem 0"}}
                    >
                        Click here for the terms of use
                    </a>
                </div>
            </div>
        );
    }
}
