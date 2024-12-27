(ns comimo.py-interop
  (:require [clojure.string             :as str]
            [libpython-clj2.python      :refer [py. get-attr ->jvm]]
            [libpython-clj2.python.copy :refer [*item-tuple-cutoff*]]
            [libpython-clj2.require     :refer [require-python]]
            [triangulum.config          :refer [get-config]]
            [triangulum.database        :refer [call-sql]]
            [triangulum.logging         :refer [log-str]]
            [triangulum.response        :refer [data-response]]
            [triangulum.type-conversion :as tc]))

;;; Constants

(def ^:private max-age (* 24 60 60 1000)) ; Once a day
(def validation-layers-location "projects/earth-engine-comimo/assets/validation-centroids")
(def prediction-layers-location "projects/earth-engine-comimo/assets/validation-plots")

;;; Macros

(defmacro run-with-timeout
  "Run a function (`body`) while waiting a specific amount of time (`wait-ms`).
   If the body takes longer that the provided amount of time, `:timeout-reached` is returned.
   Example usage:
   (run-with-timeout 2000 (+ 1 2)) ;=> 3
   (run-with-timeout 2000 (Thread/sleep 1000) (+ 1 2)) ;=> 3
   (run-with-timeout 2000 (Thread/sleep 3000) (+ 1 2)) ;=> :timeout-reached"
  [wait-ms & body]
  `(let [f#      (future ~@body)
         result# (deref f# ~wait-ms :timeout-reached)]
     (when (= result# :timeout-reached)
       (future-cancel f#))
     result#))

;;; GEE Python interface

(require-python '[sys :bind-ns])
(py. (get-attr sys "path") "append" "src/py")
(require-python '[gee.utils :as utils])

(defonce last-initialized (atom 0))

(defn- check-initialized []
  (when (> (- (System/currentTimeMillis) @last-initialized) max-age)
    (let [ee-account  (get-config ::ee-account)
          ee-key-path (get-config ::ee-key-path)]
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
  (run-with-timeout 6000000
                    (check-initialized)
                    (binding [*item-tuple-cutoff* 0]
                      (try (->jvm (apply py-fn params))
                           (catch Exception e
                             (let [parsed (parse-py-errors e)]
                               (log-str parsed)
                               parsed))))))

;;; Utils

(defn get-points-within [data-layer regions]
  (py-wrapper utils/getPointsWithin (str validation-layers-location "/" data-layer) regions))

(defn location-in-country [lat lng]
  (py-wrapper utils/locationInCountry lat lng))

;;; Image Cache

(defonce image-max-age         (* 60 60 1000)) ; Once an hour
(defonce image-cache           (atom nil))
(defonce image-cache-timestamp (atom 0))

(defn- image-cached? []
  (and (< (- (System/currentTimeMillis) @image-cache-timestamp) image-max-age)
       (seq @image-cache)))

(defn- reset-image-cache! []
  (reset! image-cache-timestamp (System/currentTimeMillis))
  (reset! image-cache (py-wrapper utils/getImageList prediction-layers-location)))

(defn get-image-list []
  (when-not (image-cached?)
    (reset-image-cache!))
  @image-cache)

;;; Routes

(defn get-image-names [_]
  (let [image-list (get-image-list)]
    (data-response {:cMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-C" %) image-list)
                    :nMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-N" %) image-list)
                    :pMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-P" %) image-list)})))

(def vector-layers {:cMines              {:source     "projects/earth-engine-comimo/assets/validation-plots"
                                          :info-cols   ["ID"]
                                          :line        "purple"
                                          :fill        "purple"}
                    :nMines              {:source      "projects/earth-engine-comimo/assets/validation-plots"
                                          :info-cols   ["ID"]
                                          :line        "red"
                                          :fill        "red"}
                    :pMines              {:source      "projects/earth-engine-comimo/assets/validation-plots"
                                          :info-cols   ["ID"]
                                          :line        "orange"
                                          :fill        "orange"}
                    :municipalBounds     {:source      "users/comimoapp/Shapes/Municipal_Bounds"
                                          :info-cols   ["MPIO_CNMBR" "DPTO_CNMBR"]
                                          :line        "#f66"
                                          :fill        "#0000"}
                    :legalMines          {:source      "users/comimoapp/Shapes/Legal_Mines"
                                          :info-cols   ["ID"]
                                          :line        "#ff0"
                                          :fill        "#ffff0022"}
                    :otherAuthorizations {:source      "users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010"
                                          :info-cols   ["ID"]
                                          :line        "#047"
                                          :fill        "#00447722"}
                    :tierrasDeCom        {:source      "users/comimoapp/Shapes/Tierras_de_comunidades_negras"
                                          :info-cols   ["NOMBRE"]
                                          :line        "#fd9"
                                          :fill        "#ffdd9922"}
                    :resguardos          {:source      "users/comimoapp/Shapes/Resguardos_Indigenas"
                                          :info-cols   ["NOMBRE"]
                                          :line        "#d9d"
                                          :fill        "#dd99dd22"}
                    :protectedAreas      {:source      "users/comimoapp/Shapes/RUNAP"
                                          :info-cols   ["categoria" "nombre"]
                                          :line        "#35f0ab"
                                          :fill        "#35f0ab22"}
                    :licensedMining      {:source      "users/comimoapp/Shapes/ANLA_Mineria_Licenciada"
                                          :info-cols   ["operador"]
                                          :line        "#86CAFF"
                                          :fill        "#86CAFF22"}})
;; TODO we should return "" when not layer
(defn get-image-url [{:keys [params]}]
  (let [layer-type (keyword (:type params))
        opts       (layer-type vector-layers)
        data-layer (:dataLayer params)]
    (data-response  (if (= layer-type :NICFI)
                      "get-nicfi-tiles?z={z}&x={x}&y={y}"
                      (if-not opts
                        ""
                        (let [{:keys [source line fill]} opts]
                          (py-wrapper utils/getVectorUrl
                                      (if data-layer (str source "/" data-layer) source)
                                      line
                                      fill)))))))

(defn get-download-url [{:keys [params]}]
  (let [{:keys [region dataLayer]} params]
    (data-response (py-wrapper utils/getDownloadURL
                               (str prediction-layers-location "/" dataLayer)
                               region))))

(defn- get-subscribed-regions [user-id]
  (->> (call-sql "get_user_subscriptions" user-id)
       (map :region)))

(defn combine-stats [{:strs [names count]}]
  (zipmap names count))

(defn get-stats-by-region [{:keys [params session]}]
  (let [user-id    (tc/val->int (:userId session))
        data-layer (:dataLayer params)]
    (->> (py-wrapper utils/statsByRegion
                     (str prediction-layers-location "/" data-layer)
                     (get-subscribed-regions user-id))
         (combine-stats)
         (filterv (fn [[_k v]] (> v 0.0)))
         (data-response))))

(defn get-stat-totals [{:keys [params session]}]
  (let [user-id    (tc/val->int (:userId session))]
    (->> (py-wrapper utils/statsTotals
                     (str prediction-layers-location)
                     (get-subscribed-regions user-id))
         (mapv (fn [[k v]]
                 (let [[a b _ c d] (str/split k #"-")
                       new-k     (format "%s/%s a %s/%s" b (subs a 2) d (subs c 2))]
                   [new-k v])))
         (data-response))))

(defn get-info [{:keys [params]}]
  (let [visible-layers (:visibleLayers params)
        alert-dates    (:dates params)
        lat            (tc/val->double (:lat params))
        lng            (tc/val->double (:lng params))]
    (data-response (->> visible-layers
                        (pmap
                         (fn [v]
                           [v (let [layer (keyword v)
                                    {:keys [source source-base info-cols]} (get vector-layers layer)]
                                (if (#{:cMines :nMines :pMines} layer)
                                  (py-wrapper utils/mineExists (str source "/" (alert-dates layer)) lat lng)
                                  (py-wrapper utils/vectorPointOverlaps source lat lng info-cols)))]))
                        (into {})))))
