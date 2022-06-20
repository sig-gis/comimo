import React from "react";
import ReactDOM from "react-dom";
import {ThemeProvider} from "@emotion/react";

import AccountForm from "./components/AccountForm";

import {getLanguage, jsonRequest} from "./utils";
import {THEME} from "./constants";

class PasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localeText: {}
    };
  }

  componentDidMount() {
    Promise.all([
      this.getLocale(),
      this.verifyEmail()
    ])
      .then(data => {
        if (data[0] && data[1] === "") {
          alert(this.state.localeText.verified);
          window.location = "/login";
        } else {
          console.error(data[1]);
          alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating);
          window.location = "/password-forgot";
        }
      })
      .catch(error => console.error(error));
  }

   getLocale = () => {
     jsonRequest(`/locale/${getLanguage(["en", "es"])}.json`, null, "GET")
       .then(data => this.setState({localeText: data.users}))
       .catch(err => console.error(err));
   };

  verifyEmail = () => jsonRequest(
    "/verify-email",
    {
      token: this.props.token,
      email: this.props.email
    }
  );

  render() {
    const {localeText} = this.state;
    return (
      <ThemeProvider theme={THEME}>
        <AccountForm header={localeText.verifyUser}>
          <label>{localeText.verifying}...</label>
        </AccountForm>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(
    <PasswordReset
      email={args.email || ""}
      token={args.token || ""}
    />,
    document.getElementById("main-container")
  );
}
