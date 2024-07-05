import mysql.connector
import hashlib
db = mysql.connector.connect(
  host="192.168.0.120",
  user="root",
  password="sparks_db",
  database="sparks_db"
)

cursor = db.cursor()
cursor.execute(f"SELECT * FROM utenti WHERE utenti.username = 'string';")
result = cursor.fetchone()
out = {
    "username":result[0],
    "nome":result[2],
    "cognome":result[3],
    "url_profilo":result[4],
    "url_back":result[5],
    "descrizione":result[6]
}

print(out)
