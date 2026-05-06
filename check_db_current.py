import sqlite3
from datetime import date

db_path = 'c:/Users/Caique.Machado/Desktop/projeto/algo/instance/gastos.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
hoje = date.today()
mes = hoje.month
ano = hoje.year

print(f"Hoje: {hoje}")

cursor.execute("SELECT COUNT(*) FROM transacao WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?", (f"{mes:02d}", str(ano)))
count = cursor.fetchone()[0]
print(f"Transacoes este mes: {count}")

cursor.execute("SELECT descricao, valor, data FROM transacao LIMIT 10")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
