'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [linhas, cursos, turmas] = await Promise.all([
      queryInterface.sequelize.query('SELECT email FROM alunos', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM cursos', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM turmas', { type: QueryTypes.SELECT }),
    ]);
    const existentes = new Set(linhas.map((linha) => linha.email));
    const idCurso = new Map(cursos.map((curso) => [curso.nome, curso.id]));
    const idTurma = new Map(turmas.map((turma) => [turma.nome, turma.id]));

    // A turma precisa pertencer ao mesmo curso do aluno (regra 1 do AlunoService)
    const candidatos = [
      { nomeCompleto: 'Ana Beatriz Souza', dataNascimento: '2005-03-14', email: 'aluno1@example.com', curso: 'Desenvolvimento de Sistemas', turma: 'DS-2026/1' },
      { nomeCompleto: 'Bruno Carvalho Lima', dataNascimento: '2004-08-22', email: 'aluno2@example.com', curso: 'Desenvolvimento de Sistemas', turma: 'DS-2026/1' },
      { nomeCompleto: 'Carla Dias Rocha', dataNascimento: '2005-12-01', email: 'aluno3@example.com', curso: 'Desenvolvimento de Sistemas', turma: 'DS-2026/1' },
      { nomeCompleto: 'Diego Almeida Silva', dataNascimento: '2005-05-30', email: 'aluno4@example.com', curso: 'Desenvolvimento de Sistemas', turma: 'DS-2026/2' },
      { nomeCompleto: 'Elisa Fernandes Costa', dataNascimento: '2004-10-17', email: 'aluno5@example.com', curso: 'Desenvolvimento de Sistemas', turma: 'DS-2026/2' },
      { nomeCompleto: 'Felipe Gomes Martins', dataNascimento: '2005-02-09', email: 'aluno6@example.com', curso: 'Técnico em Administração', turma: 'ADM-2026/1' },
      { nomeCompleto: 'Gabriela Ribeiro Alves', dataNascimento: '2004-06-25', email: 'aluno7@example.com', curso: 'Técnico em Administração', turma: 'ADM-2026/1' },
      { nomeCompleto: 'Henrique Nunes Prado', dataNascimento: '2005-09-03', email: 'aluno8@example.com', curso: 'Redes de Computadores', turma: 'RC-2026/1' },
    ].filter((aluno) => !existentes.has(aluno.email));

    if (candidatos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'alunos',
      candidatos.map((aluno) => ({
        nomeCompleto: aluno.nomeCompleto,
        dataNascimento: aluno.dataNascimento,
        email: aluno.email,
        cursoId: idCurso.get(aluno.curso),
        turmaId: idTurma.get(aluno.turma),
        createdAt: agora,
        updatedAt: agora,
      })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
