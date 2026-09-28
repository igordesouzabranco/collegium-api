# AGENTS.md — API REST do Sistema de Gestão Escolar

Documento de retomada: o que já foi feito, como verificar o trabalho e o que
falta. Última atualização: 28/09/2026.

---

## 1. Contexto e restrições do enunciado

API REST de **gestão universitária de faculdade** (Node.js + Express 5 +
Sequelize 6 + MariaDB) implementada a partir do DER da disciplina. O DER fala em
"sistema de gestão escolar", mas o foco do produto é faculdade — decisão do
usuário em 28/09/2026; o `README.md` já usa essa linguagem. O trabalho foi
dividido em 5 fases, com parada ao fim de cada uma para o usuário testar:

| Fase | Assunto | Situação |
| --- | --- | --- |
| 1 | Banco: migrations e models | Concluída e testada |
| 2 | Autenticação: JWT, papéis e permissões | Concluída e testada |
| 3 | CRUD dos recursos | Concluída e testada |
| 4 | Boletim e rotas de conveniência | Concluída e testada |
| 5 | Seeders completos e roteiro no Insomnia | Concluída e testada |

Restrições que continuam valendo:

- Nenhuma dependência nova; nada de `sequelize.sync()`.
- `package.json` mantém `"type": "commonjs"`: migrations e seeds ficam em
  CommonJS; o código em `src/` usa ES Modules e é transpilado pelo sucrase
  (o nodemon já sobe o servidor com `node -r sucrase/register`).
- Estilo: 2 espaços, aspas simples, ponto e vírgula, imports locais com `.js`,
  controllers exportados como instância (`export default new XController()`),
  comentários e mensagens de erro em português.
- Não editar migrations já criadas. Não usar `underscored`; timestamps
  (`createdAt`/`updatedAt`) ligados em todos os models.
- Status: 200, 201 (POST), 204 (DELETE), 400, 401, 403, 404 e 409.
- Erros sempre no formato `{ errors: ['mensagem'] }`, respondidos pelo único
  helper `src/helpers/handleError.js`.
- Fora do escopo (não fazer): PDF, paginação, fotos, escopo por coordenador ou
  professor, recuperação de senha, testes automatizados com framework e deploy.

---

## 2. Comandos úteis

| O quê | Comando |
| --- | --- |
| Subir a API (porta 3000) | `npm run dev` |
| Lint | `npx eslint .` |
| Aplicar migrations | `npx sequelize-cli db:migrate` |
| Ver status das migrations | `npx sequelize-cli db:migrate:status` |
| Desfazer tudo (testar do zero) | `npx sequelize-cli db:migrate:undo:all` |
| Rodar todos os seeds | `npx sequelize-cli db:seed:all` |

- O `.sequelizerc` aponta as migrations para `src/database/migrations` e os
  seeds para `src/database/seeds`.
- Se a porta 3000 estiver ocupada por outra instância do servidor, encerre-a
  antes de subir a sua (`npm run dev`).
- O `.env` usa `override: true` em `src/config/database.js`, porque existem
  variáveis de ambiente do Neon na máquina que sobrescreveriam o banco local.
  Banco: `escola` em `localhost:3306`, usuário `root`.

---

## 3. Regras de negócio e matriz de permissões

Regras ficam nos services (violação = 400 com mensagem em português):

1. `AlunoService` — a turma do aluno precisa pertencer ao curso do aluno.
2. `AvaliacaoService` — a disciplina precisa estar no curso da turma e o
   professor precisa lecionar essa disciplina.
3. `NotaService` — o aluno precisa estar na turma da avaliação.
4. `PresencaService` — o aluno precisa estar na turma da chamada.
5. `AcessoService.emailUnico` — o e-mail não pode existir em `users`,
   `coordenadores` nem `professores` (as três tabelas de login).

Matriz de escrita (leitura é sempre permitida a qualquer autenticado):

| Recurso | Escrita liberada para |
| --- | --- |
| `users`, `coordenadores`, `cursos`, `alunos` | somente administrador |
| `disciplinas`, `turmas`, `professores` | administrador e coordenador |
| `avaliacoes`, `notas`, `presencas` | administrador e professor |

`DELETE` com vínculo no banco devolve 409 com
`"Não é possível excluir: existem registros vinculados."`

---

## 4. O que já foi feito

