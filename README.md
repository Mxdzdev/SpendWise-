# 💰 SpendWise - Financial Intelligence Dashboard & API

Sistema Full-Stack completo para gestão e inteligência financeira pessoal. Desenvolvido com **React (Vite)** no Frontend e **Python (Flask)** no Backend.

> Projeto de alto nível, estruturado com foco em **lógica de negócio real e experiência de usuário premium**: assistente de registro inteligente em chat, categorias com definição de limites de gastos, alertas automáticos ao exceder 80% do orçamento, resumos mensais com gráficos dinâmicos e UI/UX Dark Mode "Neon".

---

## 🚀 Tecnologias

### 🎨 Frontend
| Stack | Tecnologia |
|-------|-----------|
| Framework | React (Vite) |
| Roteamento | React Router DOM |
| Estilização | Vanilla CSS (Variáveis, Custom Theming) |
| Gráficos | Chart.js + react-chartjs-2 |
| Ícones | Lucide React |
| Requisições | Axios (com interceptor de JWT) |

### ⚙️ Backend
| Stack | Tecnologia |
|-------|-----------|
| Framework | Flask 3.1 |
| ORM | SQLAlchemy + Flask-SQLAlchemy |
| Auth | JWT (Flask-JWT-Extended) |
| Validação | Marshmallow |
| Banco | SQLite (dev) / PostgreSQL (prod) |

---

## ✨ Funcionalidades em Destaque

1. **Smart Input (Chat Assistant)**: Registre despesas conversando naturalmente com o sistema. Ex: *"Gastei 50 reais no iFood"*, e o sistema processa valor e categoria automaticamente.
2. **Dashboard Visual**: Gráficos de rosca (Doughnut) atualizados em tempo real com resumos de gastos mensais e cálculo de saldo.
3. **Limite de Gastos e Alertas (Regras de Negócio)**:
   - Ao criar uma despesa, o sistema verifica o limite configurado na categoria.
   - **🟡 80% do limite:** Sistema dispara notificação de aviso.
   - **🔴 100% do limite:** Sistema dispara alerta crítico na Dashboard.
4. **Interface Dark Premium**: Layout em estilo "Glassmorphism" voltado ao contraste alto e usabilidade focada com cores guias (Verde Neon).

---

## ⚡ Setup Rápido (Rodando Local)

### 1. Iniciando o Backend (API)

```bash
# 1. Entre na pasta raiz e crie o ambiente virtual
python -m venv venv
venv\Scripts\activate        # No Windows
# source venv/bin/activate   # No Linux/Mac

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Popule o banco com dados de demonstração (Categorias, Transações e Alertas)
python seed.py

# 4. Inicie o servidor Backend
python run.py
```
A API estará disponível em `http://localhost:5000`

### 2. Iniciando o Frontend (UI)

Abra **outro terminal**, vá para a pasta `frontend` e rode:

```bash
cd frontend

# 1. Instale os pacotes Node
npm install

# 2. Rode o servidor de desenvolvimento
npm run dev
```
O Dashboard estará disponível em `http://localhost:5173`.

### 🔑 Credenciais de Demonstração
Utilize o botão de login para acessar a área interna com a conta semeada:
- **Email:** `joao@email.com`
- **Senha:** `123456`

---

## 📁 Estrutura do Projeto

```
algo/
├── backend (raiz)/
│   ├── app/                 # Backend Application (Flask Factory)
│   │   ├── config.py        # Environment configs
│   │   ├── extensions.py    # SQLAlchemy, JWT
│   │   ├── models/          # User, Categoria, Transacao, Alerta
│   │   ├── routes/          # REST Endpoints
│   │   └── services/        # Regras de Negócio (Alertas, Limites, Resumo)
│   ├── run.py               # Entry point backend
│   └── seed.py              # Script injetor de dados Mock
│
└── frontend/                # Frontend Application (React/Vite)
    ├── src/
    │   ├── components/      # Sidebar, PrivateRoute
    │   ├── contexts/        # AuthContext (JWT State Management)
    │   ├── pages/           # Login, Dashboard, Transactions, Categories
    │   ├── utils/           # Axios API Client e Formatadores
    │   └── index.css        # CSS Global Customizado (Dark Theme)
    └── package.json
```

---

## 👨‍💻 Autor

Desenvolvido como projeto full-stack de portfólio para demonstrar o domínio de ponta-a-ponta em desenvolvimento moderno:
- Integração front-to-back com JWT e proteção de rotas privadas.
- Criação e manipulação de estado complexo em React.
- Design de APIs robustas com regras de negócio orientadas a serviços.
- UI/UX focado em experiência imersiva e responsividade sem frameworks engessados.
