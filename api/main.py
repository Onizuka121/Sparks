from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector,hashlib
import time,datetime
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class followBase(BaseModel):
    username_seguente:str
    username_seguito:str    

def getDateOfNowFormatted():
    x = datetime.datetime.now()
    return x.strftime("%Y")+"-"+x.strftime("%m")+"-"+x.strftime("%d")

class Feed(BaseModel):
    cod_feed:int
    descrizione:str
    url_foto_feed:str
    data_inserimento:str
    username_inser:str
    url_foto_user_feed:str

class ChatModel(BaseModel):
    destinatario:str
    mittente:str

class ChatModelInfo(ChatModel):
    cod_mess:int
    ora:str
    messaggio:str
    url_foto_profilo_dest:str

time.sleep(4)

db = mysql.connector.connect(
  host=os.getenv("DB_HOST"),
  user=os.getenv('DB_USER'),
  password=os.getenv('DB_PASSWORD'),
  database=os.getenv('DB_NAME')
)


@app.get("/allfeeds/{username}")
async def getAllFeedsOfFollowings(username:str):
    cursor = db.cursor()
    cursor.execute(f"SELECT feeds.*,utenti.url_foto_profilo FROM feeds INNER JOIN seguiti ON feeds.username_inser = seguiti.username_seguito INNER JOIN utenti ON utenti.username = feeds.username_inser WHERE seguiti.username_seguente  = '{username}' ORDER BY feeds.data_inserimento DESC")
    result = cursor.fetchall()
    feeds = []
    for feed in result:
        x = feed[3]
        date = x.strftime("%d")+" "+x.strftime("%B")+" "+x.strftime("%Y")
        url_foto = feed[5]
        if(not feed[5]):
            url_foto = "default.png"
        tmp_feed = Feed(
            cod_feed=feed[0],
            descrizione=feed[1],
            url_foto_feed=feed[2],
            data_inserimento=date,
            username_inser=feed[4],
            url_foto_user_feed=url_foto
        )
        feeds.append(tmp_feed)

    return {"feeds":feeds}

@app.get("/getAllUserFeeds/{username}")
async def getAllUserFeeds(username:str):
    cursor = db.cursor()
    cursor.execute(f'''
        SELECT feeds.*,utenti.url_foto_profilo
        FROM feeds
        INNER JOIN utenti ON utenti.username = feeds.username_inser
        WHERE feeds.username_inser = '{username}'
        ORDER BY feeds.data_inserimento DESC
                ''')
    result = cursor.fetchall()
    feeds = []
    for feed in result:
        x = feed[3]
        date = x.strftime("%d")+" "+x.strftime("%B")+" "+x.strftime("%Y")
        url_foto = feed[5]
        if(not feed[5]):
            url_foto = "default.png"
        tmp_feed = Feed(
            cod_feed=feed[0],
            descrizione=feed[1],
            url_foto_feed=feed[2],
            data_inserimento=date,
            username_inser=feed[4],
            url_foto_user_feed=url_foto
        )
        feeds.append(tmp_feed)

    return {"feeds":feeds}

@app.put("/insertFeed")
async def insertFeed(feed:Feed):
    feed.data_inserimento = getDateOfNowFormatted()
    cursor = db.cursor()
    sql = "INSERT INTO feeds(descrizione, url_foto_feed ,data_inserimento, username_inser) VALUES (%s, %s,%s, %s)"
    val = (feed.descrizione,feed.url_foto_feed,feed.data_inserimento,feed.username_inser)
    cursor.execute(sql, val)
    db.commit()
    return {"res":True}

@app.delete("/removeFeed/{cod_feed}")
async def removeFeed(cod_feed:int):
    cursor = db.cursor()
    sql = f"DELETE FROM feeds WHERE feeds.cod_feed = {cod_feed}"
    cursor.execute(sql)
    db.commit()
    return {"res":cursor.rowcount}
    

@app.get("/getUser/{username}")
async def getUser(username:str):
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
    return{"userout":userout,
           "data_followings_followers":getNumberOfFollowersFollowings(username)}


@app.post("/login")
async def login(userlogin:UserLogin):
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

    return {"is_correct_username":is_correct_username,"is_correct_pass":is_correct_password,"pass_hash":userlogin.password_user}


@app.post("/signup")
async def signup(userbase:UserBase):
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
async def modifyUser(user:User):
    cursor = db.cursor()
    sql = f"""UPDATE utenti 
    SET nome = '{user.nome}',
    cognome = '{user.cognome}',
    descrizione = '{user.descrizione}',
    url_foto_profilo = '{user.url_profilo}',
    url_foto_background_profilo = '{user.url_back_profilo}'
    WHERE username = '{user.username}'"""
    cursor.execute(sql)
    db.commit()
    return {"res": user}