### Fase 1 — Banco

- 11 migrations (`20260927100001` a `20260927100011`): coordenadores, cursos,
  disciplinas, disciplinas_cursos, turmas, professores, professores_disciplinas,
  recriar-alunos, avaliacoes, notas e presencas.
- 9 models novos, mais `Aluno` e `User` reescritos; `src/database/index.js`
  com `init` e `associate` de todos.
- PKs compostas nas tabelas associativas, uniques corretas e 15 FKs com
  `onDelete` conforme a spec (SET NULL, CASCADE e RESTRICT).
- Verificado com `db:migrate:undo:all` seguido de `db:migrate` (do zero) e com
  um teste de transação com rollback.

### Fase 2 — Autenticação

- `TokenController` (`POST /tokens`): procura em `users`, depois em
  `coordenadores` e por fim em `professores`; erro único 401
  `"Credenciais inválidas"`; JWT com `id`, `email` e `role`; resposta
  `{ token, user: { id, nome, email, role } }`.
- `src/middlewares/loginRequired.js`: valida o token, confere se a conta do
  papel ainda existe e preenche `req.userId`, `req.userEmail`, `req.userRole` e
  `req.userNome`.
- `src/middlewares/authorize.js`: devolve 403 `{ errors: ['Acesso negado'] }`
  quando o papel não está liberado.
- CRUD de `/users` com `:id` (201 no POST, 204 no DELETE, sem `password_hash`).

### Fase 3 — CRUD

- Services: `AlunoService`, `AvaliacaoService`, `NotaService`,
  `PresencaService` e `AcessoService` (regras 1 a 5 acima).
- 9 controllers novos em `src/controllers/`: `Coordenador`, `Curso`,
  `Disciplina`, `Turma`, `Professor`, `Aluno` (reescrito), `Avaliacao`, `Nota`
  e `Presenca`.
- 9 rotas novas em `src/routes/` + `src/routes/aluno.js` reescrita; todas
  registradas em `app.js`.
- Leituras com filtros por query string: `?turmaId=`, `?cursoId=`,
  `?disciplinaId=`, `?professorId=`, `?alunoId=`, `?avaliacaoId=`, `?data=`.
  O filtro `?cursoId=` de `/disciplinas` foi acrescentado na Fase 5, quando o
  roteiro do Insomnia passou a prometê-lo.
- `GET /:id` devolve as relações diretas (ex.: aluno com curso e turma; curso
  com coordenador, disciplinas e turmas — os turmas entram também na Fase 5).
- Corpos: `coordenadores` recebe `cursoIds` (o POST exige ao menos 1 item; no
  PUT substitui o conjunto e os removidos ficam sem coordenador); `disciplinas`
  e `professores` usam `cursoIds`/`disciplinaIds` do mesmo jeito.

### Fase 4 — Boletim e conveniências

- `src/services/BoletimService.js` e `GET /alunos/:id/boletim`: notas agrupadas
  por disciplina (média de cada grupo), `mediaGeral` e presença com
  `totalAulas`, `presentes`, `faltas` e `percentual`. **A presença conta só
  as chamadas do próprio aluno** (decisão do usuário).
- `GET /turmas/:id/alunos`: alunos da turma em ordem alfabética; turma
  inexistente devolve 404.
- `POST /turmas/:id/chamada`: `{ data, presencas: [{ alunoId, presente }] }`.
- `POST /avaliacoes/:id/notas/lote`: `{ notas: [{ alunoId, valor }] }`.
- As duas rotas em lote repetem as regras 3 e 4 e rodam **dentro de uma
  transação**: se um item falhar, nada é gravado. Dia repetido ou aluno já com
  nota devolvem 409.
- Permissões: boletim e lista da turma = qualquer autenticado; chamada e notas
  em lote = administrador e professor.

### Fase 5 — Seeders e roteiro no Insomnia

- 11 seeds novos em `src/database/seeds/` (`20260928120001` a
  `20260928120011`), na ordem das dependências: coordenadores, cursos,
  disciplinas, disciplina–curso, turmas, professores, professor–disciplina,
  alunos, avaliações, notas e presencas. O seed antigo de `users` foi
  reescrito para ficar idempotente.
