(ns comimo.db.plots
  (:require [clojure.set :as set]
            [comimo.views :refer [data-response]]
            [triangulum.database :refer [call-sql]]
            [triangulum.type-conversion :as tc]))

;;;
;;; Collection
;;;

(defn get-project-plots [{:keys [params]}]
  (let [project-id (tc/val->int (:projectId params))]
    (data-response (mapv #(-> %
                              (set/rename-keys {:plot_id :id})
                              (update :geom tc/json->clj))
                         (call-sql "select_project_plots" project-id)))))

(defn save-user-answer [{:keys [params]}]
  (let [plot-id (tc/val->int (:plotId params))
        answer  (:answer params)]
    (call-sql "save_user_answer" plot-id answer)
    (data-response "")))

;;;
;;; Download
;;;

(defn get-data-dates [_]
  (data-response {:predictions (->> (call-sql "get_prediction_options") (map :data_layer))
                  :userMines   (->> (call-sql "get_user_mine_options")  (map :year_month))}))

(defn download-predictions [{:keys [params]}]
  (let [data-layer (:dataLayer params)]
    (->> (call-sql "get_predictions" data-layer)
         (mapv #(set/rename-keys % {:project_name :projectName
                                    :data_layer   :dataLayer}))
         (data-response))))

(defn download-user-mines [{:keys [params]}]
  (let [data-layer (:dataLayer params)]
    (->> (call-sql "get_user_mines" data-layer)
         (mapv #(set/rename-keys % {:reported_date :reportedDate}))
         (data-response))))
