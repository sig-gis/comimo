(ns comimo.routing
  (:require [comimo.db.plots            :as plots]
            [comimo.db.projects         :as projects :refer [can-collect?]]
            [comimo.db.subscriptions    :as subscriptions]
            [comimo.db.users            :as users :refer [is-admin?]]
            [comimo.proxy               :as proxy]
            [comimo.py-interop          :as py]
            [triangulum.views           :refer [render-page not-found-page]]
            [ring.util.codec            :refer [url-encode]]
            [ring.util.response         :refer [redirect]]
            [triangulum.type-conversion :as tc]
            [triangulum.response         :refer [data-response no-cross-traffic? forbidden-response]]))

(def routes
  {;; Page Routes
   [:get  "/"]                 {:handler (render-page "/home")}
   [:get  "/user-account"]     {:handler     (render-page "/user-account")
                                :auth-type   :user
                                :auth-action :redirect}
   [:get  "/collect"]          {:handler     (render-page "/collect")
                                :auth-type   :collect
                                :auth-action :redirect}
   [:get  "/home"]             {:handler (render-page "/home")}
   [:get  "/admin"]            {:handler     (render-page "/admin")
                                :auth-type   :admin
                                :auth-action :redirect}
   [:get  "/login"]            {:handler (render-page "/login")}
   [:get  "/logout"]           {:handler users/logout}
   [:get  "/page-not-found"]   {:handler (render-page "/page-not-found")}
   [:get  "/password-request"] {:handler (render-page "/password-request")}
   [:get  "/password-reset"]   {:handler (render-page "/password-reset")}
   [:get  "/register"]         {:handler (render-page "/register")}
   [:get  "/verify-user"]      {:handler (render-page "/verify-user")}

   ;; Python API
   [:post "/get-image-names"]     {:handler py/get-image-names}
   [:post "/get-image-url"]       {:handler py/get-image-url}
   [:post "/get-download-url"]    {:handler py/get-download-url}
   [:post "/get-stats-by-region"] {:handler py/get-stats-by-region}
   [:post "/get-stat-totals"]     {:handler py/get-stat-totals}
   [:post "/get-info"]            {:handler py/get-info}

   ;; Users API
   [:post "/update-account"]   {:handler     users/update-account
                                :auth-type   :user
                                :auth-action :block}
   [:post "/user-information"] {:handler     users/user-information
                                :auth-type   :user
                                :auth-action :block}
   [:post "/update-user-role"] {:handler     users/update-user-role
                                :auth-type   :admin
                                :auth-action :block}
   [:post "/login"]            {:handler users/login}
   [:post "/get-users-list"]   {:handler users/get-users-list}
   [:post "/password-request"] {:handler users/password-request}
   [:post "/password-reset"]   {:handler users/password-reset}
   [:post "/verify-email"]     {:handler users/verify-email}
   [:post "/register"]         {:handler users/register}

   ;; Subscription API
   [:post "/add-subscription"]    {:handler     subscriptions/add-subscription
                                   :auth-type   :user
                                   :auth-action :block}
   [:post "/get-feature-names"]   {:handler subscriptions/get-feature-names}
   [:post "/get-log-list"]        {:handler subscriptions/get-log-list}
   [:post "/remove-subscription"] {:handler     subscriptions/remove-subscription
                                   :auth-type   :user
                                   :auth-action :block}
   [:post "/report-mine"]         {:handler     subscriptions/report-mine
                                   :auth-type   :user
                                   :auth-action :block}
   [:post "/user-subscriptions"]  {:handler subscriptions/user-subscriptions}

   ;; Projects API
   [:post "/close-project"]     {:handler     projects/close-project!
                                 :auth-type   :user
                                 :auth-action :block}
   [:post "/create-project"]    {:handler     projects/create-project
                                 :auth-type   :user
                                 :auth-action :block}
   [:post "/get-project-by-id"] {:handler projects/get-project-by-id}
   [:post "/user-projects"]     {:handler projects/user-projects}

   ;; Plots API
   [:post "/get-project-plots"]    {:handler plots/get-project-plots}
   [:post "/save-user-answer"]     {:handler     plots/save-user-answer
                                    :auth-type   :collect
                                    :auth-action :block}
   [:post "/get-data-dates"]       {:handler plots/get-data-dates}
   [:post "/download-predictions"] {:handler     plots/download-predictions
                                    :auth-type   :admin
                                    :auth-action :block}
   [:post "/download-user-mines"]  {:handler     plots/download-user-mines
                                    :auth-type   :admin
                                    :auth-action :block}

   ;; Proxy Routes
   [:post "/get-nicfi-dates"] {:handler     proxy/get-nicfi-dates
                               :auth-type   :no-cross
                               :auth-action :block}
   ;; Must be GET for mapbox to use
   [:get  "/get-nicfi-tiles"] {:handler     proxy/get-nicfi-tiles
                               :auth-type   :no-cross
                               :auth-action :block}})

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Routing Handler
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn- redirect-auth [user-id]
  (fn [request]
    (let [{:keys [query-string uri]} request
          full-url                   (url-encode (str uri (when query-string (str "?" query-string))))]
      (if (pos? user-id)
        (redirect (str "/home?flash_message=You do not have permission to access "
                       full-url))
        (redirect (str "/login?returnurl="
                       full-url
                       "&flash_message=You must login to see "
                       full-url))))))

(defn handler [{:keys [uri request-method params headers] :as request}]
  (let [{:keys [auth-type auth-action handler] :as route} (get routes [request-method uri])
        user-id                                           (:userId params -1)
        project-id                                        (tc/val->int (:projectId params))
        plot-id                                           (tc/val->int (:plotId params))
        next-handler                                      (if route
                                                            (if (condp = auth-type
                                                                  :user     (pos? user-id)
                                                                  :collect  (can-collect? user-id project-id plot-id)
                                                                  :admin    (is-admin? user-id)
                                                                  :no-cross (no-cross-traffic? headers)
                                                                  true)
                                                              handler
                                                              (if (= :redirect auth-action)
                                                                (redirect-auth user-id)
                                                                forbidden-response))
                                                            not-found-page)]
    (next-handler request)))
