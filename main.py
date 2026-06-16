import os
import fdb
from flask import Flask
from flask_cors import CORS
import config

app = Flask(__name__)

CORS(app, supports_credentials=True,
     origins=[
         "http://localhost:5173",
         "http://127.0.0.1:5173",
         "http://10.92.3.161:5000",
         "http://10.92.3.161:5173" #IR NO CMD E DIGITAR "ipconfig" E COPIAR O "Endereço IPv4"
     ])

app.config['SECRET_KEY'] = config.Config.SECRET_KEY

UPLOAD_FOLDER = os.path.join('uploads', 'usuarios')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_db_connection():
    try:
        print("Tentando conectar no banco...")

        conn = fdb.connect(
            host='localhost',
            database=r"C:\Users\Aluno\Desktop\15-06-tarde-main\BANCO.FDB", #!!!!!!!!!!!!!!!!
            user='SYSDBA',
            password='sysdba',
            charset='UTF8'
        )

        print(" CONECTOU COM SUCESSO")
        return conn

    except Exception as e:
        print(" ERRO REAL DO FIREBIRD:")
        print(e)
        return None


def testar_conexao():
    conn = get_db_connection()
    print("Resultado da conexão:", conn)

    if conn:
        conn.close()

testar_conexao()

from view import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
