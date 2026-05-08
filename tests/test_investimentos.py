def register_and_get_token(client):
    client.post('/api/auth/register', json={
        'nome': 'Investidor Teste',
        'email': 'invest@test.com',
        'senha': 'password123'
    })

    login_response = client.post('/api/auth/login', json={
        'email': 'invest@test.com',
        'senha': 'password123'
    })
    return login_response.get_json()['token']


def test_create_investment(client):
    token = register_and_get_token(client)

    response = client.post(
        '/api/investimentos',
        json={
            'banco': 'InvestBank',
            'tipo': 'Poupança',
            'valor': 1200.50,
        },
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data['banco'] == 'InvestBank'
    assert data['valor'] == 1200.5


def test_list_investments(client):
    token = register_and_get_token(client)

    client.post(
        '/api/investimentos',
        json={
            'banco': 'InvestBank',
            'tipo': 'Tesouro',
            'valor': 500.00,
        },
        headers={'Authorization': f'Bearer {token}'}
    )

    response = client.get(
        '/api/investimentos',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] == 500.0
    assert len(data['investimentos']) == 1


def test_investment_validation(client):
    token = register_and_get_token(client)

    response = client.post(
        '/api/investimentos',
        json={
            'banco': '',
            'tipo': 'A',
            'valor': 0,
        },
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 400
    data = response.get_json()
    assert 'erro' in data
