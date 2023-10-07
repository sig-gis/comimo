(ns comimo.jobs
  (:require [comimo.db.subscriptions :refer [send-email-alerts]]
            [pulse.jobs              :refer [start-scheduled-service!]]
            [triangulum.database     :refer [call-sql]]
            [triangulum.logging      :refer [log-str]]))

(defn- refresh-alerts [] ; TODO: find more applicable name, batch?
  (log-str "Closing old projects")
  (call-sql "close_old_projects" 30)
  (log-str "Checking for alerts")
  (send-email-alerts))

(def ^:private one-day "1 day in msecs" (* 1000 60 60 24))

(def refresh-alerts-service #(start-scheduled-service! #'refresh-alerts one-day true))
