# AGENTS.md — API REST do Sistema de Gestão Escolar

Documento de retomada: o que já foi feito, como verificar o trabalho e o que
falta. Última atualização: 28/09/2026.

---

## 1. Contexto e restrições do enunciado

API REST de gestão escolar (Node.js + Express 5 + Sequelize 6 + MariaDB)
implementada a partir do DER da disciplina. O trabalho foi dividido em 5 fases,
com parada ao fim de cada uma para o usuário testar:

| Fase | Assunto | Situação |
| --- | --- | --- |
| 1 | Banco: migrations e models | Concluída e testada |
| 2 | Autenticação: JWT, papéis e permissões | Concluída e testada |
| 3 | CRUD dos recursos | Concluída e testada |
| 4 | Boletim e rotas de conveniência | Concluída e testada |
| 5 | Seeders completos e roteiro no Insomnia | **Pendente** |

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
- `GET /:id` devolve as relações diretas (ex.: aluno com curso e turma).
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

---

## 6. Banco: estado atual

- 14 migrations aplicadas (3 antigas da Fase 1 do projeto + 11 do DER).
- Seed existente: `src/database/seeds/20260918013708-criar-users.js` cria o
  administrador `john.doe@example.com` / `123456`.
- Dados de desenvolvimento usados nos testes:
  - curso **id 2** "Desenvolvimento de Sistemas" (tipo `Tecnico`);
  - turma **id 2** "DS-2026/1" (Noite, do curso 2);
  - aluno **id 5** `aluno1@example.com`;
  - coordenador de teste `coord.teste@example.com` / `123456` (criado à mão
    para conferir o 403);
  - `disciplinas`, `professores`, `avaliacoes`, `notas` e `presencas` vazios.
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
```

Cada bateria cria os dados de que precisa, confere status, conteúdo e limpa tudo
ao final (os deletes em cascata são conferidos junto). Para retomar o trabalho,
rode as três baterias e o `npx eslint .` — se tudo passar, nada quebrou.

**Atenção:** esses arquivos vivem fora do repositório e podem sumir entre uma
sessão e outra. Se sumirem, refaça as baterias a partir desta seção.

---

## 8. Passos restantes

### Fase 5 (próxima)

1. **Seeders completos** em `src/database/seeds/`, todos em CommonJS, na ordem
   das dependências: usuários/administrador, coordenadores, cursos, disciplinas,
   vínculo disciplina–curso, turmas, professores, vínculo professor–disciplina,
   alunos, avaliações, notas e presenças. Podem reaproveitar o padrão do seed
   existente (`bcrypt.hash('123456', 10)` nas senhas). Cuidado para não
   quebrar os testes: eles já criam e apagam os próprios dados.
2. **Roteiro no Insomnia**: exportar uma collection (JSON) com a sequência de
   requests que exercita a API inteira — login, CRUD de cada recurso, filtros,
   boletim, chamada em lote, notas em lote e os casos de 400/403/404/409.
3. Ao fim: `npx eslint .`, `npx sequelize-cli db:migrate:undo:all` +
   `db:migrate` + `db:seed:all` (banco do zero) e as três baterias de teste.

### Pendências e decisões já tomadas

- As Fases 1 a 4 estão commitadas e enviadas para `main`
  (`82eb549` + merge `c20588e`). O branch `dev` foi abandonado: agora existe
  só `main`, local e remoto. Todo o trabalho novo entra em `main`.
- O repositório foi renomeado no GitHub para
  `https://github.com/igordesouzabranco/collegium-api.git`; o remote antigo
  ainda funciona por redirecionamento. Para atualizar:
  `git remote set-url origin https://github.com/igordesouzabranco/collegium-api.git`.
- Mudança de comportamento já validada: o `GET /alunos` era público na Fase 2
  e, a partir da Fase 3, passou a exigir token, como as demais leituras.
- O e-mail do aluno é único na tabela `alunos` (constraint do banco, 409) e,
  além disso, não pode coincidir com o e-mail de quem faz login (regra 5, 400).
- Confirmar com o professor responsável se a collection do Insomnia deve ficar
  versionada no repositório ou ser entregue só como arquivo.

---

## 9. Contas e dicas de uso

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `john.doe@example.com` | `123456` |
| Coordenador | `coord.teste@example.com` | `123456` |

Corpos das rotas em lote:

```http
POST /turmas/{id}/chamada
{ "data": "2026-10-05", "presencas": [{ "alunoId": 5, "presente": true }] }

POST /avaliacoes/{id}/notas/lote
{ "notas": [{ "alunoId": 5, "valor": 8.5 }] }
```

No PowerShell, JSON com aspas costuma quebrar no `curl.exe`: salve o corpo em um
arquivo e use `-d "@corpo.json"`, ou monte os testes em um script JavaScript.
