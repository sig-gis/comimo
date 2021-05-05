import React from "react";
import ReactDOM from "react-dom";
import {getCookie} from "./utils";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        };
    }

    requestLogin = () => {
        fetch("/login/",
              {
                  method: "POST",
                  headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                      "X-CSRFToken": getCookie("csrftoken")
                  },
                  body: JSON.stringify({
                      username: this.state.username,
                      password: this.state.password
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
                    <div className="card-header">Sign into your account</div>
                    <div className="card-body">
                        {this.renderField("Username", "Enter username", "text", "username")}
                        {this.renderField("Password", "Enter password", "password", "password")}
                        <div className="d-flex justify-content-between align-items-center">
                            <a href="/password-forgot">Forgot Password?</a>
                            <button
                                className="btn orange-btn mt-3"
                                onClick={this.requestLogin}
                                type="button"
                            >
                                    Login
                            </button>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <h3 className="">New to CoMiMo?</h3>
                            <div className="">
                                <div >
                                    <button
                                        className="btn orange-btn"
                                        name="register"
                                        onClick={() => window.location = "/register"}
                                        type="button"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export function pageInit(args) {
    ReactDOM.render(<Login/>, document.getElementById("main-container"));
}
