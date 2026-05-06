"""
Serviço de Alertas — lógica de negócio para verificação de limites.

Responsável por verificar se uma transação fez o gasto mensal de uma
categoria ultrapassar o limite configurado, criando alertas automáticos.
"""
from datetime import date
from flask import current_app
from sqlalchemy import func, extract

from app.extensions import db
from app.models.transacao import Transacao
from app.models.categoria import Categoria
from app.models.alerta import Alerta


def calcular_gasto_mensal(categoria_id, user_id, mes=None, ano=None):
    """
    Calcula o total de despesas de uma categoria em um mês específico.

    Args:
        categoria_id: ID da categoria
        user_id: ID do usuário dono da categoria
        mes: Mês de referência (padrão: mês atual)
        ano: Ano de referência (padrão: ano atual)

    Returns:
        float: Total gasto na categoria no mês
    """
    if mes is None:
        mes = date.today().month
    if ano is None:
        ano = date.today().year

    total = db.session.query(
        func.coalesce(func.sum(Transacao.valor), 0)
    ).filter(
        Transacao.categoria_id == categoria_id,
        Transacao.user_id == user_id,
        Transacao.tipo == 'despesa',
        extract('month', Transacao.data) == mes,
        extract('year', Transacao.data) == ano,
    ).scalar()

    return float(total)


def verificar_limite_categoria(categoria_id, user_id):
    """
    Verifica se o gasto mensal de uma categoria ultrapassou os limites
    configurados e cria alertas quando necessário.

    Níveis de alerta:
    - 'aviso': Gasto atingiu 80% do limite
    - 'critico': Gasto atingiu ou ultrapassou 100% do limite

    Args:
        categoria_id: ID da categoria a verificar
        user_id: ID do usuário

    Returns:
        dict | None: Dados do alerta criado, ou None se não aplicável
    """
    categoria = Categoria.query.filter_by(
        id=categoria_id, user_id=user_id
    ).first()

    if not categoria or not categoria.limite_mensal:
        return None

    hoje = date.today()
    mes_ref = hoje.strftime('%Y-%m')
    gasto_atual = calcular_gasto_mensal(categoria_id, user_id)
    percentual = (gasto_atual / categoria.limite_mensal) * 100

    pct_aviso = current_app.config.get('ALERTA_PERCENTUAL_AVISO', 80)
    pct_critico = current_app.config.get('ALERTA_PERCENTUAL_CRITICO', 100)

    tipo_alerta = None
    if percentual >= pct_critico:
        tipo_alerta = 'critico'
    elif percentual >= pct_aviso:
        tipo_alerta = 'aviso'

    if tipo_alerta is None:
        return None

    # Verificar se já existe alerta deste tipo para este mês
    alerta_existente = Alerta.query.filter_by(
        categoria_id=categoria_id,
        user_id=user_id,
        mes_ref=mes_ref,
        tipo_alerta=tipo_alerta,
    ).first()

    if alerta_existente:
        # Atualizar valores do alerta existente
        alerta_existente.gasto_atual = gasto_atual
        alerta_existente.percentual = percentual
        db.session.commit()
        return {
            'id': alerta_existente.id,
            'tipo': tipo_alerta,
            'categoria': categoria.nome,
            'limite': categoria.limite_mensal,
            'gasto_atual': gasto_atual,
            'percentual': round(percentual, 1),
            'atualizado': True,
        }

    # Criar novo alerta
    novo_alerta = Alerta(
        categoria_id=categoria_id,
        user_id=user_id,
        mes_ref=mes_ref,
        limite=categoria.limite_mensal,
        gasto_atual=gasto_atual,
        percentual=round(percentual, 1),
        tipo_alerta=tipo_alerta,
    )
    db.session.add(novo_alerta)
    db.session.commit()

    return {
        'id': novo_alerta.id,
        'tipo': tipo_alerta,
        'categoria': categoria.nome,
        'limite': categoria.limite_mensal,
        'gasto_atual': gasto_atual,
        'percentual': round(percentual, 1),
        'novo': True,
    }
