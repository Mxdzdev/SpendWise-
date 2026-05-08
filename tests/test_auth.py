import pytest
from app.models.user import User


def test_register(client):
    response = client.post('/api/auth/register', json={
        'nome': 'Test User',
        'email': 'test@example.com',
        'senha': 'password123'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'token' in data
    assert data['usuario']['email'] == 'test@example.com'


def test_register_duplicate_email(client):
    # First register
    client.post('/api/auth/register', json={
        'nome': 'Test User',
        'email': 'test@example.com',
        'senha': 'password123'
    })
    # Try again
    response = client.post('/api/auth/register', json={
        'nome': 'Another User',
        'email': 'test@example.com',
        'senha': 'password456'
    })
    assert response.status_code == 409


def test_login(client):
    # Register first
    client.post('/api/auth/register', json={
        'nome': 'Test User',
        'email': 'test@example.com',
        'senha': 'password123'
    })
    # Login
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'senha': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data


def test_login_invalid(client):
    response = client.post('/api/auth/login', json={
        'email': 'wrong@example.com',
        'senha': 'wrongpass'
    })
    assert response.status_code == 401


def test_me(client):
    client.post('/api/auth/register', json={
        'nome': 'Test User',
        'email': 'test@example.com',
        'senha': 'password123'
    })

    login_response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'senha': 'password123'
    })
    token = login_response.get_json()['token']

    response = client.get(
        '/api/auth/me',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['email'] == 'test@example.com'