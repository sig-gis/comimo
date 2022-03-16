(ns comimo.db.users
  (:import java.net.URLEncoder
           java.time.format.DateTimeFormatter
           java.time.LocalDateTime
           java.util.UUID)
  (:require [ring.util.response :refer [redirect]]
            [triangulum.type-conversion :as tc]
            [triangulum.database        :refer [call-sql sql-primitive]]
            [triangulum.config          :refer [get-config]]
            [comimo.utils.mail          :refer [send-mail get-base-url]]
            [comimo.views               :refer [data-response]]))

(defn is-admin? [user-id]
  (sql-primitive (call-sql "is_user_admin" {:log? false} user-id)))

(defn- get-login-errors [user]
  (cond (nil? user)
        "Invalid email/password combination."

        (not (:verified user))
        "You have not verified your email. Please check your email for a link to verify your account, or click the forgot password link below to generate a new email."))

(defn login [{:keys [params]}]
  (let [{:keys [username password]} params
        user (first (call-sql "check_login" {:log? false} username password))]
    (if-let [error-msg (get-login-errors user)]
      (data-response error-msg)
      (data-response ""
                     {:session {:userId   (:user_id user)
                                :username username
                                :role     (:role user)
                                :userLang (:default_lang user)}}))))

(defn user-information [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        user    (first (call-sql "get_user_information" user-id))]
    (data-response {:username    (:username user)
                    :email       (:email user)
                    :fullName    (:full_name user)
                    :sector      (:sector user)
                    :institution (:institution user)
                    :defaultLang (:default_lang user)})))

(defn- get-register-errors [username email]
  (cond (sql-primitive (call-sql "username_taken" username))
        "errorEmail"

        (sql-primitive (call-sql "email_taken" email))
        "errorUsername"

        :else nil))

(defn register [{:keys [params]}]
  (let [reset-key    (str (UUID/randomUUID))
        default-lang (:defaultLang params)
        email        (:email params)
        full-name    (:fullName params)
        institution  (:institution params)
        sector       (:sector params)
        password     (:password params)
        username     (:username params)]
    (if-let [error-msg (get-register-errors username email)]
      (data-response error-msg)
      (let [timestamp      (-> (DateTimeFormatter/ofPattern "yyyy/MM/dd HH:mm:ss")
                               (.format (LocalDateTime/now)))
            email-msg      (format (str "Dear %s,\n\n"
                                        "Thank you for signing up for CEO!\n\n"
                                        "Your Account Summary Details:\n\n"
                                        "  Email: %s\n"
                                        "  Created on: %s\n\n"
                                        "  Click the following link to verify your email:\n"
                                        "  %sverify-email?email=%s&passwordResetKey=%s\n\n"
                                        "Kind Regards,\n"
                                        "  The CEO Team")
                                   email email timestamp (get-base-url) (URLEncoder/encode email) reset-key)
            auto-validate? (get-config :mail :auto-validate?)]
        (call-sql "add_user"
                  {:log? false}
                  username
                  email
                  password
                  reset-key
                  full-name
                  sector
                  institution
                  default-lang)
        (if auto-validate?
          (do (call-sql "user_verified" (:user_id user))
              (data-response ""))
          (try
            (send-mail email nil nil "Welcome to CEO!" email-msg "text/plain")
            (catch Exception _
              (data-response (str "A new user account was created but there was a server error.  Please contact support@sig-gis.com.")))))))))

(defn logout [_]
  (-> (redirect "/")
      (assoc :session nil)))

(defn update-account [{:keys [params]}]
  (let [user-id      (tc/val->int (:userId params))
        full-name    (:fullName params)
        sector       (:sector params)
        institution  (:institution params)
        default-lang (:defaultLang params)]
    (call-sql "update_user"
              {:log? false}
              user-id
              full-name
              sector
              institution
              default-lang)
    (data-response "success")))

(defn password-request [{:keys [params]}]
  (let [reset-key (str (UUID/randomUUID))
        email     (sql-primitive (call-sql "set_password_reset_key" {:log? false} (:email params) reset-key))
        email-msg (format (str "Hi %s,\n\n"
                               "  To reset your password, simply click the following link:\n\n"
                               "  %spassword-reset?email=%s&passwordResetKey=%s")
                          email (get-base-url) email reset-key)]
    (if email
      (try
        (send-mail email nil nil "Password reset on CEO" email-msg "text/plain")
        (data-response "")
        (catch Exception _
          (data-response (str "A user with the email "
                              email
                              " was found, but there was a server error.  Please contact support@sig-gis.com."))))
      (data-response "errorNotFound"))))

(defn- get-verify-errors [user reset-key]
  (cond (nil? user)
        "errorNotFound"

        (not= reset-key (:reset_key user))
        "errorToken"

        :else nil))

(defn password-reset [{:keys [params]}]
  (let [email     (:email params)
        reset-key (:passwordResetKey params)
        password  (:password params)
        user      (first (call-sql "get_user_by_email" email))]
    (if-let [error-msg (get-verify-errors user reset-key)]
      (data-response error-msg)
      (do
        (call-sql "update_password" {:log? false} email password)
        (data-response "")))))

(defn verify-email [{:keys [params]}]
  (let [email     (:email params)
        reset-key (:passwordResetKey params)
        user      (first (call-sql "get_user_by_email" email))]
    (if-let [error-msg (get-verify-errors user reset-key)]
      (data-response error-msg)
      (do
        (call-sql "user_verified" (:user_id user))
        (data-response "")))))
