from app import create_app
from app.services.resumo_service import resumo_mensal

app = create_app()
with app.app_context():
    res = resumo_mensal(1)
    print(res)