@app.post("/follow")
async def follow(followBase:followBase):
    if(not checkFollow(followBase)):
        cursor = db.cursor()
        sql = "INSERT INTO seguiti(username_seguente, username_seguito) VALUES (%s, %s)"
        val = (followBase.username_seguente,followBase.username_seguito)
        cursor.execute(sql, val)
        db.commit()
        return {"res_follow":True}
    else:
        return {"res_follow":False}
    
@app.post("/unfollow")
async def follow(followBase:followBase):
    if(checkFollow(followBase)):
        cursor = db.cursor()
        sql = f"DELETE FROM seguiti WHERE seguiti.username_seguito = '{followBase.username_seguito}' AND seguiti.username_seguente = '{followBase.username_seguente}'"
        cursor.execute(sql)
        db.commit()
        return {"res_follow":True}
    else:
        return {"res_follow":False}




@app.get("/getUsernameFollowings/{username}")
async def getUsernameFollowings(username:str):
    cursor = db.cursor()
    cursor.execute(f"""SELECT username_seguito,utenti.url_foto_profilo
                    FROM seguiti 
                    INNER JOIN utenti
                    ON seguiti.username_seguito = utenti.username
                    WHERE username_seguente = '{username}';""")
    usernames = []
    for followings in cursor.fetchall():
        usernames.append({
            "username":followings[0],
            "url_foto_profilo":followings[1]
        })
    return {"followings_data_general":usernames}    

@app.get("/getSuggestionsUsers/{username}")
async def getSuggestionsUsers(username:str):
    cursor = db.cursor()
    cursor.execute(f'''select y.username ,y.url_foto_profilo
                        from (select seguiti.username_seguito
			                from seguiti
			                where seguiti.username_seguente = "{username}") as x
                        right join utenti as y
                        on y.username = x.username_seguito
                        where x.username_seguito is null and y.username <> "{username}"'''   )
    result = cursor.fetchall()
    users = []
    for user in result:
        users.append({
            "username":user[0],
            "url_foto_profilo":user[1]
        })

    return {"suggestions_users":users}    


@app.post("/isfollowingOfUser")
async def isFollowingOfUser(followbase:followBase):
    cursor = db.cursor()
    cursor.execute(f'''SELECT * 
                   FROM seguiti 
                   WHERE seguiti.username_seguito = "{followbase.username_seguito}"
                   and seguiti.username_seguente = "{followbase.username_seguente}"
                   ''')
    return {"isfollowing":cursor.fetchone()}


@app.post("/getChatData")
async def getChatData(chat_model:ChatModel):
    cursor = db.cursor()
    cursor.execute(f'''
        SELECT messaggi.*,utenti.url_foto_profilo
        FROM messaggi
        INNER JOIN utenti
        ON utenti.username = messaggi.username_mittente
        WHERE (messaggi.username_destinatario = "{chat_model.destinatario}" 
        OR messaggi.username_destinatario = "{chat_model.mittente}")
        AND (messaggi.username_mittente = "{chat_model.destinatario}" 
        OR messaggi.username_mittente = "{chat_model.mittente}")
        ORDER BY messaggi.ora
        
    ''')
    chat_models_info = []
    result = cursor.fetchall()
    for chat_model in result:
        chat_models_info.append(ChatModelInfo(
            destinatario=chat_model[4],
            mittente=chat_model[3],
            messaggio=chat_model[2],
            ora=chat_model[1].strftime("%H:%M"),
            cod_mess=chat_model[0],
            url_foto_profilo_dest=chat_model[5]
        ))

    return {"chatdata":chat_models_info}

@app.put("/sendMessage")
async def sendMessage(chat_info:ChatModelInfo):
    cursor = db.cursor()
    sql = "INSERT INTO messaggi(messaggio,username_mittente,username_destinatario) VALUES (%s,%s,%s)"
    val = (chat_info.messaggio,chat_info.mittente,chat_info.destinatario)
    cursor.execute(sql, val)
    db.commit()
    return {"res":True}

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

def checkFollow(followbase:followBase):
    cursor = db.cursor()
    cursor.execute(f"SELECT * FROM seguiti WHERE seguiti.username_seguente = '{followbase.username_seguente}' AND seguiti.username_seguito = '{followbase.username_seguito}';")
    return cursor.fetchone()

def getNumberOfFollowersFollowings(username:str):
    cursor  = db.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM seguiti WHERE username_seguito = '{username}';")
    number_followers = cursor.fetchone()[0]
    cursor.execute(f"SELECT COUNT(*) FROM seguiti WHERE username_seguente = '{username}';")
    number_followings = cursor.fetchone()[0]

    return {"n_followers":number_followers,"n_followings":number_followings}



    
