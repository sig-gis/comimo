(ns comimo.routing
  (:require [comimo.views             :refer [render-page]]
            [comimo.db.imagery        :as imagery]
            [comimo.db.plots          :as plots]
            [comimo.db.projects       :as projects]
            [comimo.db.subscriptions  :as subscriptions]
            [comimo.db.users          :as users]
            [comimo.py-interop        :as py]
            [comimo.proxy             :as proxy]))

(def routes
  {;; Page Routes
   [:get  "/"]                               {:handler     (render-page "/home")}
   [:get  "/download-data"]                  {:handler     (render-page "/download-data")
                                              :auth-type   :admin
                                              :auth-action :redirect}
   [:get  "/user-account"]                   {:handler     (render-page "/user-account")
                                              :auth-type   :user
                                              :auth-action :redirect}
   [:get  "/collection"]                     {:handler     (render-page "/collection")
                                              :auth-type   :collect
                                              :auth-action :redirect}
   [:get  "/home"]                           {:handler     (render-page "/home")}
   [:get  "/login"]                          {:handler     (render-page "/login")}
   [:get  "/logout"]                         {:handler     users/logout}
   [:get  "/password-request"]               {:handler     (render-page "/password-request")}
   [:get  "/password-reset"]                 {:handler     (render-page "/password-reset")}
   [:get  "/register"]                       {:handler     (render-page "/register")}
   [:get  "/verify-user"]                    {:handler     (render-page "/verify-user")}

   ;; Python API
   [:post "/get-image-names"]                {:handler     py/get-image-names}
   [:post "/get-single-image"]               {:handler     py/get-single-image}
   [:post "/get-gee-tiles"]                  {:handler     py/get-gee-tiles}
   [:post "/get-download-url"]               {:handler     py/get-download-url}
   [:post "/get-area-predicted"]             {:handler     py/get-area-predicted}
   [:post "/get-area-ts"]                    {:handler     py/get-area-ts}
   [:post "/get-info"]                       {:handler     py/get-info}

   ;; Users API
   [:post "/update-account"]                 {:handler     users/update-account
                                              :auth-type   :user
                                              :auth-action :block}
   [:post "/user-information"]               {:handler     users/user-information
                                              :auth-type   :user
                                              :auth-action :block}
   [:post "/login"]                          {:handler     users/login}
   [:post "/password-request"]               {:handler     users/password-request}
   [:post "/password-reset"]                 {:handler     users/password-reset}
   [:post "/verify-email"]                   {:handler     users/verify-email}
   [:post "/register"]                       {:handler     users/register}

   ;; Subscription API
   [:post "/add-subscription"]               {:handler     subscriptions/add-subscription}
   [:post "/user-subscriptions"]             {:handler     subscriptions/user-subscriptions}
   [:post "/remove-subscription"]            {:handler     subscriptions/remove-subscription}
   [:post "/get-feature-names"]              {:handler     subscriptions/get-feature-names}
   [:post "/report-mine"]                    {:handler     subscriptions/report-mine
                                              :auth-type   :user
                                              :auth-action :block}


   ;; Projects API
   [:post "/close-project"]                  {:handler     projects/close-project!
                                              :auth-type   :user
                                              :auth-action :block}
   [:post "/create-project"]                 {:handler     projects/create-project
                                              :auth-type   :user
                                              :auth-action :block}
   [:post "/get-project-by-id"]              {:handler     projects/get-project-by-id}
   [:post "/user-projects"]                  {:handler     projects/user-projects
                                              :auth-type   :user
                                              :auth-action :block}

   ;; Plots API
   [:get  "/get-collection-plot"]            {:handler     plots/get-collection-plot
                                              :auth-type   :collect
                                              :auth-action :block}
   [:get  "/get-project-plots"]              {:handler     plots/get-project-plots}
   [:post "/add-user-samples"]               {:handler     plots/add-user-samples
                                              :auth-type   :collect
                                              :auth-action :block}
   ;; Imagery API
   [:get  "/get-project-imagery"]            {:handler     imagery/get-project-imagery
                                              :auth-type   :collect
                                              :auth-action :block}
   [:get  "/get-public-imagery"]             {:handler     imagery/get-public-imagery}

   ;; Proxy Routes
   [:get  "/get-nicfi-dates"]                {:handler     proxy/get-nicfi-dates
                                              :auth-type   :no-cross
                                              :auth-action :block}})
