import React from "react";

import {MainContext} from "./context";

export default class AppInfo extends React.Component {
    render() {
        const {isHidden, onOuterClick} = this.props;
        const {isAdmin} = this.context;
        return (
            <div
                className={"info-modal " + (isHidden ? "see-through" : "")}
                onClick={onOuterClick}
            >
                <div className="inner-container" onClick={e => e.stopPropagation()}>
                    <div className="user-section" style={{float: "right"}}>
                        {isAdmin && (
                            <a href="/download" style={{marginRight: "1rem"}}>
                                Download Validated data
                            </a>
                        )}
                        <a href="/accounts/logout">Log out</a>
                    </div>
                    <h2 className="heading3"> APP INFO </h2>
                    <h3>Condiciones De Uso</h3>
                    <p>
                        Bienvenidos a la Plataforma Colombian Mining Monitoring (COMIMO). Todos los
                        servicios disponibles a través de nuestro sitio web son operados por la
                        Universidad del Rosario, y ésta es su única propietaria. Al acceder a COMIMO
                        y usar sus servicios, acepta cumplir con nuestros Términos de Uso y evitar
                        cualquier utilizations indebida de la plataforma y su contenido.
                    </p>
                    <a
                        href="https://docs.google.com/document/d/1xrLgL_Ai8lR8E4ZsF0AnzjlZESMVwKuUjOgSBJE3bqo"
                        rel="noopener noreferrer"
                        style={{margin: ".5rem 0"}}
                        target="_blank"
                    >
                        Hacer clic aquí del condiciones de uso
                    </a>
                    <br/>
                    <h3 style={{margin: "1rem 0"}}>Terms of Use</h3>
                    <p>
                        Welcome to Colombian Mining Monitoring. All services available through our
                        website are owned and operated by Universidad del Rosario. By accessing and
                        using the Colombian Mining Monitoring platform, you agree to comply with our
                        Terms of Service and avoid any misuse of its contents.
                    </p>
                    <a
                        href="https://docs.google.com/document/d/1kJrlXUlyDRVeVEb1WcPOWBNnzJ1s-9spLTHCxnk8o5E"
                        rel="noopener noreferrer"
                        style={{margin: ".5rem 0"}}
                        target="_blank"
                    >
                        Click here for the terms of use
                    </a>
                </div>
            </div>
        );
    }
}
AppInfo.contextType = MainContext;
