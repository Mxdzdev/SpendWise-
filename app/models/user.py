"""
Modelo de Usuário.
"""
from datetime import datetime, timezone
from app.extensions import db
import bcrypt


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relacionamentos
    categorias = db.relationship('Categoria', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')
    transacoes = db.relationship('Transacao', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')
    alertas = db.relationship('Alerta', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')
    investimentos = db.relationship('Investimento', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')

    def set_senha(self, senha):
        """Gera hash da senha usando bcrypt."""
        self.senha_hash = bcrypt.hashpw(
            senha.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def verificar_senha(self, senha):
        """Verifica se a senha informada confere com o hash armazenado."""
        return bcrypt.checkpw(
            senha.encode('utf-8'),
            self.senha_hash.encode('utf-8')
        )

    def __repr__(self):
        return f'<User {self.email}>'
