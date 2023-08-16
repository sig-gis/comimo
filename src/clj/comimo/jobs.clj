(ns comimo.jobs
  (:require [comimo.db.subscriptions :refer [send-email-alerts]]
            [triangulum.database     :refer [call-sql]]
            [triangulum.logging      :refer [log-str]]))

(def ^:private expires-in "1 day in msecs" (* 1000 60 60 24))

(defn- scheduled-jobs []
  (log-str "Closing old projects")
  (call-sql "close_old_projects" 30)
  (log-str "Checking for alerts")
  (send-email-alerts))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn start-scheduling-service! []
  (log-str "Starting scheduling service.")
  (future
    (while true
      (Thread/sleep expires-in)
      (try (scheduled-jobs)
           (catch Exception _)))))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn stop-scheduling-service! [service] (future-cancel service))