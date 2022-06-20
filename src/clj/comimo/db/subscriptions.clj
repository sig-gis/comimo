(ns comimo.db.subscriptions
  (:require [clojure.string :as str]
            [clojure.set    :as set]
            [triangulum.type-conversion :as tc]
            [triangulum.database        :refer [call-sql sql-primitive]]
            [comimo.views               :refer [data-response]]
            [comimo.db.projects         :refer [create-project!]]
            [comimo.email               :refer [send-alert-mail]]
            [comimo.py-interop          :refer [location-in-country get-image-list]]))

;;;
;;; Subscription Management
;;;

(defn- return-user-subs [user-id]
  (data-response (->> (call-sql "get_user_subscriptions" user-id)
                      (map :region))))

(defn user-subscriptions [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))]
    (return-user-subs user-id)))

(defn add-subscription [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        region  (:region params)]
    (if (sql-primitive (call-sql "user_subscribed" user-id region))
      (data-response "existing")
      (do
        (call-sql "add_subscription" user-id region)
        (return-user-subs user-id)))))

(defn remove-subscription [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        region  (:region params)]
    (call-sql "remove_subscription" user-id region)
    (return-user-subs user-id)))

(defn get-feature-names [_]
  (data-response (slurp "resources/featureNames.json")
                 {:type "application/json"})) ; the json file is already json

(defn send-email-alerts []
  (let [latest-image (first (get-image-list))
        latest-time  (subs latest-image 0 (- (count latest-image) 2))]
    (when-let [user-subs (call-sql "get_unsent_subscriptions" latest-time)]
      (doseq [{:keys [user_id email default_lang regions]} user-subs]
        (try
          (let [{:keys [action message]} (create-project! user_id
                                                          (str (if (= "en" default_lang) "Alert for " "Alerta para ")
                                                               latest-image)
                                                          regions
                                                          latest-image)]
            (when (= action "Created")
              (println "email sent to " email)
              (send-alert-mail email default_lang))
            (call-sql "set_last_alert_for" user_id latest-time)
            (call-sql "log_email_alert" user_id action message (into-array String regions)))
          (catch Exception e
            (call-sql "log_email_alert" user_id "Error" (ex-message e) "")))))))

;;;
;;; User Reported Mines
;;;

(defn- report-errors [user-id lat lon]
  (cond
    (sql-primitive (call-sql "user_mine_reported" user-id lat lon))
    "Exists"

    (not (location-in-country lat lon))
    "Outside"))

(defn report-mine [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        lat     (tc/val->double (:lat params))
        lon     (tc/val->double (:lon params))]
    (if-let [error (report-errors user-id lat lon)]
      (data-response error)
      (do
        (call-sql "add_reported_mine" user-id lat lon)
        (data-response "")))))

;;;
;;; Logs
;;;

(defn get-log-list [_]
  (->> (call-sql "select_email_logs")
       (mapv #(set/rename-keys % {:job_time       :jobTime
                                  :finish_status  :finishStatus,
                                  :finish_message :finishMessage}))
       (data-response)))
