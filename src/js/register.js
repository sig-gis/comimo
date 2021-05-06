import React from "react";
import ReactDOM from "react-dom";
import EmailValidator from "email-validator";

import {getCookie} from "./utils";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            email: "",
            fullName: "",
            institution: "",
            sector: "academic",
            password: "",
            passwordConfirmation: ""
        };
    }

    validatePassword = password => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)
        || password.length >= 16;

    verifyInputs = () => {
        const {username, email, fullName, institution, password, passwordConfirmation} = this.state;
        return [
            username.length < 6 && "- Username must be 5 or more characters long.",
            !EmailValidator.validate(email) && "- Invalid email.",
            fullName.length === 0 && "- A name is required.",
            institution.length === 0 && "- An institution is required.",
            !this.validatePassword(password) && "- Your password must be a minimum eight characters and contain at least one uppercase letter, one lowercase letter, one number and one special character -or- be a minimum of 16 characters.",
            password !== passwordConfirmation && "- Your passwords must match."
        ].filter(e => e);
    };

    registerUser = () => {
        const errors = this.verifyInputs();
        if (errors.length > 0) {
            alert(errors.join("\n"));
        } else {
            fetch("/register/",
                  {
                      method: "POST",
                      headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                          "X-CSRFToken": getCookie("csrftoken")
                      },
                      body: JSON.stringify({
                          username: this.state.username,
                          email: this.state.email,
                          fullName: this.state.fullName,
                          institution: this.state.institution,
                          sector: this.state.sector,
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
        }
    };

    renderField = (label, placeholder, type, stateKey) => (
        <div className="d-flex flex-column">
            <label htmlFor={stateKey}>{label}</label>
            <input
                className="p-2"
                id={stateKey}
                onChange={e => this.setState({[stateKey]: e.target.value})}
                placeholder={`Enter ${label.toLowerCase()}`}
                type={type}
                value={this.state[stateKey]}
            />
        </div>
    );

    renderSelect = (label, options, stateKey) => (
        <div className="d-flex flex-column">
            <label htmlFor={stateKey}>{label}</label>
            <select
                className="p-2"
                id={stateKey}
                onChange={e => this.setState({[stateKey]: e.target.value})}
                value={this.state[stateKey]}
            >
                {options.map(o => (
                    <option key={o} value={o.toLowerCase()}>{o}</option>
                ))}
            </select>
        </div>
    );

    render() {
        return (
            <div
                className="d-flex justify-content-center"
                style={{paddingTop: "2rem"}}
            >
                <div className="card">
                    <div className="card-header">Register for a New Account</div>
                    <div className="card-body">
                        {this.renderField("Username", "text", "username")}
                        {this.renderField("Email", "text", "email")}
                        {this.renderField("Full Name", "text", "fullName")}
                        {this.renderField("Institution", "text", "institution")}
                        {this.renderSelect("Sector", ["Academic", "Government", "NGO"], "sector")}
                        {this.renderField("Password", "password", "password")}
                        {this.renderField("Confirm Password", "password", "passwordConfirmation")}
                        <div className="d-flex justify-content-between align-items-center">
                            <span style={{color: "red"}}>All Fields are Required</span>
                            <button
                                className="btn orange-btn mt-3"
                                onClick={this.registerUser}
                                type="button"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export function pageInit(args) {
    ReactDOM.render(<Register/>, document.getElementById("main-container"));
}
