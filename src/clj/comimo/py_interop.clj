(ns comimo.py-interop
  (:require [clojure.string :as str]
            [libpython-clj2.require :refer [require-python]]
            [libpython-clj2.python  :refer [py. get-attr ->jvm]]
            [libpython-clj2.python.copy :refer [*item-tuple-cutoff*]]
            [triangulum.type-conversion :as tc]
            [triangulum.logging :refer [log-str]]
            [triangulum.config :refer [get-config]]
            [comimo.views :refer [data-response]]
            [triangulum.database :refer [call-sql]]))

;;; Constants

(def ^:private max-age (* 24 60 1000)) ; Once a day

;;; GEE Python interface

(require-python '[sys :bind-ns])
(py. (get-attr sys "path") "append" "src/py")
(require-python '[gee.routes :as routes]
                '[gee.utils :as utils])

(defonce last-initialized (atom 0))

(defn- check-initialized []
  (when (> (- (System/currentTimeMillis) @last-initialized) max-age)
    (let [{:keys [ee-account ee-key-path]} (get-config :gee)]
      (utils/initialize ee-account ee-key-path)
      (reset! last-initialized (System/currentTimeMillis)))))

(defn- parse-py-errors [e]
  (let [error-parts (as-> e %
                      (ex-message %)
                      (str/split % #"\n")
                      (last %)
                      (str/split % #": "))]
    {:errType (first error-parts)
     :errMsg  (->> error-parts
                   (rest)
                   (str/join ": "))}))

(defn- py-wrapper [py-fn & params]
  (check-initialized)
  (binding [*item-tuple-cutoff* 0]
    (try (->jvm (apply py-fn params))
         (catch Exception e
           (let [parsed (parse-py-errors e)]
             (log-str parsed)
             parsed)))))

;;; Utils

(defn get-points-within [regions data-layer]
  (py-wrapper utils/getPointsWithin regions data-layer))

(defn location-in-country [lat lon]
  (py-wrapper utils/locationInCountry lat lon))

;;; Routes

(defn get-image-names [_]
  (data-response (py-wrapper routes/getImageNames)))

(defn get-single-image [{:keys [json-params]}]
  (data-response (py-wrapper routes/getSingleImage json-params)))

(defn get-gee-tiles [{:keys [json-params]}]
  (data-response (py-wrapper routes/getGEETiles json-params)))

(defn get-download-url [{:keys [json-params]}]
  (data-response (py-wrapper routes/getDownloadURL json-params)))

(defn- get-subscribed-regions [user-id]
  (->> (call-sql "get_user_subscriptions" user-id)
       (map :region)))

(defn get-area-predicted [{:keys [params json-params]}]
  (let [user-id (tc/val->int (:userId params))]
    (data-response (py-wrapper routes/getAreaPredicted
                               (assoc json-params
                                      "subscribedRegions" (get-subscribed-regions user-id))))))

(defn get-area-ts [{:keys [params json-params]}]
  (let [user-id (tc/val->int (:userId params))]
    (data-response (py-wrapper routes/getAreaPredictedTS
                               (get-subscribed-regions user-id)))))

(defn get-info [{:keys [json-params]}]
  (data-response (py-wrapper routes/getInfo json-params)))
