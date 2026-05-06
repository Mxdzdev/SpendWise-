import sqlite3

db_path = 'c:/Users/Caique.Machado/Desktop/projeto/algo/instance/gastos.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Transacoes ---")
cursor.execute("SELECT id, user_id, descricao, valor, tipo, data FROM transacao")
for row in cursor.fetchall():
    print(row)

print("--- Usuarios ---")
cursor.execute("SELECT id, email FROM user")
for row in cursor.fetchall():
    print(row)

conn.close()
