"""
Modelo de Alerta — gerado automaticamente quando limites são ultrapassados.
"""
from datetime import datetime, timezone
from app.extensions import db


class Alerta(db.Model):
    __tablename__ = 'alertas'

    id = db.Column(db.Integer, primary_key=True)
    categoria_id = db.Column(
        db.Integer, db.ForeignKey('categorias.id'), nullable=False, index=True
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=False, index=True
    )
    mes_ref = db.Column(db.String(7), nullable=False)  # Formato: '2026-05'
    limite = db.Column(db.Float, nullable=False)
    gasto_atual = db.Column(db.Float, nullable=False)
    percentual = db.Column(db.Float, nullable=False)
    tipo_alerta = db.Column(
        db.String(20), nullable=False, default='aviso'
    )  # 'aviso' (80%) ou 'critico' (100%)
    lido = db.Column(db.Boolean, default=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f'<Alerta {self.tipo_alerta} — {self.percentual:.0f}% do limite>'
