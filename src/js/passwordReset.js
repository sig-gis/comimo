import React from "react";
import ReactDOM from "react-dom";

import {getCookie, getLanguage} from "./utils";

class PasswordReset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            token: "",
            password: "",
            passwordConfirmation: "",
            localeText: {}
        };
    }

    componentDidMount() {
        fetch(
            `/static/locale/${getLanguage(["en", "es"])}.json`,
            {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
        )
            .then(response => (response.ok ? response.json() : Promise.reject(response)))
            .then(data => this.setState({localeText: data.users}))
            .catch(error => console.log(error));
    }

    resetPassword = () => {
        const {username, token, password, passwordConfirmation} = this.state;
        if (password !== passwordConfirmation) {
            alert("Your passwords must match.");
        } else {
            fetch("/password-reset/",
                  {
                      method: "POST",
                      headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                          "X-CSRFToken": getCookie("csrftoken")
                      },
                      body: JSON.stringify({
                          username,
                          password,
                          token
                      })
                  })
                .then(response => Promise.all([response.ok, response.text()]))
                .then(data => {
                    if (data[0] && data[1] === "") {
                        window.location = "/";
                    } else {
                        alert(this.state.localeText[data[1]]);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    renderField = (label, type, stateKey) => (
        <div className="d-flex flex-column">
            <label htmlFor={stateKey}>{label}</label>
            <input
                className="p-2"
                id={stateKey}
                onChange={e => this.setState({[stateKey]: e.target.value})}
                placeholder={`Enter ${(label || "").toLowerCase()}`}
                type={type}
                value={this.state[stateKey]}
            />
        </div>
    );

    render() {
        const {localeText} = this.state;
        return (
            <div
                className="d-flex justify-content-center"
                style={{paddingTop: "20vh"}}
            >
                <div className="card">
                    <div className="card-header">{localeText.resetTitle}</div>
                    <div className="card-body">
                        {this.renderField(localeText.username, "text", "username")}
                        {this.renderField(localeText.password, "password", "password")}
                        {this.renderField(localeText.confirm, "password", "passwordConfirmation")}
                        {/* TODO hide me */}
                        {this.renderField("Token", "enterToken", "text", "token")}
                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                className="btn orange-btn mt-3"
                                onClick={this.resetPassword}
                                type="button"
                            >
                                {localeText.resetTitle}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export function pageInit(args) {
    ReactDOM.render(<PasswordReset/>, document.getElementById("main-container"));
}
