import Turma from '../models/Turma.js';
import Aluno from '../models/Aluno.js';
import Curso from '../models/Curso.js';
import handleError from '../helpers/handleError.js';
import AppError from '../helpers/AppError.js';
import { registrarChamada } from '../services/PresencaService.js';

const INCLUIR = [{ model: Curso, as: 'curso' }];

class TurmaController {
  async index(req, res) {
    try {
      const { cursoId } = req.query;
      const turmas = await Turma.findAll({
        where: cursoId ? { cursoId } : undefined,
        include: INCLUIR,
        order: [['id', 'DESC']],
      });
      return res.json(turmas);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const turma = await Turma.findByPk(req.params.id, { include: INCLUIR });
      if (!turma) {
        return res.status(404).json({ errors: ['Turma não encontrada'] });
      }
      return res.json(turma);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const curso = await Curso.findByPk(req.body.cursoId);
      if (!curso) {
        throw new AppError(400, ['Curso não encontrado']);
      }

      const turma = await Turma.create(req.body);
      const criado = await Turma.findByPk(turma.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const turma = await Turma.findByPk(req.params.id);
      if (!turma) {
        return res.status(404).json({ errors: ['Turma não encontrada'] });
      }

      if (req.body.cursoId) {
        const curso = await Curso.findByPk(req.body.cursoId);
        if (!curso) {
          throw new AppError(400, ['Curso não encontrado']);
        }
      }

      await turma.update(req.body);
      const atualizado = await Turma.findByPk(turma.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const turma = await Turma.findByPk(req.params.id);
      if (!turma) {
        return res.status(404).json({ errors: ['Turma não encontrada'] });
      }

      // Com alunos/vínculos o banco responde com FK RESTRICT -> 409
      await turma.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }

  // Alunos matriculados nesta turma
  async alunos(req, res) {
    try {
      const turma = await Turma.findByPk(req.params.id);
      if (!turma) {
        return res.status(404).json({ errors: ['Turma não encontrada'] });
      }

      const alunos = await Aluno.findAll({
        where: { turmaId: turma.id },
        include: INCLUIR,
        order: [['nomeCompleto', 'ASC']],
      });
      return res.json(alunos);
    } catch (error) {
      return handleError(res, error);
    }
  }

  // Chamada do dia inteira de uma vez (tudo ou nada)
  async chamada(req, res) {
    try {
      const chamadas = await registrarChamada(req.params.id, req.body);
      return res.status(201).json(chamadas);
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new TurmaController();
