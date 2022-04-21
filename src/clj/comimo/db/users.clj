(ns comimo.db.users
  (:import java.util.UUID)
  (:require [clojure.set :as set]
            [ring.util.response :refer [redirect]]
            [triangulum.type-conversion :as tc]
            [triangulum.database        :refer [call-sql sql-primitive]]
            [triangulum.config          :refer [get-config]]
            [comimo.email               :refer [send-new-user-mail send-reset-mail]]
            [comimo.views               :refer [data-response]]))

(defn is-admin? [user-id]
  (sql-primitive (call-sql "is_user_admin" {:log? false} user-id)))

(defn- get-login-errors [user]
  (cond (nil? user)
        "errorLogin"

        (not (:verified user))
        "errorRegistered"))

(defn login [{:keys [params]}]
  (let [{:keys [username password]} params
        user                        (first (call-sql "check_login" {:log? false} username password))]
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
        email        (:email params)
        full-name    (:fullName params)
        institution  (:institution params)
        sector       (:sector params)
        password     (:password params)
        username     (:username params)
        default-lang (:defaultLang params)]
    (if-let [error-msg (get-register-errors username email)]
      (data-response error-msg)
      (let [auto-validate? (get-config :mail :auto-validate?)
            user-id        (sql-primitive (call-sql "add_user"
                                                    {:log? false}
                                                    username
                                                    email
                                                    password
                                                    reset-key
                                                    full-name
                                                    sector
                                                    institution
                                                    default-lang))]
        (if auto-validate?
          (do (call-sql "set_user_verified" user-id)
              (data-response ""))
          (try
            (send-new-user-mail email reset-key default-lang)
            (data-response "")
            (catch Exception _
              (data-response "errorCreating"))))))))

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
    (data-response "")))

(defn password-request [{:keys [params]}]
  (let [default-lang (:defaultLang params)
        reset-key    (str (UUID/randomUUID))
        email        (sql-primitive (call-sql "set_password_reset_key" {:log? false} (:email params) reset-key))]
    (if email
      (try
        (send-reset-mail email reset-key default-lang)
        (data-response "")
        (catch Exception _
          (data-response "errorEmail")))
      (data-response "errorNotFound"))))

(defn- get-verify-errors [user reset-key]
  (cond (nil? user)
        "errorNotFound"

        (not= reset-key (:reset_key user))
        "errorToken"

        :else nil))

(defn password-reset [{:keys [params]}]
  (let [email     (:email params)
        token     (:token params)
        password  (:password params)
        user      (first (call-sql "get_user_by_email" email))]
    (if-let [error-msg (get-verify-errors user token)]
      (data-response error-msg)
      (do
        (call-sql "update_password" {:log? false} email password)
        (data-response "")))))

(defn verify-email [{:keys [params]}]
  (let [email (:email params)
        token (:token params)
        user  (first (call-sql "get_user_by_email" email))]
    (if-let [error-msg (get-verify-errors user token)]
      (data-response error-msg)
      (do
        (call-sql "user_verified" (:user_id user))
        (data-response "")))))

(defn get-users-list [_]
  (->> (call-sql "select_users_list")
       (mapv #(set/rename-keys % {:user_id :userId}))
       (data-response)))
