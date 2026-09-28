import Presenca from '../models/Presenca.js';
import Aluno from '../models/Aluno.js';
import Turma from '../models/Turma.js';
import handleError from '../helpers/handleError.js';
import { validarAlunoNaTurma } from '../services/PresencaService.js';

const INCLUIR = [
  { model: Aluno, as: 'aluno' },
  { model: Turma, as: 'turma' },
];

class PresencaController {
  async index(req, res) {
    try {
      const { alunoId, turmaId, data } = req.query;
      const where = {};
      if (alunoId) where.alunoId = alunoId;
      if (turmaId) where.turmaId = turmaId;
      if (data) where.data = data;

      const presencas = await Presenca.findAll({
        where,
        include: INCLUIR,
        order: [['id', 'DESC']],
      });
      return res.json(presencas);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const presenca = await Presenca.findByPk(req.params.id, { include: INCLUIR });
      if (!presenca) {
        return res.status(404).json({ errors: ['Presença não encontrada'] });
      }
      return res.json(presenca);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { alunoId, turmaId } = req.body;

      // Regra 4: aluno precisa estar na turma da chamada
      await validarAlunoNaTurma({ alunoId, turmaId });

      const presenca = await Presenca.create(req.body);
      const criado = await Presenca.findByPk(presenca.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const presenca = await Presenca.findByPk(req.params.id);
      if (!presenca) {
        return res.status(404).json({ errors: ['Presença não encontrada'] });
      }

      const alunoId = req.body.alunoId ?? presenca.alunoId;
      const turmaId = req.body.turmaId ?? presenca.turmaId;

      // Regra 4 com os valores já existentes quando o corpo não traz todos
      await validarAlunoNaTurma({ alunoId, turmaId });

      await presenca.update(req.body);
      const atualizado = await Presenca.findByPk(presenca.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const presenca = await Presenca.findByPk(req.params.id);
      if (!presenca) {
        return res.status(404).json({ errors: ['Presença não encontrada'] });
      }

      await presenca.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new PresencaController();
