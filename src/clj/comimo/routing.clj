(ns comimo.routing
  (:require [comimo.views           :refer [render-page]]
            [comimo.db.geodash      :as geodash]
            [comimo.db.imagery      :as imagery]
            [comimo.db.institutions :as institutions]
            [comimo.db.plots        :as plots]
            [comimo.db.projects     :as projects]
            [comimo.db.users        :as users]
            [comimo.proxy           :as proxy]))

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

   ;; Projects API
   [:get  "/dump-project-aggregate-data"]    {:handler     projects/dump-project-aggregate-data!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:get  "/dump-project-raw-data"]          {:handler     projects/dump-project-raw-data!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:get  "/get-home-projects"]              {:handler     projects/get-home-projects}
   [:get  "/get-institution-projects"]       {:handler     projects/get-institution-projects}
   [:get  "/get-institution-dash-projects"]  {:handler     projects/get-institution-dash-projects}
   [:get  "/get-project-by-id"]              {:handler     projects/get-project-by-id}
   [:get  "/get-template-projects"]          {:handler     projects/get-template-projects}
   [:get  "/get-template-by-id"]             {:handler     projects/get-template-by-id}
   [:get  "/get-project-stats"]              {:handler     projects/get-project-stats}
   [:post "/archive-project"]                {:handler     projects/archive-project!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/close-project"]                  {:handler     projects/close-project!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/create-project"]                 {:handler     projects/create-project!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/publish-project"]                {:handler     projects/publish-project!
                                              :auth-type   :admin
                                              :auth-action :block}
   [:post "/update-project"]                 {:handler     projects/update-project!
                                              :auth-type   :admin
                                              :auth-action :block}
   ;; Plots API
   [:get  "/get-collection-plot"]            {:handler     plots/get-collection-plot
                                              :auth-type   :collect
                                              :auth-action :block}
   [:get  "/get-plot-disagreement"]          {:handler     plots/get-plot-disagreement}
   [:get  "/get-plot-sample-geom"]           {:handler     plots/get-plot-sample-geom}
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
   ;; GeoDash API
   [:get  "/geo-dash/get-project-widgets"]   {:handler     geodash/get-project-widgets}
   [:post "/geo-dash/copy-project-widgets"]  {:handler     geodash/copy-project-widgets}
   [:post "/geo-dash/create-widget"]         {:handler     geodash/create-dashboard-widget-by-id}
   [:post "/geo-dash/delete-widget"]         {:handler     geodash/delete-dashboard-widget-by-id}
   [:post "/geo-dash/gateway-request"]       {:handler     geodash/gateway-request}
   [:post "/geo-dash/update-widget"]         {:handler     geodash/update-dashboard-widget-by-id}
   ;; Proxy Routes
   [:get  "/get-tile"]                       {:handler     proxy/proxy-imagery
                                              :auth-type   :no-cross
                                              :auth-action :block}
   [:get  "/get-securewatch-dates"]          {:handler     proxy/get-securewatch-dates
                                              :auth-type   :no-cross
                                              :auth-action :block}})
