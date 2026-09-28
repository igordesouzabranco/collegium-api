import Aluno from '../models/Aluno.js';
import Curso from '../models/Curso.js';
import Turma from '../models/Turma.js';
import handleError from '../helpers/handleError.js';
import { emailUnico } from '../services/AcessoService.js';
import { validarCursoETurma } from '../services/AlunoService.js';
import montarBoletim from '../services/BoletimService.js';

const INCLUIR = [
  { model: Curso, as: 'curso' },
  { model: Turma, as: 'turma' },
];

class AlunoController {
  async index(req, res) {
    try {
      const { turmaId, cursoId } = req.query;
      const where = {};
      if (turmaId) where.turmaId = turmaId;
      if (cursoId) where.cursoId = cursoId;

      const alunos = await Aluno.findAll({
        where,
        include: INCLUIR,
        order: [['id', 'DESC']],
      });
      return res.json(alunos);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id, { include: INCLUIR });
      if (!aluno) {
        return res.status(404).json({ errors: ['Aluno não encontrado'] });
      }
      return res.json(aluno);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { cursoId, turmaId } = req.body;

      await emailUnico(req.body.email, { tabela: 'alunos' });
      // Regra 1: turma precisa pertencer ao curso
      await validarCursoETurma(cursoId, turmaId);

      const aluno = await Aluno.create(req.body);
      const criado = await Aluno.findByPk(aluno.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) {
        return res.status(404).json({ errors: ['Aluno não encontrado'] });
      }

      const cursoId = req.body.cursoId ?? aluno.cursoId;
      const turmaId = req.body.turmaId ?? aluno.turmaId;

      await emailUnico(req.body.email, { tabela: 'alunos', id: aluno.id });
      // Regra 1 (só quando o corpo traz os dois dados)
      if (req.body.cursoId !== undefined || req.body.turmaId !== undefined) {
        await validarCursoETurma(cursoId, turmaId);
      }

      await aluno.update(req.body);
      const atualizado = await Aluno.findByPk(aluno.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) {
        return res.status(404).json({ errors: ['Aluno não encontrado'] });
      }

      // Se houver notas/presenças, o banco responde com FK RESTRICT -> 409
      await aluno.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }

  // Boletim: notas por disciplina + presença (só as chamadas do aluno)
  async boletim(req, res) {
    try {
      const boletim = await montarBoletim(req.params.id);
      return res.json(boletim);
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new AlunoController();
