(ns comimo.py-interop
  (:require [clojure.string :as str]
            [libpython-clj2.require :refer [require-python]]
            [libpython-clj2.python  :refer [py. get-attr ->jvm]]
            [libpython-clj2.python.copy :refer [*item-tuple-cutoff*]]
            [triangulum.config :refer [get-config]]
            [triangulum.database :refer [call-sql]]
            [triangulum.logging :refer [log-str]]
            [triangulum.type-conversion :as tc]
            [triangulum.response :refer [data-response]]))

;;; Constants

(def ^:private max-age (* 24 60 1000)) ; Once a day
(def point-location "users/comimoapp/ValidationPoints")
(def image-location "users/comimoapp/Images")

;;; GEE Python interface

(require-python '[sys :bind-ns])
(py. (get-attr sys "path") "append" "src/py")
(require-python '[gee.utils :as utils])

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
         (catch Exception e
           (let [parsed (parse-py-errors e)]
             (log-str parsed)
             parsed)))))

;;; Utils

(defn get-points-within [data-layer regions]
  (py-wrapper utils/getPointsWithin (str point-location "/" data-layer) regions))

(defn location-in-country [lat lng]
  (py-wrapper utils/locationInCountry lat lng))

;; For now this isnt generic.
(defn get-image-list []
  (py-wrapper utils/getImageList image-location))

;;; Routes

(defn get-image-names [_]
  (let [image-list (get-image-list)]
    (data-response {:cMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-C" %) image-list)
                    :nMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-N" %) image-list)
                    :pMines (filter #(re-matches #"\d{4}-\d{2}-\d{2}-P" %) image-list)})))

(def image-options {"NICFI"               {:source-type :wms :source "get-nicfi-tiles?z={z}&x={x}&y={y}"}
                    "cMines"              {:source-type :image :source-base image-location :color "purple"}
                    "nMines"              {:source-type :image :source-base image-location :color "red"}
                    "pMines"              {:source-type :image :source-base image-location :color "orange"}
                    "municipalBounds"     {:source-type :vector
                                           :source      "users/comimoapp/Shapes/Municipal_Bounds"
                                           :info-cols   ["MPIO_CNMBR" "DPTO_CNMBR"]
                                           :line        "#f66"
                                           :fill        "#0000"}
                    "legalMines"          {:source-type :vector
                                           :source      "users/comimoapp/Shapes/Legal_Mines"
                                           :info-cols   ["ID"]
                                           :line        "#ff0"
                                           :fill        "#ffff0011"}
                    "otherAuthorizations" {:source-type :vector
                                           :source      "users/comimoapp/Shapes/Solicitudes_de_Legalizacion_2010"
                                           :info-cols   ["ID"]
                                           :line        "#047"
                                           :fill        "#00447711"}
                    "tierrasDeCom"        {:source-type :vector
                                           :source      "users/comimoapp/Shapes/Tierras_de_comunidades_negras"
                                           :info-cols   ["NOMBRE"]
                                           :line        "#fd9"
                                           :fill        "#ffdd9911"}
                    "resguardos"          {:source-type :vector
                                           :source      "users/comimoapp/Shapes/Resguardos_Indigenas"
                                           :info-cols   ["NOMBRE"]
                                           :line        "#d9d"
                                           :fill        "#dd99dd11"}
                    "protectedAreas"      {:source-type :vector
                                           :source      "users/comimoapp/Shapes/RUNAP"
                                           :info-cols   ["categoria" "nombre"]
                                           :line        "#35f0ab"
                                           :fill        "#dd99dd11"}})

(defn get-image-url [{:keys [params]}]
  (let [image-type (:type params)
        opts       (get image-options image-type)]
    (-> (case (:source-type opts)
          :vector (let [{:keys [source line fill]} opts]
                    (py-wrapper utils/getVectorUrl source line fill))

          :image (let [data-layer                  (:dataLayer params)
                       {:keys [source-base color]} opts]
                   (py-wrapper utils/getImageUrl (str source-base "/" data-layer) color))

          :wms (:source opts)

          "")
        (data-response))))

(defn get-download-url [{:keys [params]}]
  (let [{:keys [region dataLayer]} params]
    (data-response (py-wrapper utils/getDownloadURL
                               (str image-location "/" dataLayer)
                               region
                               540))))

(defn- get-subscribed-regions [user-id]
  (->> (call-sql "get_user_subscriptions" user-id)
       (map :region)))

(defn combine-stats [{:strs [names count]}]
  (zipmap names count))

(defn get-stats-by-region [{:keys [params]}]
  (let [user-id    (tc/val->int (:userId params))
        data-layer (:dataLayer params)]
    (->> (py-wrapper utils/statsByRegion
                     (str image-location "/" data-layer)
                     (get-subscribed-regions user-id))
         (combine-stats)
         (filterv (fn [[_k v]] (> v 0.0)))
         (data-response))))

(defn get-stat-totals [{:keys [params]}]
  (let [user-id    (tc/val->int (:userId params))]
    (->> (py-wrapper utils/statTotals
                     (str image-location)
                     (get-subscribed-regions user-id))
         (mapv (fn [[k v]]
                 (let [[a b _ c d] (str/split k #"-")
                       new-k     (format "%s/%s a %s/%s" b (subs a 2) d (subs c 2))]
                   [new-k v])))
         (data-response))))

(defn get-info [{:keys [params]}]
  (let [visible-layers (:visibleLayers params)
        mine-dates     (:dates params)
        lat            (tc/val->double (:lat params))
        lng            (tc/val->double (:lng params))]
    (data-response (->> visible-layers
                        (pmap
                         (fn [v]
                           [v (let [{:keys [source-type source source-base info-cols]} (get image-options v)]

                                (case source-type
                                  :image (py-wrapper utils/imagePointExists
                                                     (str source-base "/" (get mine-dates (keyword v)))
                                                     lat
                                                     lng)

                                  :vector (py-wrapper utils/vectorPointOverlaps source lat lng info-cols)

                                  ""))]))
                        (into {})))))
