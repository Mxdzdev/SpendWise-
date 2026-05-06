import sqlite3
from datetime import date

db_path = 'c:/Users/Caique.Machado/Desktop/projeto/algo/instance/gastos.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Transacoes brutas (SQLite) ---")
cursor.execute("SELECT id, data, descricao, valor FROM transacoes")
for row in cursor.fetchall():
    print(row)

hoje = date.today()
print(f"\nPython date.today(): {hoje}")
print(f"Tipo do date.today(): {type(hoje)}")

conn.close()
