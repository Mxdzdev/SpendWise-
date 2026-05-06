"""
Modelo de Categoria de gastos/receitas.
"""
from datetime import datetime, timezone
from app.extensions import db


class Categoria(db.Model):
    __tablename__ = 'categorias'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    tipo = db.Column(
        db.String(20), nullable=False, default='despesa'
    )  # 'receita' ou 'despesa'
    cor = db.Column(db.String(7), default='#6366f1')   # Hex color
    icone = db.Column(db.String(50), default='📦')
    limite_mensal = db.Column(db.Float, nullable=True)  # Limite em R$
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=False, index=True
    )
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relacionamentos
    transacoes = db.relationship(
        'Transacao', backref='categoria', lazy='dynamic', cascade='all, delete-orphan'
    )
    alertas = db.relationship(
        'Alerta', backref='categoria', lazy='dynamic', cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<Categoria {self.nome} ({self.tipo})>'
