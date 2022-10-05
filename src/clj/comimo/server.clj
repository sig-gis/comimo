;; (ns comimo.server
;;   (:require
;;    #_[comimo.db.subscriptions :refer [send-email-alerts]]
;;    [comimo.routing :as routing]
;;    [triangulum.cli          :refer [get-cli-options]]
;;    [triangulum.config       :refer [get-config]]
;;    [triangulum.server       :as triangulum-server]))

;; (defn -main [& args]
;;   (if-let [{:keys [action options]} (get-cli-options args
;;                                                      triangulum-server/cli-options
;;                                                      triangulum-server/cli-actions
;;                                                      "server"
;;                                                      (get-config :server))]
;;     (case action
;;       :start  (triangulum-server/start-server! options routing/routing-handler)
;;       :stop   (triangulum-server/stop-running-server!)
;;       :reload (triangulum-server/reload-running-server!)
;;       nil)
;;     (System/exit 1)))
