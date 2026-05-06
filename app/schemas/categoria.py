"""
Schemas de validação para Categoria.
"""
from marshmallow import Schema, fields, validate


class CategoriaSchema(Schema):
    """Schema de resposta de categoria."""
    id = fields.Int(dump_only=True)
    nome = fields.Str()
    tipo = fields.Str()
    cor = fields.Str()
    icone = fields.Str()
    limite_mensal = fields.Float(allow_none=True)
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class CategoriaCreateSchema(Schema):
    """Schema de criação/atualização de categoria."""
    nome = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=80)
    )
    tipo = fields.Str(
        required=True,
        validate=validate.OneOf(['receita', 'despesa'])
    )
    cor = fields.Str(
        validate=validate.Regexp(r'^#[0-9a-fA-F]{6}$'),
        load_default='#6366f1'
    )
    icone = fields.Str(
        validate=validate.Length(max=50),
        load_default='📦'
    )
    limite_mensal = fields.Float(
        allow_none=True,
        validate=validate.Range(min=0),
        load_default=None
    )
