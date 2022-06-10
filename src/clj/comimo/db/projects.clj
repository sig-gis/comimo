(ns comimo.db.projects
  (:require [clojure.string :as str]
            [clojure.set    :as set]
            [triangulum.logging  :refer [log]]
            [triangulum.database :refer [call-sql
                                         sql-primitive
                                         insert-rows!]]
            [triangulum.type-conversion :as tc]
            [comimo.errors              :refer [try-catch-throw]]
            [comimo.py-interop          :refer [get-points-within]]
            [comimo.views               :refer [data-response]]))

;;;
;;; Auth Functions
;;;

(defn can-collect? [user-id project-id plot-id]
  (or (and (pos? project-id)
           (sql-primitive (call-sql "can_user_collect_project" {:log? false} user-id project-id)))
      (and (pos? plot-id)
           (sql-primitive (call-sql "can_user_collect_plot" {:log? false} user-id plot-id)))))

;;;
;;; Get Project Data
;;;

(defn- build-project [project]
  (-> project
      (set/rename-keys {:project_id   :id
                        :data_layer   :dataLayer
                        :created_date :createdDate})
      (update :boundary tc/json->clj)))

(defn- single-project-by-id [project-id]
  (build-project (first (call-sql "select_project_by_id" project-id))))

(defn- build-user-projects [user-id]
  (->> (call-sql "select_user_projects" user-id)
       (map build-project)))

(defn get-project-by-id [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (data-response (single-project-by-id project-id))))

(defn user-projects [{:keys [params]}]
  (let [user-id (:userId params -1)]
    (data-response (build-user-projects user-id))))

;;;
;;; Create Project
;;;

(defn create-project! [user-id proj-name regions data-layer]
  (let [project-id (sql-primitive (call-sql "create_project"
                                            user-id
                                            proj-name
                                            (into-array String regions)
                                            data-layer))]
    (try
      ;; Create plots
      (let [plots (->> (get-points-within data-layer regions)
                       (mapv (fn [{:strs [lat lon]}]
                               {:lat         lat
                                :lon         lon
                                :project_rid project-id})))]
        (insert-rows! "plots" plots))

      ;; Boundary and geom must be calculated after plots are added
      (try-catch-throw #(call-sql "calc_project_boundary"
                                  project-id
                                  540)
                       "SQL Error: cannot create a project AOI.")
      (try-catch-throw #(call-sql "calc_plot_geom"
                                  project-id
                                  (/ 540 2))
                       "SQL Error: cannot create a plot geoms.")

      ;; Return success message
      ""

      (catch Exception e
        ;; Delete new project on error
        (try
          (call-sql "delete_project" project-id)
          (catch Exception _))
        (let [causes (:causes (ex-data e))]
          ;; Log errors
          (if causes
            (log (str "-" (str/join "\n-" causes)))
            (log (ex-message e)))
          ;; Return error stack to user
          (if causes
            "errorNewProject"
            "errorUnknown"))))))

(defn create-project [{:keys [params]}]
  (let [user-id    (:userId params -1)
        proj-name  (:name params)
        regions    (:regions params)
        data-layer (:dataLayer params)]
    (data-response (create-project! user-id proj-name regions data-layer))))

;;;
;;; Update Project
;;;

(defn close-project! [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (call-sql "close_project" project-id)
    (data-response "")))
