(ns comimo.db.plots
  (:import java.sql.Timestamp)
  (:require [clojure.set :as set]
            [comimo.views :refer [data-response]]
            [triangulum.database :refer [call-sql]]
            [triangulum.type-conversion :as tc]))

;;;
;;; Project Level
;;;

(defn get-project-plots [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (data-response (mapv #(-> %
                              (set/rename-keys {:plot_id :id})
                              (update :geom tc/json->clj))
                         (call-sql "select_project_plots" project-id (/ 540 2))))))

;;;
;;; Saving Plots
;;;

(defn save-user-answer [{:keys [params]}]
  (let [plot-id          (tc/val->int (:plotId params))
        user-id          (:userId params -1)
        collection-start (tc/val->long (:collectionStart params))]
    (call-sql "save_user_answer"
              plot-id
              user-id
              (Timestamp. collection-start))
    (data-response "")))
