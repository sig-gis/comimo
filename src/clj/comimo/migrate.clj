(ns comimo.migrate
  (:require [triangulum.cli      :refer [get-cli-options]]
            [triangulum.config   :refer [get-config]]
            [triangulum.database :refer [call-sql call-sqlite insert-rows!]])
            [triangulum.email     :refer [get-base-url send-mail]]
  (:import java.util.UUID))

(def MILLISECONDS 5000)
(def SQLITEDB "db.sqlite3")
(def TAKE_NUMBER 1)

(def users-sql
  "SELECT user_id AS user_uid,
       username,
       accounts_profile.email,
       institution,
       full_name,
       sector,
       default_lang,
       CASE WHEN is_superuser = 1 THEN 'admin' ELSE 'user' END AS role,
       'changeme' AS password
  FROM accounts_profile
       INNER JOIN
       auth_user ON auth_user.id = user_uid;")

(def subs-sql
  "SELECT gmw_subscribe.id AS subscription_uid,
       user_id AS user_rid,
       level,
       region,
       last_alert_for,
       created_date
  FROM gmw_subscribe
       INNER JOIN
       auth_user ON auth_user.id = user_rid;")


(defn send-reset-password-email [email token lang & {:keys [type] :or {type :text}}]
  (let [lang  (keyword lang)
        title {:en "CoMiMo password reset"
               :es "CoMiMo restablecimiento de contraseña"}
        body  {:text {:en (format (str "Password Reset\n\n"
                                    "The updated CoMiMo site is now live. "
                                    "To reset your password, please click the link below and enter your new password:\n\n"
                                    "%s/password-reset?token=%s&email=%s\n\n"
                                    "You can access the updated CoMiMo User Manual to answer any questions.\n\n"
                                    "Thank you,\n\n"
                                    "The CoMiMo Team")
                            (get-base-url)
                            token
                            email)
                      :es (format (str "Restablecimiento de contraseña\n\n"
                                    "La nueva versión de CoMiMo ya está disponible. "
                                    "Para restablecer su contraseña haga clic en el siguiente enlace e ingrese su nueva contraseña:\n\n"
                                    "%s/password-reset?token=%s&email=%s\n\n"
                                    "Si tienes preguntas adicionales, puedes acceder al Manual de usuario de CoMiMo actualizado.\n\n"
                                    "Gracias,\n\n"
                                    "El equipo de CoMiMo")
                            (get-base-url)
                            token
                            email)}}]
    (send-mail email nil nil (get title lang) (get-in body [type lang]) type)))

(defn notify-users! [{:keys [milliseconds] :or {milliseconds MILLISECONDS}}]
  (let [milliseconds (or milliseconds MILLISECONDS)
        users        (call-sql "select_users_list")]
    (doseq [user (take TAKE_NUMBER users)]
      (let [email        (:users/email user)
            token        (str (UUID/randomUUID))
            default-lang (:users/default_lang user)]
        (if default-lang
          (try
            (call-sql "set_password_reset_token" {:log? false} email token)
            (send-reset-password-email email token default-lang)
            (println "Sent to: ", email)
            (catch Exception e
              (println e)))
          (println "Error default language not found..."))
        (Thread/sleep milliseconds)))))

(defn move-users! [{:keys [sqlite-db] :or {sqlite-db SQLITEDB}}]
  (let [sqlite-db (or sqlite-db SQLITEDB)]
    (->> (call-sqlite users-sql sqlite-db)
         (map #(assoc % :verified false))
         (insert-rows! "users"))

    (println "Migrating Subs...")

    (->> (call-sqlite subs-sql sqlite-db)
         (map (fn [row] (let [level  (:level row)
                           region (:region row)]
                       (-> row
                         (dissoc :level)
                         (assoc :region (str level "_" region))
                         (update :last_alert_for #(java.sql.Timestamp/valueOf %))
                         (update :created_date #(java.sql.Timestamp/valueOf %))))))
         (insert-rows! "subscriptions"))
    (println "Finishing...")))

(def ^:private cli-actions
  {:move-users   {:description "Migrate user accounts with subscriptions."
                  :requires    []}
   :notify-users {:description "Email reset password to users."
                  :requires    []}})

(def ^:private cli-options
  {:sqlite-db    ["-p" "--sqlite-db PATH" "Path for sqlite db file default ./db.sqlite3"]
   :milliseconds ["-m" "--milliseconds MS"
                  :parse-fn #(if (int? %) % (Integer/parseInt %))]})

(defn -main [& args]
  (if-let [{:keys [action options]} (get-cli-options args
                                                     cli-options
                                                     cli-actions
                                                     "migrate"
                                                     (get-config :server))]
    (case action
      :move-users   (do (move-users! options)
                        (shutdown-agents))
      :notify-users (do (notify-users! options)
                        (shutdown-agents))
      nil)
    (System/exit 1)))
