import React from "react";
import ReactDOM from "react-dom";
import {getCookie} from "./utils";

class PasswordReset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            token: "",
            password: "",
            passwordConfirmation: ""
        };
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
                        alert(data[1]);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    renderField = (label, placeholder, type, stateKey) => (
        <div className="d-flex flex-column">
            <label htmlFor={stateKey}>{label}</label>
            <input
                className="p-2"
                id={stateKey}
                onChange={e => this.setState({[stateKey]: e.target.value})}
                placeholder={placeholder}
                type={type}
                value={this.state[stateKey]}
            />
        </div>
    );

    render() {
        return (
            <div
                className="d-flex justify-content-center"
                style={{paddingTop: "20vh"}}
            >
                <div className="card">
                    <div className="card-header">Reset Password</div>
                    <div className="card-body">
                        {this.renderField("Username", "Enter username", "text", "username")}
                        {this.renderField("Password", "Enter password", "password", "password")}
                        {this.renderField("Confirm Password", "Confirm password", "password", "passwordConfirmation")}
                        {/* TODO hide me */}
                        {this.renderField("Token", "enterToken", "text", "token")}
                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                className="btn orange-btn mt-3"
                                onClick={this.resetPassword}
                                type="button"
                            >
                                Reset
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
