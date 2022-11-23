(ns comimo.email
  (:require [postal.core :refer [send-message]]
            [triangulum.config  :refer [get-config]]
            [triangulum.logging :refer [log-str]]))

(defn get-base-url []
  (:base-url (get-config :mail)))

(defn email? [string]
  (let [pattern #"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"]
    (and (string? string) (re-matches pattern string))))

(defn- send-postal [to-addresses cc-addresses bcc-addresses subject body content-type]
  (send-message
   (select-keys (get-config :mail) [:host :user :pass :tls :port])
   {:from    (get-config :mail :user)
    :to      to-addresses
    :cc      cc-addresses
    :bcc     bcc-addresses
    :subject subject
    :body    [{:type    (or content-type "text/plain")
               :content body}]}))

(defn send-mail [to-addresses cc-addresses bcc-addresses subject body content-type]
  (let [mime                    {:text "text/plain"
                                 :html "text/html"}
        {:keys [message error]} (send-postal to-addresses
                                             cc-addresses
                                             bcc-addresses
                                             subject
                                             body
                                             (content-type mime))]
    (when-not (= :SUCCESS error) (log-str message))))

(defn send-new-user-mail [email token lang & {:keys [type] :or {type :text}}]
  (let [lang  (keyword lang)
        title {:en "Welcome to CoMiMo"
               :es "Bienvenida a CoMiMo"}
        body  {:text {:en (format (str "Welcome to CoMiMo\n\n"
                                       "Please verify your email by clicking the following link: \n\n"
                                       "%s/verify-user?token=%s&email=%s")
                                  (get-base-url)
                                  token
                                  email)
                      :es (format (str "Bienvenida a CoMiMo\n\n"
                                       "Verifique su correo electrónico haciendo clic en el siguiente enlace: \n\n"
                                       "%s/verify-user?token=%s&email=%s")
                                  (get-base-url)
                                  token
                                  email)}
               :html {:en (format (str "<html><body>"
                                       "<h3>Welcome to CoMiMo</h3>"
                                       "<p>Please verify your email by clicking <a href='%s/verify-user?token=%s&email=%s'>here</a>.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  token
                                  email)
                      :es (format (str "<html><body>"
                                       "<h3>Bienvenida a CoMiMo</h3>"
                                       "<p>Verifique su correo electrónico haciendo clic <a href='%s/verify-user?token=%s&email=%s'>aquí</a>.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  token
                                  email)}}]
    (send-mail email nil nil (get title lang) (get-in body [type lang]) type)))

(defn send-alert-mail [email project-url lang & {:keys [type] :or {type :text}}]
  (let [lang  (keyword lang)
        title {:en "CoMiMo: mine alert"
               :es "CoMiMo: alerta minera"}
        body  {:text {:en (format (str "Mine Alert\n\n"
                                       "We have detected possible mining sites in the areas to which you are subscribed.\n\n"
                                       "You can see the new validations listed in CoMiMo here: %s\n\n"
                                       "To validate this information, go to the validation panel in the application or go directly to CoMiMo: %s&locale=en")
                                  (get-base-url)
                                  project-url)
                      :es (format (str "¡Alerta!\n\n"
                                       "Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.\n\n"
                                       "Puede visualizar estas áreas aquí: %s\n\n"
                                       "Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a CoMiMo: %s&locale=es")
                                  (get-base-url)
                                  project-url)}
               :html {:en (format (str "<html><body>"
                                       "<h3>Mine Alert</h3>"
                                       "<p>We have detected possible mining sites in the areas to which you are subscribed.</p>"
                                       "<p>You can see the new validations listed in CoMiMo <a href='%s'>here</a>.</p>"
                                       "<p>To validate this information, go to the validation panel in the application or go directly to "
                                       "<a href='%s&locale=en'>CoMiMo</a>.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  project-url)
                      :es (format (str "<html><body>"
                                       "<h3>¡Alerta!</h3>"
                                       "<p>Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.</p>"
                                       "<p>Puede visualizar estas áreas <a href='%s'>aquí</a>.</p>"
                                       "<p>Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a "
                                       "<a href='%s&locale=es'>CoMiMo</a>.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  project-url)}}]
    (send-mail email nil nil (get title lang) (get-in body [type lang]) type)))

(defn send-reset-mail [email token lang  & {:keys [type] :or {type :text}}]
  (let [lang  (keyword lang)
        title {:en "CoMiMo password reset"
               :es "CoMiMo restablecimiento de contraseña"}
        body  {:text {:en (format (str "Password Reset\n\n"
                                       "To reset your password, click the link below and enter your new password:\n\n"
                                       "%s/password-reset?token=%s&email=%s")
                                  (get-base-url)
                                  token
                                  email)
                      :es (format (str "Restablecimiento de contraseña\n\n"
                                       "Para restablecer su contraseña haga clic en el siguiente enlace e ingrese su nueva contraseña:\n\n"
                                       "%s/password-reset?token=%s&email=%s")
                                  (get-base-url)
                                  token
                                  email)}
               :html {:en (format (str "<html><body>"
                                       "<h3>Password reset</h3>"
                                       "<p>To reset your password, click <a href='%s/password-reset?token=%s&email=%s'>here</a> and enter your new password.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  token
                                  email)
                      :es (format (str "<html><body>"
                                       "<h3>Restablecimiento de contraseña</h3>"
                                       "<p>Para restablecer su contraseña haga clic <a href='%s/password-reset?token=%s&email=%s'>aquí</a> e ingrese su nueva contraseña.</p>"
                                       "</body></html>")
                                  (get-base-url)
                                  token
                                  email)}}]
    (send-mail email nil nil (get title lang) (get-in body [type lang]) type)))
