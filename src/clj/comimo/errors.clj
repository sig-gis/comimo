(ns comimo.errors
  (:require [triangulum.logging :refer [log]]))

;;; Errors

;; TODO Move to TRI

(defn init-throw [message]
  (throw (ex-info message {:causes [message]})))

(defn try-catch-throw [try-fn message]
  (try (try-fn)
       (catch Exception e
         (log (ex-message e))
         (let [causes (conj (:causes (ex-data e) []) message)]
           (throw (ex-info message {:causes causes}))))))
