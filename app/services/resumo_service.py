"""
Serviço de Resumos — lógica de negócio para relatórios financeiros.

Gera resumos mensais, agrupamento por categoria e evolução temporal.
"""
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, extract, case

from app.extensions import db
from app.models.transacao import Transacao
from app.models.categoria import Categoria
from app.models.investimento import Investimento


def resumo_mensal(user_id, mes=None, ano=None):
    """
    Gera o resumo financeiro de um mês específico.
    """
    hoje = date.today()
    if mes is None:
        mes = hoje.month
    if ano is None:
        ano = hoje.year

    # Definir intervalo do mês para filtros mais robustos (especialmente no SQLite)
    inicio_mes = date(ano, mes, 1)
    if mes == 12:
        fim_mes = date(ano + 1, 1, 1)
    else:
        fim_mes = date(ano, mes + 1, 1)

    # Totais de transações do mês
    resultado = db.session.query(
        func.coalesce(func.sum(case((Transacao.tipo == 'receita', Transacao.valor))), 0).label('total_receitas'),
        func.coalesce(func.sum(case((Transacao.tipo == 'despesa', Transacao.valor))), 0).label('total_despesas'),
        func.count(Transacao.id).label('total_transacoes'),
    ).filter(
        Transacao.user_id == user_id,
        Transacao.data >= inicio_mes,
        Transacao.data < fim_mes
    ).first()

    # Total investido no mês
    total_investido_mes = db.session.query(
        func.coalesce(func.sum(Investimento.valor), 0)
    ).filter(
        Investimento.usuario_id == user_id,
        Investimento.data >= inicio_mes,
        Investimento.data < fim_mes
    ).scalar()

    total_receitas = float(resultado.total_receitas)
    total_despesas = float(resultado.total_despesas)
    
    # Saldo Disponível = Receitas - Despesas - Investimentos
    saldo = total_receitas - total_despesas - float(total_investido_mes)
    total_transacoes = resultado.total_transacoes

    # Calcular dias decorridos no mês para projeção
    if mes == hoje.month and ano == hoje.year:
        dias_decorridos = hoje.day
    else:
        dias_decorridos = (fim_mes - inicio_mes).days

    # Dias totais do mês
    dias_no_mes = (fim_mes - inicio_mes).days

    media_diaria = total_despesas / dias_decorridos if dias_decorridos > 0 else 0
    projecao_mensal = media_diaria * dias_no_mes

    # Comparativo com mês anterior
    data_anterior = inicio_mes - relativedelta(months=1)
    mes_ant, ano_ant = data_anterior.month, data_anterior.year

    despesas_mes_anterior = db.session.query(
        func.coalesce(func.sum(Transacao.valor), 0)
    ).filter(
        Transacao.user_id == user_id,
        Transacao.tipo == 'despesa',
        Transacao.data >= date(ano_ant, mes_ant, 1),
        Transacao.data < inicio_mes
    ).scalar()
    despesas_mes_anterior = float(despesas_mes_anterior)

    variacao_percentual = ((total_despesas - despesas_mes_anterior) / despesas_mes_anterior * 100) if despesas_mes_anterior > 0 else 0

    # Saldo Geral (acumulado de todo o histórico)
    historico_res = db.session.query(
        func.coalesce(func.sum(case((Transacao.tipo == 'receita', Transacao.valor))), 0).label('receitas'),
        func.coalesce(func.sum(case((Transacao.tipo == 'despesa', Transacao.valor))), 0).label('despesas'),
    ).filter(Transacao.user_id == user_id).first()
    
    total_investido_geral = db.session.query(
        func.coalesce(func.sum(Investimento.valor), 0)
    ).filter(Investimento.usuario_id == user_id).scalar()

    saldo_geral = float(historico_res.receitas) - float(historico_res.despesas) - float(total_investido_geral)

    return {
        'mes': mes,
        'ano': ano,
        'mes_ref': f'{ano}-{mes:02d}',
        'total_receitas': round(total_receitas, 2),
        'total_despesas': round(total_despesas, 2),
        'total_investido': round(float(total_investido_mes), 2),
        'saldo': round(saldo, 2),
        'saldo_geral': round(saldo_geral, 2),
        'total_transacoes': total_transacoes,
        'media_diaria_gastos': round(media_diaria, 2),
        'projecao_mensal_gastos': round(projecao_mensal, 2),
        'comparativo_mes_anterior': {
            'despesas_mes_anterior': round(despesas_mes_anterior, 2),
            'variacao_percentual': round(variacao_percentual, 1),
            'tendencia': 'alta' if variacao_percentual > 0 else (
                'baixa' if variacao_percentual < 0 else 'estavel'
            ),
        },
    }


