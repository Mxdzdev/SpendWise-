"""
Rotas de Transações — CRUD com verificação automática de limites.
"""
from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.transacao import Transacao
from app.models.categoria import Categoria
from app.schemas.transacao import TransacaoSchema, TransacaoCreateSchema
from app.services.alerta_service import verificar_limite_categoria

transacoes_bp = Blueprint('transacoes', __name__)
transacao_schema = TransacaoSchema()
transacoes_schema = TransacaoSchema(many=True)
transacao_create_schema = TransacaoCreateSchema()


@transacoes_bp.route('', methods=['GET'])
@jwt_required()
def listar():
    """
    Lista transações do usuário com filtros opcionais.

    Query params:
        tipo (str): 'receita' ou 'despesa'
        categoria_id (int): ID da categoria
        mes (int): Mês (1-12)
        ano (int): Ano (ex: 2026)
        pagina (int): Número da página (padrão: 1)
        por_pagina (int): Itens por página (padrão: 20, máx: 100)

    Returns:
        200: Lista paginada de transações
    """
    user_id = int(get_jwt_identity())
    query = Transacao.query.filter_by(user_id=user_id)

    # Filtros
    tipo = request.args.get('tipo')
    if tipo in ('receita', 'despesa'):
        query = query.filter_by(tipo=tipo)

    categoria_id = request.args.get('categoria_id', type=int)
    if categoria_id:
        query = query.filter_by(categoria_id=categoria_id)

    mes = request.args.get('mes', type=int)
    ano = request.args.get('ano', type=int)
    if mes and ano:
        from sqlalchemy import extract
        query = query.filter(
            extract('month', Transacao.data) == mes,
            extract('year', Transacao.data) == ano,
        )

    # Paginação
    pagina = request.args.get('pagina', 1, type=int)
    por_pagina = min(request.args.get('por_pagina', 20, type=int), 100)

    paginacao = query.order_by(
        Transacao.data.desc(), Transacao.created_at.desc()
    ).paginate(page=pagina, per_page=por_pagina, error_out=False)

    return jsonify({
        'transacoes': transacoes_schema.dump(paginacao.items),
        'paginacao': {
            'pagina_atual': paginacao.page,
            'total_paginas': paginacao.pages,
            'total_itens': paginacao.total,
            'por_pagina': por_pagina,
        },
    }), 200


@transacoes_bp.route('', methods=['POST'])
@jwt_required()
def criar():
    """
    Cria uma nova transação.

    Após a criação, verifica automaticamente se o gasto mensal
    da categoria ultrapassou o limite configurado, gerando alertas.

    Body JSON:
        descricao (str): Descrição da transação
        valor (float): Valor (> 0)
        tipo (str): 'receita' ou 'despesa'
        data (str, opcional): Data no formato YYYY-MM-DD (padrão: hoje)
        categoria_id (int): ID da categoria

    Returns:
        201: Transação criada (com alerta, se aplicável)
        400: Erro de validação
        404: Categoria não encontrada
    """
    user_id = int(get_jwt_identity())

    try:
        dados = transacao_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    # Verificar se a categoria pertence ao usuário
    categoria = Categoria.query.filter_by(
        id=dados['categoria_id'], user_id=user_id
    ).first()

    if not categoria:
        return jsonify({'erro': 'Categoria não encontrada'}), 404

    # Verificar compatibilidade de tipo
    if dados['tipo'] != categoria.tipo:
        return jsonify({
            'erro': f'Tipo da transação ({dados["tipo"]}) não é compatível '
                    f'com a categoria ({categoria.tipo})'
        }), 400

    # Definir data padrão
    if dados.get('data') is None:
        dados['data'] = date.today()

    transacao = Transacao(user_id=user_id, **dados)
    db.session.add(transacao)
    db.session.commit()

    resposta = {
        'mensagem': 'Transação criada com sucesso',
        'transacao': transacao_schema.dump(transacao),
    }

    # Verificar limites se for despesa
    if dados['tipo'] == 'despesa':
        alerta = verificar_limite_categoria(dados['categoria_id'], user_id)
        if alerta:
            resposta['alerta'] = alerta

    return jsonify(resposta), 201


@transacoes_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar(id):
    """
    Atualiza uma transação existente.

    Returns:
        200: Transação atualizada (com alerta, se aplicável)
        400: Erro de validação
        404: Transação não encontrada
    """
    user_id = int(get_jwt_identity())
    transacao = Transacao.query.filter_by(id=id, user_id=user_id).first()

    if not transacao:
        return jsonify({'erro': 'Transação não encontrada'}), 404

    try:
        dados = transacao_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    # Verificar categoria
    categoria = Categoria.query.filter_by(
        id=dados['categoria_id'], user_id=user_id
    ).first()

    if not categoria:
        return jsonify({'erro': 'Categoria não encontrada'}), 404

    if dados['tipo'] != categoria.tipo:
        return jsonify({
            'erro': f'Tipo da transação ({dados["tipo"]}) não é compatível '
                    f'com a categoria ({categoria.tipo})'
        }), 400

    if dados.get('data') is None:
        dados['data'] = date.today()

    for key, value in dados.items():
        setattr(transacao, key, value)

    db.session.commit()

    resposta = {
        'mensagem': 'Transação atualizada com sucesso',
        'transacao': transacao_schema.dump(transacao),
    }

    # Verificar limites se for despesa
    if dados['tipo'] == 'despesa':
        alerta = verificar_limite_categoria(dados['categoria_id'], user_id)
        if alerta:
            resposta['alerta'] = alerta

    return jsonify(resposta), 200


@transacoes_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def remover(id):
    """
    Remove uma transação.

    Returns:
        200: Transação removida
        404: Transação não encontrada
    """
    user_id = int(get_jwt_identity())
    transacao = Transacao.query.filter_by(id=id, user_id=user_id).first()

    if not transacao:
        return jsonify({'erro': 'Transação não encontrada'}), 404

    db.session.delete(transacao)
    db.session.commit()

    return jsonify({'mensagem': 'Transação removida com sucesso'}), 200
