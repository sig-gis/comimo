(ns comimo.proxy
  (:require [clojure.data.json :as json]
            [clojure.string    :as str]
            [clj-http.client   :as client]
            [triangulum.config :refer [get-config]]
            [comimo.views      :refer [data-response]]))

;;; Option cache

(def ^:private cache-max-age     (* 24 60 1000)) ; Once a day
(def ^:private nicfi-layer-cache (atom nil))
(def ^:private cached-time       (atom nil))

(defn- reset-cache! [layers]
  (reset! cached-time (System/currentTimeMillis))
  (reset! nicfi-layer-cache layers))

(defn- valid-cache? []
  (and (some? @nicfi-layer-cache)
       (< (- (System/currentTimeMillis) @cached-time) cache-max-age)))

;;; Fill cache

(defn nicfi-dates []
  (as-> (client/get (str "https://api.planet.com/basemaps/v1/mosaics?api_key=" (get-config :nicfi-key))) $
    (:body $)
    (json/read-str $ :key-fn keyword)
    (:mosaics $)
    (map :name $)
    (filterv #(str/includes? % "normalized") $)
    (reverse $)))

;;; Routes

(defn get-nicfi-dates [& _]
  (when-not (valid-cache?)
    (reset-cache! (nicfi-dates)))
  (data-response @nicfi-layer-cache))

(defn get-nicfi-tiles [{:keys [params]}]
  (let [{:keys [x y z dataLayer band]} params]
    (client/get (format "https://tiles0.planet.com/basemaps/v1/planet-tiles/%s/gmap/%s/%s/%s.png?proc=%s&api_key=%s"
                        dataLayer z x y band (get-config :nicfi-key))
                {:as :stream})))
