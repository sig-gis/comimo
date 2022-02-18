(ns comimo.routing
  (:require [comimo.views             :refer [render-page]]
            [comimo.db.imagery        :as imagery]
            [comimo.db.institutions   :as institutions]
            [comimo.db.plots          :as plots]
            [comimo.db.projects       :as projects]
            [comimo.db.subscriptions  :as subscriptions]
            [comimo.db.users          :as users]
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
   [:post "/create-project"]                 {:handler     projects/create-project!
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
   [:get  "/get-plot-disagreement"]          {:handler     plots/get-plot-disagreement}
   [:get  "/get-plotters"]                   {:handler     plots/get-plotters
                                              :auth-type   :collect
                                              :auth-action :block}
   [:get  "/get-project-plots"]              {:handler     plots/get-project-plots}
   [:post "/add-user-samples"]               {:handler     plots/add-user-samples
                                              :auth-type   :collect
                                              :auth-action :block}
   [:post "/flag-plot"]                      {:handler     plots/flag-plot
                                              :auth-type   :collect
                                              :auth-action :block}
   [:post "/release-plot-locks"]             {:handler     plots/release-plot-locks
                                              :auth-type   :collect
                                              :auth-action :block}
   [:post "/reset-plot-lock"]                {:handler     plots/reset-plot-lock
                                              :auth-type   :collect
                                              :auth-action :block}
   ;; Institutions API
   [:get  "/get-all-institutions"]           {:handler     institutions/get-all-institutions}
   [:get  "/get-institution-by-id"]          {:handler     institutions/get-institution-by-id}
   [:post "/archive-institution"]            {:handler     institutions/archive-institution
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/create-institution"]             {:handler     institutions/create-institution
                                              :auth-type   :user
                                              :auth-action :block}
   [:post "/update-institution"]             {:handler     institutions/update-institution
                                              :auth-type   :admin
                                              :auth-action :block}
   ;; Imagery API
   [:get  "/get-institution-imagery"]        {:handler     imagery/get-institution-imagery}
   [:get  "/get-project-imagery"]            {:handler     imagery/get-project-imagery
                                              :auth-type   :collect
                                              :auth-action :block}
   [:get  "/get-public-imagery"]             {:handler     imagery/get-public-imagery}
   [:post "/add-institution-imagery"]        {:handler     imagery/add-institution-imagery
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/update-institution-imagery"]     {:handler     imagery/update-institution-imagery
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/update-imagery-visibility"]      {:handler     imagery/update-imagery-visibility
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/archive-institution-imagery"]    {:handler     imagery/archive-institution-imagery
                                              :auth-type   :admin
                                              :auth-action :block}
   ;; Proxy Routes
   [:get  "/get-tile"]                       {:handler     proxy/proxy-imagery
                                              :auth-type   :no-cross
                                              :auth-action :block}
   [:get  "/get-securewatch-dates"]          {:handler     proxy/get-securewatch-dates
                                              :auth-type   :no-cross
                                              :auth-action :block}})
