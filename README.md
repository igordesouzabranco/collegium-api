<div align="center">

# Collegium API

**API REST de Gestão Universitária de Faculdade**

Node.js · Express 5 · Sequelize 6 · MariaDB

![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?logo=sequelize&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-13.x-003545?logo=mariadb&logoColor=white)
![ESLint](https://img.shields.io/badge/lint-ESLint-4B32C3?logo=eslint&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![Versão](https://img.shields.io/badge/v1.0.0-brightgreen)
![Insomnia](https://img.shields.io/badge/roteiro-99%20requests-orange)

### [https://collegium-api-yt3p.onrender.com](https://collegium-api-yt3p.onrender.com/)

</div>

---

## Sobre

API REST para **gestão universitária de faculdade**: cursos, disciplinas,
turmas, coordenadores, professores, alunos, avaliações, notas e presenças em um
único serviço, com autenticação por JWT e três papéis de acesso.

O sistema cobre o dia a dia da instituição: composição das turmas por curso,
vínculo professor–disciplina, avaliações com notas, chamadas com controle de
presença e boletim consolidado do aluno.

## Recursos

- **Autenticação JWT** com busca de conta em `users`, `coordenadores` e
  `professores`, e verificação de papel em cada rota de escrita.
- **CRUD completo** de 10 recursos, com `GET /:id` devolvendo as relações
  diretas (ex.: aluno com curso e turma, curso com turmas e disciplinas).
- **Regras de negócio** validadas nos services, com mensagem em português:
  turma do aluno no curso do aluno, disciplina no curso da turma, professor
  lecionando a disciplina, aluno na turma da avaliação/chamada e e-mail único
  nas três tabelas de login.
- **Boletim do aluno** (`GET /alunos/:id/boletim`): notas agrupadas por
  disciplina, média geral e presença com percentual.
- **Rotas em lote** dentro de transação (tudo ou nada): chamada da turma e
  lançamento de notas em massa.
- **Filtros por query string** (curso, turma, disciplina, professor, aluno,
  avaliação e data).
- **Exclusões seguras**: `CASCADE` conforme o enunciado e `409` quando há
  vínculo no banco.

## Stack

| Tecnologia | Versão | Papel |
| --- | --- | --- |
| Node.js | 24.x | Runtime |
| Express | 5.x | Servidor HTTP e rotas |
| Sequelize | 6.x | ORM, migrations e seeders |
| MariaDB | 13.x | Banco de dados |
| Sucrase | — | Transpila os ES Modules de `src/` (o `package.json` fica `commonjs`) |
| JWT + bcryptjs | — | Autenticação e hash de senha |
| ESLint | 10.x | Padrão de código |

## Como rodar

**Requisitos:** Node.js 24+, npm e um MariaDB rodando localmente.

```bash
git clone https://github.com/igordesouzabranco/collegium-api.git
cd collegium-api
npm install
```

Crie o arquivo `.env` na raiz, no formato:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=sua_senha
DATABASE=escola
TOKEN_SECRET=qualquer_frase_secreta
TOKEN_EXPIRES_IN=7d
```

Depois crie o banco, aplique as migrations, carregue os dados de demonstração e
suba o servidor:

```sql
CREATE DATABASE escola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev        # http://localhost:3000
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe a API na porta 3000 (nodemon) |
| `npx eslint .` | Lint |
| `npx sequelize-cli db:migrate` | Aplica as 14 migrations |
| `npx sequelize-cli db:migrate:undo:all` | Desfaz tudo (banco do zero) |
| `npx sequelize-cli db:seed:all` | Carrega os seeds (idempotentes) |

> Os seeds podem ser rodados quantas vezes for preciso: antes de inserir, eles
> conferem o que já existe e não duplicam nada.

## Produção

A API está publicada em **[collegium-api-yt3p.onrender.com](https://collegium-api-yt3p.onrender.com/)**:

| Peça | Onde |
| --- | --- |
| Aplicação | Render (plano gratuito) — build `npm install`, start `node -r sucrase/register server.js` |
| Banco | TiDB Cloud Serverless (MySQL compatível, conexão TLS com `DATABASE_SSL=true`) |
| Migrações e seeds | Rodam sempre da máquina local, nunca no Render |

A raiz (`GET /`) devolve uma **página de boas-vindas** para quem abre no
navegador e `{ status: 'ok' }` para clientes de API (negociação pelo cabeçalho
`Accept`). Como o plano gratuito dorme após 15 minutos sem acesso, a primeira
requisição de uma visita pode levar até ~1 minuto para acordar o serviço.

## Contas de teste

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `john.doe@example.com` | `123456` |
| Coordenador | `coord.teste@example.com` | `123456` |
| Professor | `prof.rafael@example.com` | `123456` |

## Permissões

Leitura (`GET`) é liberada para qualquer autenticado; a escrita segue a matriz:

| Recurso | Escrita liberada para |
| --- | --- |
| `/users`, `/coordenadores`, `/cursos`, `/alunos` | somente administrador |
| `/disciplinas`, `/turmas`, `/professores` | administrador e coordenador |
| `/avaliacoes`, `/notas`, `/presencas` | administrador e professor |

Erros sempre no formato `{ errors: ['mensagem'] }`, com status `400`, `401`,
`403`, `404` ou `409`. Sucesso: `200`, `201` (POST) e `204` (DELETE).

## Rotas

### Públicas (sem token)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Boas-vindas (HTML no navegador) ou `{ status: 'ok' }` para clientes de API |
| POST | `/tokens` | Login → `{ token, user: { id, nome, email, role } }` |

### Recursos

| Método | Rota | Escrita |
| --- | --- | --- |
| GET, POST, PUT, DELETE | `/users`, `/coordenadores`, `/cursos`, `/alunos` | administrador |
| GET, POST, PUT, DELETE | `/disciplinas`, `/turmas`, `/professores` | admin + coordenador |
| GET, POST, PUT, DELETE | `/avaliacoes`, `/notas`, `/presencas` | admin + professor |

### Rotas especiais

| Método | Rota | Quem |
| --- | --- | --- |
| GET | `/alunos/:id/boletim` | qualquer autenticado |
| GET | `/turmas/:id/alunos` | qualquer autenticado |
| POST | `/turmas/:id/chamada` | admin + professor |
| POST | `/avaliacoes/:id/notas/lote` | admin + professor |

`POST /turmas/{id}/chamada` — `{ data, presencas: [{ alunoId, presente }] }`

`POST /avaliacoes/{id}/notas/lote` — `{ notas: [{ alunoId, valor }] }`

As duas rotas em lote rodam **dentro de uma transação**: se algum item
violar a regra, nada é gravado; uma chamada repetida no mesmo dia, ou uma nota
já existente, devolve `409`.

### Filtros

| Rota | Query string |
| --- | --- |
| `/alunos` | `?turmaId=`, `?cursoId=` |
| `/turmas` | `?cursoId=` |
| `/disciplinas` | `?cursoId=` |
| `/professores` | `?disciplinaId=` |
| `/avaliacoes` | `?turmaId=`, `?disciplinaId=`, `?professorId=` |
| `/notas` | `?alunoId=`, `?avaliacaoId=`, `?turmaId=`, `?disciplinaId=` |
| `/presencas` | `?alunoId=`, `?turmaId=`, `?data=` |

## Roteiro no Insomnia

O arquivo [`roteiro-insomnia.json`](./roteiro-insomnia.json) contém 99 requests
em 12 pastas: login, CRUD de todos os recursos, filtros, boletim, chamada em
lote, notas em lote e os casos de `400`/`401`/`403`/`404`/`409`.

1. No Insomnia: **Ctrl+O** (File → Import From File) e escolha o arquivo — a
   collection e o ambiente entram juntos, com `base_url` preenchido e as
   variáveis de ambiente criadas.
2. Abra a pasta **1. Autenticação** e execute os 3 logins; copie o campo
   `token` de cada resposta para `tokenAdmin`, `tokenCoord` e `tokenProf`.
3. Execute as pastas na ordem: cada `POST` pede para copiar o id criado para a
   variável `*DemoId` correspondente (descrita no corpo da requisição).

## Estrutura

```
collegium-api/
├── app.js                    # monta o Express e registra os routers
├── server.js                 # sobe o servidor
├── roteiro-insomnia.json     # collection do roteiro (12 pastas, 99 requests)
├── src/
│   ├── config/               # config do Sequelize e do .env
│   ├── controllers/          # um por recurso (requisição → resposta)
│   ├── database/
│   │   ├── index.js          # init + associate de todos os models
│   │   ├── migrations/       # 14 migrations (não editar as já criadas)
│   │   └── seeds/            # 12 seeds idempotentes
│   ├── helpers/              # handleError, AppError, semSenha
│   ├── middlewares/          # loginRequired, authorize
│   ├── models/               # 10 models com associações
│   ├── routes/               # 12 routers com papéis por verb
│   └── services/             # regras de negócio e boletim
├── eslint.config.mjs
├── package.json
├── LICENSE                   # MIT
└── AGENTS.md                 # documento de retomada do projeto
```

## Licença

Este projeto está sob a licença [MIT](./LICENSE).
