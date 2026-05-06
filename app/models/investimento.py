from app.extensions import db
from datetime import datetime

class Investimento(db.Model):
    __tablename__ = 'investimentos'
    
    id = db.Column(db.Integer, primary_key=True)
    banco = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(100), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
