(ns comimo.migrate
  (:require [triangulum.database :refer [call-sqlite insert-rows!]]))

(def sql-str "select username,
              accounts_profile.email,
              institution,
              full_name,
              default_lang,
              case when is_superuser = 1 then 'admin' else 'user' end as role,
              'changeme' as password
              from auth_user
              inner join accounts_profile
              on user_id = auth_user.id")

(defn migrate-users [sqlite-file]
  (->> (call-sqlite sql-str sqlite-file)
       (map #(assoc % :verified true))
       (insert-rows! "users")))

(defn -main [sqlite-file]
  (migrate-users sqlite-file)
  (shutdown-agents))
