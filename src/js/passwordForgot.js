import React from "react";
import ReactDOM from "react-dom";
import {getCookie} from "./utils";

class PasswordForgot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: ""
        };
    }

    requestPassword = () => {
        fetch("/password-forgot/",
              {
                  method: "POST",
                  headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                      "X-CSRFToken": getCookie("csrftoken")
                  },
                  body: JSON.stringify({
                      email: this.state.email
                  })
              })
            .then(response => Promise.all([response.ok, response.text()]))
            .then(data => {
                if (data[0] && data[1] === "") {
                    window.location = "/password-reset";
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
                    <div className="card-header">Request Password Reset</div>
                    <div className="card-body">
                        {this.renderField("Email", "Enter email", "email", "email")}
                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                className="btn orange-btn mt-3"
                                onClick={this.requestPassword}
                                type="button"
                            >
                                Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export function pageInit(args) {
    ReactDOM.render(<PasswordForgot/>, document.getElementById("main-container"));
}
