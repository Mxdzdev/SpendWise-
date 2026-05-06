import sqlite3
import os

db_path = 'c:/Users/Caique.Machado/Desktop/projeto/algo/gastos.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM transacao")
    count = cursor.fetchone()[0]
    print(f"Transacoes: {count}")
    cursor.execute("SELECT COUNT(*) FROM investimento")
    count = cursor.fetchone()[0]
    print(f"Investimentos: {count}")
    conn.close()
