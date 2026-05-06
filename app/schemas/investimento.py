from app.extensions import ma
from app.models.investimento import Investimento

class InvestimentoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Investimento
        load_instance = True
        include_fk = True

investimento_schema = InvestimentoSchema()
investimentos_schema = InvestimentoSchema(many=True)
