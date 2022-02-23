(ns comimo.db.projects
  (:require [clojure.string :as str]
            [triangulum.logging  :refer [log]]
            [triangulum.database :refer [call-sql
                                         sql-primitive
                                         insert-rows!]]
            [triangulum.type-conversion :as tc]
            [comimo.utils.part-utils    :as pu]
            [comimo.py-interop          :refer [get-points-within]]
            [comimo.views               :refer [data-response]]))

;;;
;;; Auth functions
;;;

(defn- check-auth-common [user-id project-id token-key sql-query]
  (or (and token-key
           (= token-key (:token_key (first (call-sql "select_project_by_id" {:log? false} project-id)))))
      (sql-primitive (call-sql sql-query {:log? false} user-id project-id))))

(defn can-collect? [user-id project-id token-key]
  (check-auth-common user-id project-id token-key "can_user_collect_project"))

(defn is-proj-admin? [user-id project-id token-key]
  (check-auth-common user-id project-id token-key "can_user_edit_project"))

;;;
;;; Get data functions
;;;

(defn- build-project [project]
  {:id          (:project_id project)
   :name        (:name project)
   :regions     (str/split (:regions project) #"__")
   :dataLayer   (:data_layer project)
   :boundary    (:boundary project)
   :createdDate (:created_date project)})

(defn- single-project-by-id [project-id]
  (build-project (first (call-sql "select_project_by_id" project-id))))

(defn- build-user-projects [user-id]
  (->> (call-sql "select_user_projects" user-id)
       (map build-project)))

(defn get-project-by-id [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (data-response (single-project-by-id project-id))))

(defn user-projects [{:keys [params]}]
  (let [user-id    (:userId params -1)]
    (data-response (build-user-projects user-id))))

;;;
;;; Create project
;;;

(defn create-project! [user-id proj-name regions data-layer]
  (let [project-id (sql-primitive (call-sql "create_project"
                                            user-id
                                            proj-name
                                            (str/join "__" regions)
                                            data-layer))]
    (try
      ;; Create plots
      (let [plots (->> (get-points-within regions data-layer)
                       (mapv (fn [{:strs [lat lon]}]
                               {:lat lat
                                :lon lon
                                :project_rid project-id})))]
        (insert-rows! "plots" plots))

      ;; Boundary is only used for Planet at this point.
      (pu/try-catch-throw #(call-sql "set_boundary"
                                     project-id
                                     540)
                          "SQL Error: cannot create a project AOI.")

      ;; Return new ID and token
      {:action "Created"}

      (catch Exception e
        ;; Delete new project on error
        (try
          (call-sql "delete_project" project-id)
          (catch Exception _))
        (let [causes (:causes (ex-data e))]
          ;; Log unknown errors
          (when-not causes (log (ex-message e)))
          ;; Return error stack to user
          {:action "Error"
           :message (if causes
                      (str "-" (str/join "\n-" causes))
                      "Unknown server error.")})))))

(defn create-project [{:keys [params]}]
  (let [user-id    (:userId params -1)
        proj-name  (:name params)
        regions    (:regions params)
        data-layer (:dataLayer params)]
    (data-response (create-project! user-id proj-name regions data-layer))))

;;;
;;; Update project
;;;

(defn close-project! [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (call-sql "close_project" project-id)
    (data-response "")))
