'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [linhas, alunos, avaliacoes] = await Promise.all([
      queryInterface.sequelize.query('SELECT alunoId, avaliacaoId FROM notas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, email FROM alunos', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM avaliacoes', { type: QueryTypes.SELECT }),
    ]);
    const jaExiste = new Set(linhas.map((linha) => `${linha.alunoId}:${linha.avaliacaoId}`));
    const idAluno = new Map(alunos.map((a) => [a.email, a.id]));
    const idAvaliacao = new Map(avaliacoes.map((a) => [a.nome, a.id]));

    // Regra 3: aluno precisa estar na turma da avaliação (mesma turma dos candidatos)
    const pares = [
      ['aluno1@example.com', 'Prova 1 - Lógica DS-2026/1', 8.5],
      ['aluno2@example.com', 'Prova 1 - Lógica DS-2026/1', 6],
      ['aluno3@example.com', 'Prova 1 - Lógica DS-2026/1', 9.5],
      ['aluno1@example.com', 'Prova 1 - Banco de Dados DS-2026/1', 7],
      ['aluno2@example.com', 'Prova 1 - Banco de Dados DS-2026/1', 9],
      ['aluno3@example.com', 'Prova 1 - Banco de Dados DS-2026/1', 5.5],
      ['aluno1@example.com', 'Trabalho Prático - Web DS-2026/1', 10],
      ['aluno2@example.com', 'Trabalho Prático - Web DS-2026/1', 8],
      ['aluno3@example.com', 'Trabalho Prático - Web DS-2026/1', 7.5],
      ['aluno4@example.com', 'Prova 1 - Lógica DS-2026/2', 6.5],
      ['aluno5@example.com', 'Prova 1 - Lógica DS-2026/2', 9],
      ['aluno6@example.com', 'Prova 1 - Gestão ADM-2026/1', 8],
      ['aluno7@example.com', 'Prova 1 - Gestão ADM-2026/1', 7],
      ['aluno8@example.com', 'Prova 1 - Redes RC-2026/1', 9.5],
    ];

    const novos = pares
      .map(([aluno, avaliacao, valor]) => ({
        alunoId: idAluno.get(aluno),
        avaliacaoId: idAvaliacao.get(avaliacao),
        valor,
      }))
      .filter((nota) => nota.alunoId && nota.avaliacaoId)
      .filter((nota) => !jaExiste.has(`${nota.alunoId}:${nota.avaliacaoId}`));

    if (novos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'notas',
      novos.map((nota) => ({ ...nota, createdAt: agora, updatedAt: agora })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