- Todos os seeds são **idempotentes**: antes de inserir, eles leem as chaves
  naturais (e-mail, nome) com `sequelize.query(..., { type: QueryTypes.SELECT })`
  e inserem só o que falta. Poder `db:seed:all` duas vezes não duplica nada.
- Base de dados do roteiro: 1 admin, 2 coordenadores, 3 cursos, 6 disciplinas,
  4 turmas, 3 professores (cada um com 2 disciplinas), 8 alunos, 6 avaliações,
  14 notas e 24 presenças (chamadas de 2026-10-06 a 2026-10-08).
- `roteiro-insomnia.json` (raiz do projeto): collection exportada do Insomnia
  (formato v4) com 12 pastas e 99 requests — login, CRUD de todos os
  recursos, filtros, boletim, chamada em lote, notas em lote e os casos de
  400/401/403/404/409. O ambiente traz `base_url`, os três tokens e variáveis
  `*DemoId`: copie nelas os ids que a própria collection pede (a 1ª pasta
  explica).
- Detalhe de ordem: a pasta 9 cria e apaga a avaliação demo; por isso a pasta
  10 cria a própria avaliação base antes das notas. `DELETE /avaliacoes` com
  notas do lote é 409 (RESTRICT), como no fim da pasta 10.
- As promessas do roteiro (status, conteúdos, filtros e formato de erro) foram
  conferidas uma a uma contra a API viva pelo `smoke-roteiro.js` (76 casos).

---

## 5. Achados técnicos do Sequelize 6 (não redescobrir)

- `Model.scope('x')` **substitui** o `defaultScope` (`_scope = {}`); para
  juntar escopos, declare tudo em um só.
- `attributes: {}` ou `include` trazem todos os campos; defaults só são
  aplicados quando `isNewRecord` é verdadeiro.
- `timestamps: false` no model `through` (string) remove `createdAt`/
  `updatedAt` da tabela associativa.
- A validação roda **antes** do hook `beforeSave`: por isso `password_hash` não
  tem `allowNull: false` no model (o hash é gerado no hook).
- `Model.create` e `Model.update` devolvem a instância **crua**, com
  `password_hash` e a senha em texto: use `src/helpers/semSenha.js` na
  resposta.
- `UniqueConstraintError` **herda** de `ValidationError`: cheque antes no
  `handleError`.
- O Express não preserva `this` no handler; métodos usam `req`/`res` direto.
- `password` é um campo VIRTUAL com validação de 6 a 255 caracteres; um PUT sem
  senha falharia, por isso `semSenhaVazia` apaga a senha vazia antes de salvar.
- `sequelize.query(sql)` no dialect `mariadb` precisa de
  `{ type: QueryTypes.SELECT }`: sem o `type`, a query simples quebra com
  `Cannot delete property 'meta' of [object Array]`.

---

## 6. Banco: estado atual

- 14 migrations aplicadas (3 antigas da Fase 1 do projeto + 11 do DER) e
  12 seeds (o de `users` mais os 11 da Fase 5), todos idempotentes.
- Contagens depois de `db:migrate:undo:all` + `db:migrate` + `db:seed:all`:
  1 user, 2 coordenadores, 3 cursos, 6 disciplinas, 6 pares disciplina–curso,
  4 turmas, 3 professores, 6 pares professor–disciplina, 8 alunos, 6
  avaliações, 14 notas e 24 presenças.
- Ids que os testes e o roteiro usam (banco zerado):
  - curso **id 1** "Técnico em Administração", **id 2** "Desenvolvimento de
    Sistemas" (Tecnico), **id 3** "Redes de Computadores";
  - turma **id 1** "ADM-2026/1", **id 2** "DS-2026/1" (Noite, curso 2),
    **id 3** "DS-2026/2", **id 4** "RC-2026/1";
  - coordenadores **1** Mariana Alves (`coord.academico@example.com`) e
    **2** Coordenador Teste (`coord.teste@example.com`); user **1** John Doe;
  - aluno **1** `aluno1@example.com` (turma 2) até aluno **8** (turma 4);
  - professores **1** Rafael Martins (`prof.rafael@example.com`), **2**
    Juliana Prado, **3** Paulo Ferreira — cada um com 2 disciplinas.
- A ordem dos arrays nos seeds é o que garante esses ids: não reordene os
  arquivos de seed sem refazer os testes.
- O auto-incremento "pula" números por causa do rollback dos testes da Fase 1:
  é esperado.
