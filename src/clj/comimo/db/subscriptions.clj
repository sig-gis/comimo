(ns comimo.db.subscriptions
  (:require [triangulum.type-conversion :as tc]
            [triangulum.database        :refer [call-sql sql-primitive]]
            [comimo.views               :refer [data-response]]))

;;; Subscription

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

;;; User reported mines

(defn report-mine [{:keys [params]}]
  (let [user-id (tc/val->int (:userId params))
        lat     (tc/val->double (:lat params))
        lon     (tc/val->double (:lon params))]
    (if (sql-primitive (call-sql "user_mine_reported" user-id lat lon))
      (data-response "Exists")
      (do
        (call-sql "add_reported_mine" user-id lat lon)
        (data-response "")))))
