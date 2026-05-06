"""
Script de seed — popula o banco com dados de demonstração.
"""
from datetime import date, timedelta
import random
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.categoria import Categoria
from app.models.transacao import Transacao
from app.models.investimento import Investimento
from app.services.alerta_service import verificar_limite_categoria


def seed():
    app = create_app()
    with app.app_context():
        print('Limpando banco de dados...')
        db.drop_all()
        db.create_all()

        print('Criando usuario de demonstracao...')
        user = User(nome='João Silva', email='joao@email.com')
        user.set_senha('123456')
        db.session.add(user)
        db.session.commit()

        print('Criando categorias...')
        categorias_dados = [
            {'nome': 'Alimentação', 'tipo': 'despesa', 'cor': '#ef4444', 'icone': '🍔', 'limite_mensal': 800.00},
            {'nome': 'Transporte', 'tipo': 'despesa', 'cor': '#f59e0b', 'icone': '🚗', 'limite_mensal': 500.00},
            {'nome': 'Moradia', 'tipo': 'despesa', 'cor': '#8b5cf6', 'icone': '🏠', 'limite_mensal': 2000.00},
            {'nome': 'Saúde', 'tipo': 'despesa', 'cor': '#10b981', 'icone': '💊', 'limite_mensal': 400.00},
            {'nome': 'Lazer', 'tipo': 'despesa', 'cor': '#ec4899', 'icone': '🎬', 'limite_mensal': 300.00},
            {'nome': 'Educação', 'tipo': 'despesa', 'cor': '#3b82f6', 'icone': '📚', 'limite_mensal': 500.00},
            {'nome': 'Assinaturas', 'tipo': 'despesa', 'cor': '#6366f1', 'icone': '📱', 'limite_mensal': 200.00},
            {'nome': 'Salário', 'tipo': 'receita', 'cor': '#22c55e', 'icone': '💰'},
            {'nome': 'Freelance', 'tipo': 'receita', 'cor': '#14b8a6', 'icone': '💻'},
            {'nome': 'Investimentos', 'tipo': 'receita', 'cor': '#0ea5e9', 'icone': '📈'},
        ]

        categorias = {}
        for cat_data in categorias_dados:
            cat = Categoria(user_id=user.id, **cat_data)
            db.session.add(cat)
            db.session.flush()
            categorias[cat_data['nome']] = cat

        db.session.commit()

        print('Criando transacoes de exemplo...')
        hoje = date.today()

        transacoes_dados = [
            {'descricao': 'Salário mensal', 'valor': 5500.00, 'tipo': 'receita', 'data': hoje - timedelta(days=hoje.day-5), 'categoria': 'Salário'},
            {'descricao': 'Projeto freelance', 'valor': 1200.00, 'tipo': 'receita', 'data': hoje - timedelta(days=hoje.day-10), 'categoria': 'Freelance'},
            {'descricao': 'Aluguel', 'valor': 1500.00, 'tipo': 'despesa', 'data': hoje - timedelta(days=hoje.day-1), 'categoria': 'Moradia'},
            {'descricao': 'Supermercado', 'valor': 450.00, 'tipo': 'despesa', 'data': hoje - timedelta(days=2), 'categoria': 'Alimentação'},
            {'descricao': 'Gasolina', 'valor': 200.00, 'tipo': 'despesa', 'data': hoje - timedelta(days=1), 'categoria': 'Transporte'},
        ]

        for t_data in transacoes_dados:
            cat_nome = t_data.pop('categoria')
            t = Transacao(user_id=user.id, categoria_id=categorias[cat_nome].id, **t_data)
            db.session.add(t)
        
        db.session.commit()

        print('Criando investimentos...')
        invest_dados = [
            {'banco': 'XP Investimentos', 'valor': 1000.00, 'tipo': 'Tesouro Direto', 'data': hoje - timedelta(days=5)},
            {'banco': 'Nubank', 'valor': 500.00, 'tipo': 'CDB', 'data': hoje - timedelta(days=3)},
        ]

        for i_data in invest_dados:
            inv = Investimento(usuario_id=user.id, **i_data)
            db.session.add(inv)
        
        db.session.commit()
        print('Seed finalizado com sucesso!')


if __name__ == '__main__':
    seed()