- Exclusão: apagar aluno **apaga as notas e presenças** dele (CASCADE, 204);
  apagar avaliação com notas, turma com alunos, professor com avaliações, curso
  com turmas ou disciplina com avaliações devolve 409 (RESTRICT).

---

## 7. Como verificar o trabalho

Baterias de teste em JavaScript puro (usam `fetch` contra `localhost:3000`)
estão na pasta temporária do sistema:

```
C:\Users\admin\AppData\Local\Temp\opencode\testes-fase2.js   (27/27)
C:\Users\admin\AppData\Local\Temp\opencode\testes-fase3.js   (80/80)
C:\Users\admin\AppData\Local\Temp\opencode\testes-fase4.js   (36/36)
C:\Users\admin\AppData\Local\Temp\opencode\smoke-roteiro.js  (76/76)
```

Cada bateria cria os dados de que precisa, confere status, conteúdo e limpa tudo
ao final (os deletes em cascata são conferidos junto). O `smoke-roteiro.js`
confere, contra a API viva, o que o `roteiro-insomnia.json` promete (filtros,
regras 2 a 4, transações dos lotes, 401/403/404/409) e apaga o que cria. Para
retomar o trabalho, rode as quatro baterias e o `npx eslint .` — se tudo passar,
nada quebrou.

**Atenção:** esses arquivos vivem fora do repositório e podem sumir entre uma
sessão e outra. Se sumirem, refaça as baterias a partir desta seção.

---

## 8. Passos restantes

### Fase 5 (concluída)

1. **Seeders completos** em `src/database/seeds/` — prontos e idempotentes
   (seção 4).
2. **Roteiro no Insomnia**: `roteiro-insomnia.json` na raiz, 12 pastas e 99
   requests (seção 4).
3. Verificação do fim da fase, feita em 28/09/2026, tudo verde:
   `npx eslint .` limpo → `db:migrate:undo:all` → `db:migrate` → `db:seed:all`
   → `testes-fase2.js` 27/27 → `testes-fase3.js` 80/80 → `testes-fase4.js`
   36/36 → `smoke-roteiro.js` 76/76 (banco volta exatamente ao estado dos
   seeds).

### Pendências e decisões já tomadas

- As 5 fases estão commitadas e enviadas para `main`: Fases 1 a 4 em
  `82eb549` + merge `c20588e` + `b25cf52`, Fase 5 (seeds,
  `roteiro-insomnia.json`, este `AGENTS.md`) em `81ee9d1`. O branch `dev` foi
  abandonado: agora existe só `main`, local e remoto. Todo o trabalho novo
  entra em `main`.
- O repositório foi renomeado no GitHub para
  `https://github.com/igordesouzabranco/collegium-api.git` e **o remote local
  já foi atualizado** (`git remote set-url origin ...`); o nome antigo
  `apirestjs` redireciona.
- Mudança de comportamento já validada: o `GET /alunos` era público na Fase 2
  e, a partir da Fase 3, passou a exigir token, como as demais leituras.
- O e-mail do aluno é único na tabela `alunos` (constraint do banco, 409) e,
  além disso, não pode coincidir com o e-mail de quem faz login (regra 5, 400).
- Decisão do usuário (28/09/2026): a collection do Insomnia fica **versionada
  no repositório** (`roteiro-insomnia.json` na raiz), junto com o `README.md`
  criado nesta data (badges, instalação, contas, rotas e filtros). O README
  apresenta a API como **gestão universitária de faculdade** e não lista as
  fases do trabalho — a tabela de fases fica só neste arquivo.

---

## 9. Contas e dicas de uso

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `john.doe@example.com` | `123456` |
| Coordenador | `coord.teste@example.com` | `123456` |
| Professor | `prof.rafael@example.com` | `123456` |

Corpos das rotas em lote:

```http
POST /turmas/{id}/chamada
{ "data": "2026-10-05", "presencas": [{ "alunoId": 5, "presente": true }] }

POST /avaliacoes/{id}/notas/lote
{ "notas": [{ "alunoId": 5, "valor": 8.5 }] }
```

No PowerShell, JSON com aspas costuma quebrar no `curl.exe`: salve o corpo em um
arquivo e use `-d "@corpo.json"`, ou monte os testes em um script JavaScript.
