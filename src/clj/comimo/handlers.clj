(ns comimo.handlers
  (:require [ring.util.codec            :refer [url-encode]]
            [ring.util.response         :refer [redirect]]
            [comimo.db.projects         :refer [can-collect?]]
            [comimo.db.users            :refer [is-admin?]]
            [triangulum.response        :refer [no-cross-traffic?]]
            [triangulum.type-conversion :refer [val->int]]))

(defn redirect-handler [{:keys [session query-string uri] :as _request}]
  (let [full-url (url-encode (str uri (when query-string (str "?" query-string))))]
    (if (:userId session)
      (redirect (str "/home?flash_message=You do not have permission to access "
                     full-url))
      (redirect (str "/login?returnurl="
                     full-url
                     "&flash_message=You must login to see "
                     full-url)))))

(defn route-authenticator [{:keys [session params headers] :as _request} auth-type]
  (let [user-id (:userId session -1)
        project-id   (val->int (:projectId params))
        plot-id      (val->int (:plotId params))]
    (condp = auth-type
      :user     (pos? user-id)
      :collect  (can-collect? user-id project-id plot-id)
      :admin    (is-admin? user-id)
      :no-cross (no-cross-traffic? headers)
      true)))
