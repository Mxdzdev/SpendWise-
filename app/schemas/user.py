"""
Schemas de validação para Usuário.
"""
from marshmallow import Schema, fields, validate


class UserSchema(Schema):
    """Schema de resposta do usuário (sem senha)."""
    id = fields.Int(dump_only=True)
    nome = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime(dump_only=True)


class UserCreateSchema(Schema):
    """Schema de criação de usuário."""
    nome = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=120)
    )
    email = fields.Email(required=True)
    senha = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        load_only=True
    )


class LoginSchema(Schema):
    """Schema de login."""
    email = fields.Email(required=True)
    senha = fields.Str(required=True, load_only=True)
