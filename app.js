import dotenv from 'dotenv';
dotenv.config();

import './src/database';

import express from 'express';
import homeRouter from './src/routes/home';
import userRouter from './src/routes/user.js';
import tokenRouter from './src/routes/token.js';
import alunoRouter from './src/routes/aluno.js';
import coordenadorRouter from './src/routes/coordenador.js';
import cursoRouter from './src/routes/curso.js';
import disciplinaRouter from './src/routes/disciplina.js';
import turmaRouter from './src/routes/turma.js';
import professorRouter from './src/routes/professor.js';
import avaliacaoRouter from './src/routes/avaliacao.js';
import notaRouter from './src/routes/nota.js';
import presencaRouter from './src/routes/presenca.js';
// import fotoRouter from './src/routes/foto.js';



class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/', homeRouter);
    this.app.use('/users/', userRouter);
    this.app.use('/tokens/', tokenRouter);
    this.app.use('/alunos/', alunoRouter);
    this.app.use('/coordenadores/', coordenadorRouter);
    this.app.use('/cursos/', cursoRouter);
    this.app.use('/disciplinas/', disciplinaRouter);
    this.app.use('/turmas/', turmaRouter);
    this.app.use('/professores/', professorRouter);
    this.app.use('/avaliacoes/', avaliacaoRouter);
    this.app.use('/notas/', notaRouter);
    this.app.use('/presencas/', presencaRouter);
//    this.app.use('/fotos/', fotoRouter);
  }
}

export default new App().app;
