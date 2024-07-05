from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
import hashlib
import time


class UserLogin(BaseModel):
    username:str
    password_user:str

class UserBase(UserLogin):
    nome:str
    cognome:str
    
class User(UserBase):
    descrizione:str
    url_profilo:str
    url_back_profilo:str

time.sleep(4)


db = mysql.connector.connect(
  host="192.168.0.120",
  user="root",
  password="sparks_db",
  database="sparks_db"
)

app = FastAPI()

@app.get("/allfeeds/{username}")
def getAllFeedsOfFollowings():
    return {"res":"feeds"}

@app.get("/getUser/{username}")
def getUser(username:str):
    cursor = db.cursor()
    cursor.execute(f"SELECT * FROM utenti WHERE utenti.username = '{username}'")
    result = cursor.fetchone()
    userout = {}
    if(result):
        userout = {
            "username":result[0],
            "nome":result[2],
            "cognome":result[3],
            "url_profilo":result[4],
            "url_back":result[5],
            "descrizione":result[6]
        }
    return{"userout":userout}

@app.post("/login")
def login(userlogin:UserLogin):
    is_correct_username = False
    is_correct_password = False
    userlogin.password_user = getMD5HashOfPassword(userlogin.password_user)
    cursor = db.cursor()
    cursor.execute(f"SELECT utenti.username FROM utenti WHERE utenti.username = '{userlogin.username}'")
    if(cursor.fetchone()):
        is_correct_username = True
        cursor.execute(f"SELECT utenti.username FROM utenti WHERE utenti.username = '{userlogin.username}' AND utenti.password_user = '{userlogin.password_user}'")
        if(cursor.fetchone()):
            is_correct_password = True  

    return {"is_correct_username":is_correct_username,"is_correct_pass":is_correct_password}


@app.post("/signup")
def signup(userbase:UserBase):
    if (not checkUserSignUp(userbase.username)):
        cursor = db.cursor()
        sql = "INSERT INTO utenti(username, password_user,nome, cognome) VALUES (%s, %s,%s, %s)"
        userbase.password_user = getMD5HashOfPassword(userbase.password_user)
        val = (userbase.username,userbase.password_user,userbase.nome,userbase.cognome)
        cursor.execute(sql, val)
        db.commit()
        return {"res": True , "user": userbase}
    else:
        return {"res": False , "user": userbase}
    

@app.post("/modifyUser")
def modifyUser(user:User):
    return {"res": user}

def getMD5HashOfPassword(password:str):
    pass_hash = hashlib.md5(password.encode())
    return pass_hash.hexdigest()

def checkPassword(pass1:str,pass2:str):
    pass1 = getMD5HashOfPassword(pass1)
    return pass1 == pass2


def checkUserSignUp(username:str):
    cursor = db.cursor()
    cursor.execute(f"SELECT utenti.username FROM utenti WHERE utenti.username = '{username}'")
    return cursor.fetchone()

    

