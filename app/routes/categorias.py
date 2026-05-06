"""
Rotas de Categorias — CRUD completo.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaSchema, CategoriaCreateSchema

categorias_bp = Blueprint('categorias', __name__)
categoria_schema = CategoriaSchema()
categorias_schema = CategoriaSchema(many=True)
categoria_create_schema = CategoriaCreateSchema()


@categorias_bp.route('', methods=['GET'])
@jwt_required()
def listar():
    """
    Lista todas as categorias do usuário logado.

    Query params:
        tipo (str, opcional): Filtrar por 'receita' ou 'despesa'

    Returns:
        200: Lista de categorias
    """
    user_id = int(get_jwt_identity())
    query = Categoria.query.filter_by(user_id=user_id)

    tipo = request.args.get('tipo')
    if tipo in ('receita', 'despesa'):
        query = query.filter_by(tipo=tipo)

    categorias = query.order_by(Categoria.nome).all()
    return jsonify(categorias_schema.dump(categorias)), 200


@categorias_bp.route('', methods=['POST'])
@jwt_required()
def criar():
    """
    Cria uma nova categoria.

    Body JSON:
        nome (str): Nome da categoria
        tipo (str): 'receita' ou 'despesa'
        cor (str, opcional): Cor hex (#RRGGBB)
        icone (str, opcional): Emoji ou nome do ícone
        limite_mensal (float, opcional): Limite de gastos mensais

    Returns:
        201: Categoria criada
        400: Erro de validação
    """
    user_id = int(get_jwt_identity())

    try:
        dados = categoria_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    categoria = Categoria(user_id=user_id, **dados)
    db.session.add(categoria)
    db.session.commit()

    return jsonify({
        'mensagem': 'Categoria criada com sucesso',
        'categoria': categoria_schema.dump(categoria),
    }), 201


@categorias_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar(id):
    """
    Atualiza uma categoria existente.

    Returns:
        200: Categoria atualizada
        400: Erro de validação
        404: Categoria não encontrada
    """
    user_id = int(get_jwt_identity())
    categoria = Categoria.query.filter_by(id=id, user_id=user_id).first()

    if not categoria:
        return jsonify({'erro': 'Categoria não encontrada'}), 404

    try:
        dados = categoria_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    for key, value in dados.items():
        setattr(categoria, key, value)

    db.session.commit()

    return jsonify({
        'mensagem': 'Categoria atualizada com sucesso',
        'categoria': categoria_schema.dump(categoria),
    }), 200


@categorias_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def remover(id):
    """
    Remove uma categoria e todas as suas transações.

    Returns:
        200: Categoria removida
        404: Categoria não encontrada
    """
    user_id = int(get_jwt_identity())
    categoria = Categoria.query.filter_by(id=id, user_id=user_id).first()

    if not categoria:
        return jsonify({'erro': 'Categoria não encontrada'}), 404

    db.session.delete(categoria)
    db.session.commit()

    return jsonify({'mensagem': 'Categoria removida com sucesso'}), 200
