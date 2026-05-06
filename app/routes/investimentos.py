from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models.investimento import Investimento
from app.schemas.investimento import investimento_schema, investimentos_schema

investimentos_bp = Blueprint('investimentos', __name__)

@investimentos_bp.route('', methods=['GET'])
@jwt_required()
def listar():
    usuario_id = get_jwt_identity()
    investimentos = Investimento.query.filter_by(usuario_id=usuario_id).order_by(Investimento.data.desc()).all()
    
    # Calcular total por segurança e agilidade no front
    total = sum(i.valor for i in investimentos)
    
    return jsonify({
        "investimentos": investimentos_schema.dump(investimentos),
        "total": total
    }), 200

@investimentos_bp.route('', methods=['POST'])
@jwt_required()
def criar():
    usuario_id = get_jwt_identity()
    dados = request.get_json()
    
    if not dados.get('banco') or not dados.get('tipo') or not dados.get('valor'):
        return jsonify({"msg": "Banco, tipo e valor são obrigatórios"}), 400
        
    try:
        novo_investimento = Investimento(
            banco=dados['banco'],
            tipo=dados['tipo'],
            valor=float(dados['valor']),
            usuario_id=usuario_id
        )
        
        if 'data' in dados and dados['data']:
            novo_investimento.data = datetime.strptime(dados['data'], '%Y-%m-%d').date()
            
        db.session.add(novo_investimento)
        db.session.commit()
        
        return jsonify(investimento_schema.dump(novo_investimento)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Erro ao salvar investimento: {str(e)}"}), 500

@investimentos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def deletar(id):
    usuario_id = get_jwt_identity()
    investimento = Investimento.query.filter_by(id=id, usuario_id=usuario_id).first()
    
    if not investimento:
        return jsonify({"msg": "Investimento não encontrado"}), 404
        
    try:
        db.session.delete(investimento)
        db.session.commit()
        return jsonify({"msg": "Investimento deletado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Erro ao deletar: {str(e)}"}), 500
