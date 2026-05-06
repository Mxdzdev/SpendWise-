"""
Rotas de Autenticação — registro, login e perfil.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from marshmallow import ValidationError

from app.extensions import db
from app.models.user import User
from app.schemas.user import UserSchema, UserCreateSchema, LoginSchema

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()
user_create_schema = UserCreateSchema()
login_schema = LoginSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Cadastro de novo usuário.

    Body JSON:
        nome (str): Nome completo
        email (str): E-mail único
        senha (str): Senha (mínimo 6 caracteres)

    Returns:
        201: Usuário criado com sucesso + token JWT
        400: Erro de validação
        409: E-mail já cadastrado
    """
    try:
        dados = user_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    # Verificar se e-mail já existe
    if User.query.filter_by(email=dados['email']).first():
        return jsonify({'erro': 'E-mail já cadastrado'}), 409

    user = User(nome=dados['nome'], email=dados['email'])
    user.set_senha(dados['senha'])

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'mensagem': 'Usuário criado com sucesso',
        'usuario': user_schema.dump(user),
        'token': token,
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login do usuário.

    Body JSON:
        email (str): E-mail cadastrado
        senha (str): Senha

    Returns:
        200: Login bem-sucedido + token JWT
        400: Erro de validação
        401: Credenciais inválidas
    """
    try:
        dados = login_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'erro': 'Dados inválidos', 'detalhes': err.messages}), 400

    user = User.query.filter_by(email=dados['email']).first()

    if not user or not user.verificar_senha(dados['senha']):
        return jsonify({'erro': 'E-mail ou senha incorretos'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'mensagem': 'Login realizado com sucesso',
        'usuario': user_schema.dump(user),
        'token': token,
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """
    Retorna os dados do usuário logado.

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Dados do usuário
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify(user_schema.dump(user)), 200
