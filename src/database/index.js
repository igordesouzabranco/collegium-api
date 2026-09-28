import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../models/User.js';
import Coordenador from '../models/Coordenador.js';
import Curso from '../models/Curso.js';
import Disciplina from '../models/Disciplina.js';
import Turma from '../models/Turma.js';
import Professor from '../models/Professor.js';
import Aluno from '../models/Aluno.js';
import Avaliacao from '../models/Avaliacao.js';
import Nota from '../models/Nota.js';
import Presenca from '../models/Presenca.js';

const models = [
  User,
  Coordenador,
  Curso,
  Disciplina,
  Turma,
  Professor,
  Aluno,
  Avaliacao,
  Nota,
  Presenca,
];

const connection = new Sequelize(databaseConfig);

models.forEach((model) => model.init(connection));

// As associações dependem de todos os models já inicializados
models.forEach((model) => {
  if (model.associate) {
    model.associate(connection.models);
  }
});
