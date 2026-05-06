"""
Schemas de validação para Transação.
"""
from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import date


class TransacaoSchema(Schema):
    """Schema de resposta de transação."""
    id = fields.Int(dump_only=True)
    descricao = fields.Str()
    valor = fields.Float()
    tipo = fields.Str()
    data = fields.Date()
    categoria_id = fields.Int()
    categoria_nome = fields.Method('get_categoria_nome')
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

    def get_categoria_nome(self, obj):
        """Retorna o nome da categoria associada."""
        if hasattr(obj, 'categoria') and obj.categoria:
            return obj.categoria.nome
        return None


class TransacaoCreateSchema(Schema):
    """Schema de criação/atualização de transação."""
    descricao = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=200)
    )
    valor = fields.Float(
        required=True,
        validate=validate.Range(min=0.01)
    )
    tipo = fields.Str(
        required=True,
        validate=validate.OneOf(['receita', 'despesa'])
    )
    data = fields.Date(load_default=None)
    categoria_id = fields.Int(required=True)

    @validates('data')
    def validar_data(self, value):
        """Não permite transações com data futura."""
        if value and value > date.today():
            raise ValidationError('Data não pode ser futura.')
