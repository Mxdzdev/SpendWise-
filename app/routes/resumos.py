"""
Rotas de Resumos — relatórios financeiros e dashboards.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.resumo_service import (
    resumo_mensal, gastos_por_categoria, evolucao_mensal
)

resumos_bp = Blueprint('resumos', __name__)


@resumos_bp.route('/mensal', methods=['GET'])
@jwt_required()
def mensal():
    """
    Resumo financeiro mensal.

    Query params:
        mes (int, opcional): Mês (1-12). Padrão: mês atual
        ano (int, opcional): Ano. Padrão: ano atual

    Returns:
        200: Resumo com receitas, despesas, saldo, média diária,
             projeção e comparativo com mês anterior
    """
    user_id = int(get_jwt_identity())
    mes = request.args.get('mes', type=int)
    ano = request.args.get('ano', type=int)

    resultado = resumo_mensal(user_id, mes, ano)
    return jsonify(resultado), 200


@resumos_bp.route('/por-categoria', methods=['GET'])
@jwt_required()
def por_categoria():
    """
    Gastos agrupados por categoria.

    Query params:
        mes (int, opcional): Mês (1-12). Padrão: mês atual
        ano (int, opcional): Ano. Padrão: ano atual

    Returns:
        200: Lista de categorias com totais e percentuais
    """
    user_id = int(get_jwt_identity())
    mes = request.args.get('mes', type=int)
    ano = request.args.get('ano', type=int)

    resultado = gastos_por_categoria(user_id, mes, ano)
    return jsonify({
        'categorias': resultado,
        'total_categorias': len(resultado),
    }), 200


@resumos_bp.route('/evolucao', methods=['GET'])
@jwt_required()
def evolucao():
    """
    Evolução financeira nos últimos meses.

    Query params:
        meses (int, opcional): Quantidade de meses (padrão: 6, máx: 12)

    Returns:
        200: Lista com receitas/despesas/saldo por mês
    """
    user_id = int(get_jwt_identity())
    meses = min(request.args.get('meses', 6, type=int), 12)

    resultado = evolucao_mensal(user_id, meses)
    return jsonify({
        'evolucao': resultado,
        'meses_analisados': len(resultado),
    }), 200
