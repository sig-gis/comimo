(ns comimo.proxy
  (:require [clojure.string  :as str]
            [clj-http.client :as client]
            [triangulum.type-conversion :as tc]
            [triangulum.utils           :as u]
            [comimo.db.imagery :refer [get-imagery-source-config]]))

(defn get-nicfi-dates [_])
