(ns comimo.handler
  (:require [clojure.data.json :as json]
            [clojure.edn       :as edn]
            [clojure.string    :as str]
            [clojure.set       :as set]
            [ring.middleware.absolute-redirects :refer [wrap-absolute-redirects]]
            [ring.middleware.content-type       :refer [wrap-content-type]]
            [ring.middleware.default-charset    :refer [wrap-default-charset]]
            [ring.middleware.gzip               :refer [wrap-gzip]]
            [ring.middleware.json               :refer [wrap-json-params]]
            [ring.middleware.keyword-params     :refer [wrap-keyword-params]]
            [ring.middleware.nested-params      :refer [wrap-nested-params]]
            [ring.middleware.not-modified       :refer [wrap-not-modified]]
            [ring.middleware.multipart-params   :refer [wrap-multipart-params]]
            [ring.middleware.params             :refer [wrap-params]]
            [ring.middleware.resource           :refer [wrap-resource]]
            [ring.middleware.reload             :refer [wrap-reload]]
            [ring.middleware.session            :refer [wrap-session]]
            [ring.middleware.session.cookie     :refer [cookie-store]]
            [ring.middleware.ssl                :refer [wrap-ssl-redirect]]
            [ring.middleware.x-headers          :refer [wrap-frame-options
                                                        wrap-content-type-options
                                                        wrap-xss-protection]]
            [ring.util.response                 :refer [redirect]]
            [ring.util.codec                    :refer [url-encode]]
            [triangulum.logging                 :refer [log-str]]
            [triangulum.config                  :refer [get-config]]
            [triangulum.handler                 :refer [nil-on-error
                                                        forbidden-response
                                                        no-cross-traffic?]]
            [triangulum.type-conversion         :as tc]
            [comimo.routing                     :refer [routes]]
            [triangulum.views                   :refer [not-found-page data-response]]
            [comimo.db.projects                 :refer [can-collect?]]
            [comimo.db.users                    :refer [is-admin?]]))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Routing Handler
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn- redirect-auth [user-id]
  (fn [request]
    (let [{:keys [query-string uri]} request
          full-url                   (url-encode (str uri (when query-string (str "?" query-string))))]
      (if (pos? user-id)
        (redirect (str "/home?flash_message=You do not have permission to access "
                       full-url))
        (redirect (str "/login?returnurl="
                       full-url
                       "&flash_message=You must login to see "
                       full-url))))))

(defn authenticated-routing-handler [{:keys [uri request-method params headers] :as request}]
  (let [{:keys [auth-type auth-action handler] :as route} (get routes [request-method uri])
        user-id                                           (:userId params -1)
        project-id                                        (tc/val->int (:projectId params))
        plot-id                                           (tc/val->int (:plotId params))
        next-handler                                      (if route
                                                            (if (condp = auth-type
                                                                  :user     (pos? user-id)
                                                                  :collect  (can-collect? user-id project-id plot-id)
                                                                  :admin    (is-admin? user-id)
                                                                  :no-cross (no-cross-traffic? headers)
                                                                  true)
                                                              handler
                                                              (if (= :redirect auth-action)
                                                                (redirect-auth user-id)
                                                                forbidden-response))
                                                            not-found-page)]
    (next-handler request)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Custom Middlewares
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn wrap-bad-uri [handler]
  (fn [request]
    (if (str/includes? (str/lower-case (:uri request)) "php")
      (forbidden-response nil)
      (handler request))))

(defn wrap-request-logging [handler]
  (fn [request]
    (let [{:keys [uri request-method params]} request
          param-str (pr-str (dissoc params :password :passwordConfirmation))]
      (log-str "Request(" (name request-method) "): \"" uri "\" " param-str)
      (handler request))))

(defn wrap-response-logging [handler]
  (fn [request]
    (let [{:keys [status headers body] :as response} (handler request)
          content-type (headers "Content-Type")]
      (log-str "Response(" status "): "
               (cond
                 (instance? java.io.File body)
                 (str content-type " file")

                 (= content-type "application/edn")
                 (binding [*print-length* 2] (print-str (edn/read-string body)))

                 (= content-type "application/json")
                 (binding [*print-length* 2] (print-str (nil-on-error (json/read-str body))))

                 :else
                 (str content-type " response")))
      response)))


(def updatable-session-keys [])

(defn wrap-persistent-session [handler]
  (fn [request]
    (let [{:keys [params session]} request
          to-update    (select-keys params updatable-session-keys)
          session      (apply dissoc session (keys to-update))
          intersection (set/intersection (set (keys params)) (set (keys session)))
          response     (handler (update request :params merge session))]
      (when-not (empty? intersection)
        (log-str "WARNING! The following params are being overwritten by session values: " intersection))
      (if (and (contains? response :session)
               (nil? (:session response)))
        response
        (update response :session #(merge session to-update %))))))

(defn wrap-exceptions [handler]
  (fn [request]
    (try
      (handler request)
      (catch Exception e
        (let [{:keys [data cause]} (Throwable->map e)
              status (:status data)]
          (log-str "Error: " cause)
          (data-response cause {:status (or status 500)}))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Handler Stack
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn optional-middleware [handler mw use?]
  (if use?
    (mw handler)
    handler))

(defn- string-to-bytes [^String s] (.getBytes s))

(defn create-handler-stack [ssl? reload?]
  (-> authenticated-routing-handler
      (optional-middleware wrap-ssl-redirect ssl?)
      wrap-bad-uri
      wrap-request-logging
      wrap-persistent-session
      wrap-keyword-params
      wrap-json-params
      wrap-nested-params
      wrap-multipart-params
      wrap-params
      (wrap-session {:store (cookie-store {:key (string-to-bytes (get-config :session-key))})})
      wrap-absolute-redirects
      (wrap-resource "public")
      wrap-content-type
      (wrap-default-charset "utf-8")
      wrap-not-modified
      (wrap-xss-protection true {:mode :block})
      (wrap-frame-options :sameorigin)
      (wrap-content-type-options :nosniff)
      wrap-response-logging
      wrap-gzip
      wrap-exceptions
      (optional-middleware wrap-reload reload?)))
