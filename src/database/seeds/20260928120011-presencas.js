'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [linhas, alunos] = await Promise.all([
      queryInterface.sequelize.query('SELECT alunoId, turmaId, data FROM presencas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, email, turmaId FROM alunos', { type: QueryTypes.SELECT }),
    ]);
    const jaExiste = new Set(linhas.map((linha) => `${linha.alunoId}:${linha.turmaId}:${linha.data}`));
    const idAluno = new Map(alunos.map((aluno) => [aluno.email, aluno.id]));
    const turmaDoAluno = new Map(alunos.map((aluno) => [aluno.email, aluno.turmaId]));

    // Regra 4: aluno precisa estar na turma da chamada
    const grupos = [
      ['aluno1@example.com', 'aluno2@example.com', 'aluno3@example.com'],
      ['aluno4@example.com', 'aluno5@example.com'],
      ['aluno6@example.com', 'aluno7@example.com'],
      ['aluno8@example.com'],
    ];
    const datas = ['2026-10-06', '2026-10-07', '2026-10-08'];
    const chamadas = [];

    grupos.forEach((grupo) => {
      datas.forEach((data, dia) => {
        grupo.forEach((email, indice) => {
          chamadas.push({
            email,
            data,
            // Falta proposital de vez em quando para o boletim mostrar percentual menor
            presente: (indice + dia) % 4 !== 3,
          });
        });
      });
    });

    const novos = chamadas
      .map((chamada) => ({
        alunoId: idAluno.get(chamada.email),
        turmaId: turmaDoAluno.get(chamada.email),
        data: chamada.data,
        presente: chamada.presente,
      }))
      .filter((chamada) => chamada.alunoId && chamada.turmaId)
      .filter((chamada) => !jaExiste.has(`${chamada.alunoId}:${chamada.turmaId}:${chamada.data}`));

    if (novos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'presencas',
      novos.map((chamada) => ({ ...chamada, createdAt: agora, updatedAt: agora })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
