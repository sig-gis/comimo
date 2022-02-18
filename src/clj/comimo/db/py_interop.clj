(ns comimo.db.py-interop
  (:require [clojure.string :as str]
            [libpython-clj2.require :refer [require-python]]
            [libpython-clj2.python  :refer [py. get-attr ->jvm]]
            [libpython-clj2.python.copy :refer [*item-tuple-cutoff*]]
            [triangulum.type-conversion :as tc]
            [triangulum.logging :refer [log]]
            [triangulum.config :refer [get-config]]
            [comimo.views :refer [data-response]]))

;;; Constants

(def ^:private max-age (* 24 60 1000)) ; Once a day

;;; GEE Python interface

(require-python '[sys :bind-ns])
(py. (get-attr sys "path") "append" "src/py")
(require-python '[gee.routes :as gee]
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
         (catch Exception e (log (parse-py-errors e))))))

;;; Utils

(defn get-points-within [regions data-layer]
  (py-wrapper utils/getPointsWithin regions data-layer))
