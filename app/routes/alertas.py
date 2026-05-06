"""
Rotas de Alertas — listagem e marcação como lido.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.alerta import Alerta
from app.schemas.alerta import AlertaSchema

alertas_bp = Blueprint('alertas', __name__)
alerta_schema = AlertaSchema()
alertas_schema = AlertaSchema(many=True)


@alertas_bp.route('', methods=['GET'])
@jwt_required()
def listar():
    """
    Lista alertas do usuário logado.

    Query params:
        lido (bool, opcional): Filtrar por alertas lidos/não lidos
        mes_ref (str, opcional): Filtrar por mês (formato: '2026-05')

    Returns:
        200: Lista de alertas ordenados por data (mais recentes primeiro)
    """
    user_id = int(get_jwt_identity())
    query = Alerta.query.filter_by(user_id=user_id)

    # Filtro por status de leitura
    lido = request.args.get('lido')
    if lido is not None:
        query = query.filter_by(lido=lido.lower() == 'true')

    # Filtro por mês
    mes_ref = request.args.get('mes_ref')
    if mes_ref:
        query = query.filter_by(mes_ref=mes_ref)

    alertas = query.order_by(Alerta.created_at.desc()).all()

    # Contadores
    total_nao_lidos = Alerta.query.filter_by(
        user_id=user_id, lido=False
    ).count()

    return jsonify({
        'alertas': alertas_schema.dump(alertas),
        'total': len(alertas),
        'nao_lidos': total_nao_lidos,
    }), 200


@alertas_bp.route('/<int:id>/lido', methods=['PATCH'])
@jwt_required()
def marcar_lido(id):
    """
    Marca um alerta como lido.

    Returns:
        200: Alerta marcado como lido
        404: Alerta não encontrado
    """
    user_id = int(get_jwt_identity())
    alerta = Alerta.query.filter_by(id=id, user_id=user_id).first()

    if not alerta:
        return jsonify({'erro': 'Alerta não encontrado'}), 404

    alerta.lido = True
    db.session.commit()

    return jsonify({
        'mensagem': 'Alerta marcado como lido',
        'alerta': alerta_schema.dump(alerta),
    }), 200


@alertas_bp.route('/marcar-todos-lidos', methods=['PATCH'])
@jwt_required()
def marcar_todos_lidos():
    """
    Marca todos os alertas do usuário como lidos.

    Returns:
        200: Quantidade de alertas atualizados
    """
    user_id = int(get_jwt_identity())
    atualizados = Alerta.query.filter_by(
        user_id=user_id, lido=False
    ).update({'lido': True})
    db.session.commit()

    return jsonify({
        'mensagem': f'{atualizados} alerta(s) marcado(s) como lido(s)',
        'atualizados': atualizados,
    }), 200
