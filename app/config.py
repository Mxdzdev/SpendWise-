"""
Configurações da aplicação — separadas por ambiente.
"""
import os
from datetime import timedelta


class Config:
    """Configuração base."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-fallback-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_ERROR_MESSAGE_KEY = 'erro'

    # Percentuais de alerta
    ALERTA_PERCENTUAL_AVISO = 80   # Alerta amarelo em 80%
    ALERTA_PERCENTUAL_CRITICO = 100  # Alerta vermelho em 100%


class DevelopmentConfig(Config):
    """Configuração de desenvolvimento."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'sqlite:///gastos.db'
    )


class ProductionConfig(Config):
    """Configuração de produção."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')


class TestingConfig(Config):
    """Configuração de testes."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}
