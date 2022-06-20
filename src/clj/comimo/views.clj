(ns comimo.views
  (:require [clojure.data.json   :as json]
            [clojure.java.io     :as io]
            [clojure.string      :as str]
            [cognitect.transit   :as transit]
            [hiccup.page         :refer [html5 include-js include-css]]
            [triangulum.config   :refer [get-config]]
            [triangulum.database :refer [call-sql]])
  (:import java.io.ByteArrayOutputStream))

(defn kebab->camel [kebab]
  (let [pieces (str/split kebab #"-")]
    (apply str (first pieces) (map str/capitalize (rest pieces)))))

(defn head [extra-js lang]
  (let [title       {:en "Colombian Mining Monitoring"
                     :es "Monitoreo Minero Colombiano"}
        description {:en "Colombian Mining Monitoring (CoMiMo) is an online mining monitoring application that uses machine learning and satellite imagery to alert government authorities, NGOs and concerned citizens about possible mining activities anywhere in Colombia, and enables them to assess the location, lawfulness and potential impacts to the environment of those mines."
                     :es "Monitoreo Minero Colombiano (CoMiMo) es una aplicación de monitoreo minero en línea que utiliza aprendizaje automático e imágenes satelitales para alertar a las autoridades gubernamentales, ONGs y ciudadanos preocupados sobre posibles actividades mineras en cualquier lugar de Colombia, y les permite evaluar la ubicación, la legalidad y los posibles impactos al entorno de esas minas."}
        keywords    {:en "colombian mining monitoring, comimo, satellite imagery, illegal mining, machine learning, image analysis, detection, crowdsourcing"
                     :es "monitoreo minero colombiano, comimo, imágenes satelitales, minería ilegal, aprendizaje automático, análisis de imágenes, detección, crowdsourcing"}]
    [:head
     [:title (title lang)]
     [:meta {:charset "utf-8"}]
     [:meta {:name "viewport" :content "width=device-width, user-scalable=no"}]
     [:meta {:name "description" :content (description lang)}]
     [:meta {:name "keywords" :content (keywords lang)}]
     [:link {:rel "shortcut icon" :href "favicon.ico"}]
     (when-let [ga-id (get-config :ga-id)]
       (list [:script {:async true :src (str "https://www.googletagmanager.com/gtag/js?id=" ga-id)}]
             [:script (str "window.dataLayer = window.dataLayer || []; function gtag() {dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '" ga-id "', {'page_location': location.host + location.pathname});")]))
     (include-css "/css/bootstrap-grid.min.4.3.1.css"
                  "/css/gmw_global.css"
                  "/css/gmw_main.css")   ; only home
     (apply include-js
            "/js/google-charts.js"
            "/js/jquery-3.4.1.min.js"
            extra-js)]))

(defn uri->page [uri]
  (->> (str/split uri #"/")
       (remove str/blank?)
       (first)
       (kebab->camel)))

(defn js-init [page params]
  (let [js-params (-> params
                      (assoc
                       :mapboxToken (get-config :mapbox-token)
                       :mapquestKey (get-config :mapquest-key))
                      (json/write-str))]
    [:script {:type "text/javascript"}
     (str "window.onload = function () {" page ".pageInit(" js-params "); };")]))

(defn find-webpack-files [page]
  (as-> (slurp "target/entry-points.json") wp
    (json/read-str wp)
    (get wp page)))

(defn- announcement-banner []
  (let [announcement (slurp "announcement.txt")] ; TODO This will be moved to the front end for better UX.
    [:div#banner {:style {:background-color "#f96841"
                          :box-shadow       "3px 1px 4px 0 rgb(0, 0, 0, 0.25)"
                          :color            "#ffffff"
                          :display          (if (pos? (count announcement)) "block" "none")
                          :margin           "0px"
                          :padding          "5px"
                          :position         "fixed"
                          :text-align       "center"
                          :top              "0"
                          :right            "0"
                          :left             "0"
                          :width            "100vw"
                          :z-index          "10000"}}
     [:script {:type "text/javascript"}
      "setTimeout (function () {document.getElementById ('banner') .style.display='none'}, 10000);"]
     [:p {:style {:font-size   "18px"
                  :font-weight "bold"
                  :margin      "0 30px 0 0"}}
      announcement]
     [:button {:style   {:background-color "transparent"
                         :border-color     "#ffffff"
                         :border-radius    "50%"
                         :border-style     "solid"
                         :border-width     "2px"
                         :cursor           "pointer"
                         :display          "flex"
                         :height           "25px"
                         :padding          "0"
                         :position         "fixed"
                         :right            "10px"
                         :top              "5px"
                         :width            "25px"}
               :onClick "document.getElementById('banner').style.display='none'"}
      [:svg {:viewBox "0 0 48 48" :fill "#ffffff"}
       [:path {:d "M38 12.83l-2.83-2.83-11.17 11.17-11.17-11.17-2.83 2.83 11.17 11.17-11.17 11.17 2.83 2.83
                     11.17-11.17 11.17 11.17 2.83-2.83-11.17-11.17z"}]]]]))

(defn render-page [uri]
  (fn [request]
    (let [page          (uri->page uri)
          webpack-files (find-webpack-files page)
          user-id       (-> request :params :userId)
          user          (first (call-sql "get_user_information" user-id))
          lang          (:default-lang user :en)]
      {:status  200
       :headers {"Content-Type" "text/html"}
       :body    (html5
                 (head webpack-files lang)
                 [:body
                  (if (seq webpack-files)
                    [:section
                     ;; TODO These will be moved to the front end for better UX.
                     (when-let [flash-message (get-in request [:params :flash_message])]
                       [:p {:class "alert"} flash-message])
                     (when (.exists (io/as-file "announcement.txt"))
                       (announcement-banner))
                     [:div#main-container]]
                    [:label "No webpack files found. Check if webpack is running, or wait for it to finish compiling."])
                  (js-init page (:params request))])})))

(defn not-found-page [request]
  (-> request
      ((render-page "/page-not-found"))
      (assoc :status 404)))

(defn body->transit [body]
  (let [out    (ByteArrayOutputStream. 4096)
        writer (transit/writer out :json)]
    (transit/write writer body)
    (.toString out)))

(defn data-response
  "Create a response object.
   Body is required. Status, type, and session are optional.
   When a type keyword is passed, the body is converted to that type,
   otherwise the body and type are passed through."
  ([body]
   (data-response body {}))
  ([body {:keys [status type session]
          :or   {status 200 type :json}
          :as   params}]
   (merge (when (contains? params :session) {:session session})
          {:status  status
           :headers {"Content-Type" (condp = type
                                      :edn     "application/edn"
                                      :transit "application/transit+json"
                                      :json    "application/json"
                                      type)}
           :body    (condp = type
                      :edn     (pr-str         body)
                      :transit (body->transit  body)
                      :json    (json/write-str body)
                      body)})))
