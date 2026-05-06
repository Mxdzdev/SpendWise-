"""
Schema de validação para Alerta.
"""
from marshmallow import Schema, fields


class AlertaSchema(Schema):
    """Schema de resposta de alerta."""
    id = fields.Int(dump_only=True)
    categoria_id = fields.Int()
    categoria_nome = fields.Method('get_categoria_nome')
    user_id = fields.Int(dump_only=True)
    mes_ref = fields.Str()
    limite = fields.Float()
    gasto_atual = fields.Float()
    percentual = fields.Float()
    tipo_alerta = fields.Str()
    mensagem = fields.Method('get_mensagem')
    lido = fields.Bool()
    created_at = fields.DateTime(dump_only=True)

    def get_categoria_nome(self, obj):
        if hasattr(obj, 'categoria') and obj.categoria:
            return obj.categoria.nome
        return None

    def get_mensagem(self, obj):
        cat_nome = self.get_categoria_nome(obj) or 'uma categoria'
        pct = int(obj.percentual)
        
        if obj.tipo_alerta == 'critico':
            excesso = obj.gasto_atual - obj.limite
            return f"Limite ultrapassado em {cat_nome}! Você gastou R$ {obj.gasto_atual:,.2f}, o que representa {pct}% do seu limite de R$ {obj.limite:,.2f}. Excesso de R$ {excesso:,.2f}."
        
        return f"Atenção: Os gastos em {cat_nome} atingiram {pct}% do seu limite mensal (R$ {obj.gasto_atual:,.2f} de R$ {obj.limite:,.2f})."
