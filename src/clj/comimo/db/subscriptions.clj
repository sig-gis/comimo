(ns comimo.db.subscriptions
  (:require [clojure.set                :as set]
            [triangulum.type-conversion :as tc]
            [triangulum.database        :refer [call-sql sql-primitive]]
            [comimo.views               :refer [data-response]]
            [comimo.db.projects         :refer [create-project!]]
            [comimo.email               :refer [send-alert-mail get-base-url]]
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
          (let [regions     (into-array String regions)
                {:keys [msg project-id]} (create-project! user_id
                                                          (str (if (= "en" default_lang) "Alert for " "Alerta para ")
                                                               latest-image)
                                                          regions
                                                          latest-image)
                action      (if project-id "Created" "Failed")
                project-url (str (get-base-url) "/collect?projectId=" project-id)]
            (when (= action "Created")
              (send-alert-mail email project-url default_lang)
              (println "email sent to " email))
            (call-sql "log_email_alert" user_id action msg regions)
            (println "called log email alert sql")
            (call-sql "set_last_alert_for" user_id latest-time))
          (catch Exception e
            (call-sql "log_email_alert" user_id "Error" (ex-message e) (into-array String []))))))))

;;;
;;; User Reported Mines
;;;

(defn- report-errors [user-id lat lng]
  (cond
    (sql-primitive (call-sql "user_mine_reported" user-id lat lng))
    "Exists"

    (not (location-in-country lat lng))
    "Outside"))

(defn report-mine [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        lat     (tc/val->double (:lat params))
        lng     (tc/val->double (:lng params))]
    (if-let [error (report-errors user-id lat lng)]
      (data-response error)
      (do
        (call-sql "add_reported_mine" user-id lat lng)
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
