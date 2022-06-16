(ns comimo.server
  (:require [cider.nrepl             :refer [cider-nrepl-handler]]
            [clojure.java.io         :as io]
            [comimo.db.subscriptions :refer [send-email-alerts]]
            [comimo.handler          :refer [create-handler-stack]]
            [nrepl.server            :as nrepl-server]
            [ring.adapter.jetty      :refer [run-jetty]]
            [triangulum.cli          :refer [get-cli-options]]
            [triangulum.config       :refer [get-config]]
            [triangulum.database     :refer [call-sql]]
            [triangulum.logging      :refer [log-str set-log-path!]]
            [triangulum.notify       :refer [available? ready!]]
            [triangulum.sockets      :refer [send-to-server! socket-open?]]))

(defonce ^:private server             (atom nil))
(defonce ^:private repl-server        (atom nil))
(defonce ^:private scheduling-service (atom nil))

(def ^:private expires-in "1 day in msecs" (* 1000 60 60 24))
(def ^:private ks-scan-interval 60) ; seconds

(defn- scheduled-jobs []
  (log-str "Closing old projects")
  (call-sql "close_old_projects" 30)
  (log-str "Checking for alerts")
  (send-email-alerts))

(defn- start-scheduling-service! []
  (log-str "Starting scheduling service.")
  (future
    (while true
      (Thread/sleep expires-in)
      (try (scheduled-jobs)
           (catch Exception _)))))

(def ^:private cli-options
  {:http-port  ["-p" "--http-port PORT"  "Port for http, default 8080"
                :parse-fn #(if (int? %) % (Integer/parseInt %))]
   :https-port ["-P" "--https-port PORT" "Port for https (e.g. 8443)"
                :parse-fn #(if (int? %) % (Integer/parseInt %))]
   :repl       ["-r" "--repl" "Starts a REPL server on port 5555"
                :default false]
   :mode       ["-m" "--mode MODE" "Production (prod) or development (dev) mode, default prod"
                :default "prod"
                :validate [#{"prod" "dev"} "Must be \"prod\" or \"dev\""]]
   :log-dir    ["-l" "--log-dir DIR" "Directory for log files. When a directory is not provided, output will be to stdout."
                :default ""]})

(def ^:private cli-actions
  {:start  {:description "Starts the server."
            :requires    [:http-port]}
   :stop   {:description "Stops the server."}
   :reload {:description "Reloads a running server."}})

(defn start-server! [{:keys [http-port https-port mode log-dir repl]}]
  (let [has-key?   (.exists (io/file "./.key/keystore.pkcs12"))
        ssl?       (and has-key? https-port)
        handler    (create-handler-stack ssl? (= mode "dev"))
        config     (merge
                    {:port  http-port
                     :join? false}
                    (when ssl?
                      {:ssl?             true
                       :ssl-port         https-port
                       :keystore         "./.key/keystore.pkcs12"
                       :keystore-type    "pkcs12"
                       :ks-scan-interval ks-scan-interval
                       :key-password     "foobar"}))]
    (if (and (not has-key?) https-port)
      (println "ERROR:\n"
               "  An SSL key is required if an HTTPS port is specified.\n"
               "  Create an SSL key for HTTPS or run without the --https-port (-P) option.")
      (do
        (when repl
          (println "Starting nREPL server on port 5555")
          (reset! repl-server (nrepl-server/start-server :port 5555 :handler cider-nrepl-handler)))
        (reset! server (run-jetty handler config))
        (reset! scheduling-service (start-scheduling-service!))
        (set-log-path! log-dir)
        (when (available?) (ready!))))))

(defn stop-server! []
  (set-log-path! "")
  (when @scheduling-service
    (future-cancel @scheduling-service)
    (reset! scheduling-service nil))
  (when @server
    (.stop @server)
    (reset! server nil)
    (System/exit 0)))

(defn send-to-repl-server! [msg & {:keys [host port] :or {host "127.0.0.1" port 5555}}]
  (if (socket-open? host port)
    (do (send-to-server! host port msg)
        (System/exit 0))
    (do (println (format "Unable to connect to REPL server at %s:%s. Restart the server with the '-r/--repl' flag." host port))
        (System/exit 1))))

(defn stop-running-server! []
  (send-to-repl-server! "(do (require '[comimo.server :as server]) (server/stop-server!))"))

(defn reload-running-server! []
  (send-to-repl-server! "(require 'comimo.server :reload-all)"))

(defn -main [& args]
  (let [{:keys [action options]} (get-cli-options args
                                                  cli-options
                                                  cli-actions
                                                  "server"
                                                  (get-config :server))]
    (case action
      :start  (start-server! options)
      :stop   (stop-running-server!)
      :reload (reload-running-server!)
      nil)))