def gastos_por_categoria(user_id, mes=None, ano=None):
    """
    Agrupa despesas por categoria para um mês específico.
    """
    hoje = date.today()
    if mes is None:
        mes = hoje.month
    if ano is None:
        ano = hoje.year

    inicio_mes = date(ano, mes, 1)
    if mes == 12:
        fim_mes = date(ano + 1, 1, 1)
    else:
        fim_mes = date(ano, mes + 1, 1)

    resultados = db.session.query(
        Categoria.id,
        Categoria.nome,
        Categoria.cor,
        Categoria.icone,
        Categoria.limite_mensal,
        func.coalesce(func.sum(Transacao.valor), 0).label('total'),
        func.count(Transacao.id).label('qtd_transacoes'),
    ).join(
        Transacao, Transacao.categoria_id == Categoria.id
    ).filter(
        Transacao.user_id == user_id,
        Transacao.tipo == 'despesa',
        Transacao.data >= inicio_mes,
        Transacao.data < fim_mes
    ).group_by(
        Categoria.id
    ).order_by(
        func.sum(Transacao.valor).desc()
    ).all()

    total_geral = sum(float(r.total) for r in resultados) or 1

    categorias = []
    for r in resultados:
        total = float(r.total)
        item = {
            'categoria_id': r.id,
            'categoria_nome': r.nome,
            'cor': r.cor,
            'icone': r.icone,
            'total': round(total, 2),
            'qtd_transacoes': r.qtd_transacoes,
            'percentual_do_total': round((total / total_geral) * 100, 1),
        }

        if r.limite_mensal:
            item['limite_mensal'] = r.limite_mensal
            item['percentual_do_limite'] = round(
                (total / r.limite_mensal) * 100, 1
            )
            item['dentro_do_limite'] = total <= r.limite_mensal

        categorias.append(item)

    return categorias


def evolucao_mensal(user_id, meses=6):
    """
    Retorna a evolução de receitas e despesas nos últimos N meses.
    """
    hoje = date.today()
    evolucao = []

    for i in range(meses - 1, -1, -1):
        data_ref = hoje - relativedelta(months=i)
        m = data_ref.month
        a = data_ref.year

        inicio = date(a, m, 1)
        if m == 12:
            fim = date(a + 1, 1, 1)
        else:
            fim = date(a, m + 1, 1)

        resultado = db.session.query(
            func.coalesce(func.sum(case((Transacao.tipo == 'receita', Transacao.valor))), 0).label('receitas'),
            func.coalesce(func.sum(case((Transacao.tipo == 'despesa', Transacao.valor))), 0).label('despesas'),
        ).filter(
            Transacao.user_id == user_id,
            Transacao.data >= inicio,
            Transacao.data < fim
        ).first()

        total_investido = db.session.query(
            func.coalesce(func.sum(Investimento.valor), 0)
        ).filter(
            Investimento.usuario_id == user_id,
            Investimento.data >= inicio,
            Investimento.data < fim
        ).scalar()

        receitas = float(resultado.receitas)
        despesas = float(resultado.despesas)
        investido = float(total_investido)

        evolucao.append({
            'mes_ref': f'{a}-{m:02d}',
            'receitas': round(receitas, 2),
            'despesas': round(despesas, 2),
            'investimentos': round(investido, 2),
            'saldo': round(receitas - despesas - investido, 2),
        })

    return evolucao
