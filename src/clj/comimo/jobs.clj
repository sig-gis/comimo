(ns comimo.jobs
  (:require [comimo.db.subscriptions :refer [send-email-alerts]]
            [triangulum.database     :refer [call-sql]]
            [triangulum.logging      :refer [log-str]]))

(def ^:private expires-in "1 day in msecs" (* 1000 60 60 24))

(defn- remove-old-projects-and-send-alerts! []
  (log-str "Closing old projects")
  (call-sql "close_old_projects" 30)
  (log-str "Checking for alerts")
  (send-email-alerts))

(defn start-scheduled-jobs! []
  (log-str "Starting scheduling service.")
  (future
    (while true
      (Thread/sleep expires-in)
      (try (remove-old-projects-and-send-alerts!)
           (catch Exception _)))))

(defn stop-scheduled-jobs! [service] (future-cancel service))
