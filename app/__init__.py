"""
Factory de criação da aplicação Flask.
"""
from flask import Flask
from dotenv import load_dotenv

from .config import config_by_name
from .extensions import db, migrate, jwt, ma, cors

load_dotenv()


def create_app(config_name='development'):
    """Cria e configura a aplicação Flask."""
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Importar modelos para que o Migrate os reconheça
    from .models import user, categoria, transacao, alerta  # noqa: F401

    # Registrar blueprints
    from .routes.auth import auth_bp
    from .routes.categorias import categorias_bp
    from .routes.transacoes import transacoes_bp
    from .routes.resumos import resumos_bp
    from .routes.alertas import alertas_bp
    from .routes.investimentos import investimentos_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(categorias_bp, url_prefix='/api/categorias')
    app.register_blueprint(transacoes_bp, url_prefix='/api/transacoes')
    app.register_blueprint(resumos_bp, url_prefix='/api/resumo')
    app.register_blueprint(alertas_bp, url_prefix='/api/alertas')
    app.register_blueprint(investimentos_bp, url_prefix='/api/investimentos')

    # Rota de health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'service': 'API Controle de Gastos Pessoais'}

    return app
