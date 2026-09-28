import Avaliacao from '../models/Avaliacao.js';
import Disciplina from '../models/Disciplina.js';
import Turma from '../models/Turma.js';
import Professor from '../models/Professor.js';
import handleError from '../helpers/handleError.js';
import { validarVinculos } from '../services/AvaliacaoService.js';
import { lancarNotasLote } from '../services/NotaService.js';

const INCLUIR = [
  { model: Disciplina, as: 'disciplina' },
  { model: Turma, as: 'turma' },
  { model: Professor, as: 'professor' },
];

class AvaliacaoController {
  async index(req, res) {
    try {
      const { turmaId, disciplinaId, professorId } = req.query;
      const where = {};
      if (turmaId) where.turmaId = turmaId;
      if (disciplinaId) where.disciplinaId = disciplinaId;
      if (professorId) where.professorId = professorId;

      const avaliacoes = await Avaliacao.findAll({
        where,
        include: INCLUIR,
        order: [['id', 'DESC']],
      });
      return res.json(avaliacoes);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const avaliacao = await Avaliacao.findByPk(req.params.id, { include: INCLUIR });
      if (!avaliacao) {
        return res.status(404).json({ errors: ['Avaliação não encontrada'] });
      }
      return res.json(avaliacao);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { disciplinaId, turmaId, professorId } = req.body;

      // Regra 2: disciplina no curso da turma + professor leciona a disciplina
      await validarVinculos({ disciplinaId, turmaId, professorId });

      const avaliacao = await Avaliacao.create(req.body);
      const criado = await Avaliacao.findByPk(avaliacao.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const avaliacao = await Avaliacao.findByPk(req.params.id);
      if (!avaliacao) {
        return res.status(404).json({ errors: ['Avaliação não encontrada'] });
      }

      const disciplinaId = req.body.disciplinaId ?? avaliacao.disciplinaId;
      const turmaId = req.body.turmaId ?? avaliacao.turmaId;
      const professorId = req.body.professorId ?? avaliacao.professorId;

      // Regra 2 com os valores já existentes quando o corpo não traz todos
      await validarVinculos({ disciplinaId, turmaId, professorId });

      await avaliacao.update(req.body);
      const atualizado = await Avaliacao.findByPk(avaliacao.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const avaliacao = await Avaliacao.findByPk(req.params.id);
      if (!avaliacao) {
        return res.status(404).json({ errors: ['Avaliação não encontrada'] });
      }

      // Com notas lançadas o banco responde com FK RESTRICT -> 409
      await avaliacao.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }

  // Notas da turma inteira de uma vez (tudo ou nada)
  async notasLote(req, res) {
    try {
      const notas = await lancarNotasLote(req.params.id, req.body);
      return res.status(201).json(notas);
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new AvaliacaoController();
