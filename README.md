Projeto Django gerado automaticamente — skeleton do back-end.

Estrutura principal:
- inventory/             -> projeto Django
- products/              -> app com models Product e StockMovement
- requirements.txt       -> dependências
- manage.py              -> script de gerenciamento
- README.md              -> este arquivo

Instruções rápidas:
1) Crie um ambiente virtual:
   python -m venv .venv
   source .venv/bin/activate  # linux/mac
   .\.venv\Scripts\activate # windows

2) Instale dependências:
   pip install -r requirements.txt

3) Rode migrações e crie superuser:
   python manage.py migrate
   python manage.py createsuperuser

4) Rode o servidor:
   python manage.py runserver

Endpoints principais (API REST):
- /api/token/           -> obter token JWT (POST username & password)
- /api/token/refresh/   -> refresh token
- /api/products/        -> list/create products (GET/POST)
- /api/products/{pk}/   -> retrieve/update/delete (GET/PUT/PATCH/DELETE)
- /api/movements/       -> registro de entradas/saídas de estoque

Este é um esqueleto inicial; ajuste conforme a especificação do avaliador.
