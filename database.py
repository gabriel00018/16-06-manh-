import fdb

def get_db_connection():
    try:
        print("Tentando conectar no banco...")

        conn = fdb.connect(
            host='localhost',
            database=r"C:\Users\gabri\Desktop\lanchonete\BANCO\BANCO.FDB",
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