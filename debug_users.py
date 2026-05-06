import sqlite3

db_path = 'c:/Users/Caique.Machado/Desktop/projeto/algo/instance/gastos.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Transacoes com User ID ---")
cursor.execute("SELECT id, user_id, descricao, valor FROM transacoes")
for row in cursor.fetchall():
    print(row)

print("\n--- Usuarios ---")
cursor.execute("SELECT id, email FROM users")
for row in cursor.fetchall():
    print(row)

conn.close()
