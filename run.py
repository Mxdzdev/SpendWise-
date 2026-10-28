"""Ponto de entrada da aplicação."""
import socket

from app import create_app
from app.extensions import db


def find_free_port(start_port=5000, end_port=5100):
    """Retorna a primeira porta livre do intervalo informado."""
    for port in range(start_port, end_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise RuntimeError('Nenhuma porta livre encontrada no intervalo solicitado.')


app = create_app()

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = find_free_port()
    print('=' * 50)
    print(' API de Controle de Gastos Pessoais')
    print(f' URL: http://localhost:{port}')
    print(f' Health Check: http://localhost:{port}/api/health')
    print('=' * 50)
    app.run(debug=True, port=port, use_reloader=False)
