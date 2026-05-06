"""
Modelo de Transação financeira.
"""
from datetime import datetime, timezone, date
from app.extensions import db


class Transacao(db.Model):
    __tablename__ = 'transacoes'

    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    tipo = db.Column(
        db.String(20), nullable=False
    )  # 'receita' ou 'despesa'
    data = db.Column(db.Date, nullable=False, default=date.today, index=True)
    categoria_id = db.Column(
        db.Integer, db.ForeignKey('categorias.id'), nullable=False, index=True
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=False, index=True
    )
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f'<Transacao {self.descricao} R${self.valor:.2f}>'
