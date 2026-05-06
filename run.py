"""
Ponto de entrada da aplicação.
"""
from app import create_app
from app.extensions import db

app = create_app()

# Criar tabelas automaticamente se não existirem
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print('=' * 50)
    print(' API de Controle de Gastos Pessoais')
    print(' URL: http://localhost:5000')
    print(' Health Check: http://localhost:5000/api/health')
    print('=' * 50)
    app.run(debug=True, port=5000)
