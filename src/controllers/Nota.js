import Nota from '../models/Nota.js';
import Aluno from '../models/Aluno.js';
import Avaliacao from '../models/Avaliacao.js';
import handleError from '../helpers/handleError.js';
import { validarAlunoNaAvaliacao } from '../services/NotaService.js';

const INCLUIR = [
  { model: Aluno, as: 'aluno' },
  { model: Avaliacao, as: 'avaliacao' },
];

class NotaController {
  async index(req, res) {
    try {
      const { alunoId, avaliacaoId, turmaId, disciplinaId } = req.query;
      const where = {};
      if (alunoId) where.alunoId = alunoId;
      if (avaliacaoId) where.avaliacaoId = avaliacaoId;

      const include = [...INCLUIR];

      // filtros da avaliação (turma/disciplina) entram pelo include
      const filtroAvaliacao = {};
      if (turmaId) filtroAvaliacao.turmaId = turmaId;
      if (disciplinaId) filtroAvaliacao.disciplinaId = disciplinaId;
      if (Object.keys(filtroAvaliacao).length) {
        include[1] = { ...include[1], where: filtroAvaliacao, required: true };
      }

      const notas = await Nota.findAll({
        where,
        include,
        order: [['id', 'DESC']],
      });
      return res.json(notas);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const nota = await Nota.findByPk(req.params.id, { include: INCLUIR });
      if (!nota) {
        return res.status(404).json({ errors: ['Nota não encontrada'] });
      }
      return res.json(nota);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { alunoId, avaliacaoId } = req.body;

      // Regra 3: aluno precisa estar na turma da avaliação
      await validarAlunoNaAvaliacao({ alunoId, avaliacaoId });

      const nota = await Nota.create(req.body);
      const criado = await Nota.findByPk(nota.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const nota = await Nota.findByPk(req.params.id);
      if (!nota) {
        return res.status(404).json({ errors: ['Nota não encontrada'] });
      }

      const alunoId = req.body.alunoId ?? nota.alunoId;
      const avaliacaoId = req.body.avaliacaoId ?? nota.avaliacaoId;

      // Regra 3 com os valores já existentes quando o corpo não traz todos
      await validarAlunoNaAvaliacao({ alunoId, avaliacaoId });

      await nota.update(req.body);
      const atualizado = await Nota.findByPk(nota.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const nota = await Nota.findByPk(req.params.id);
      if (!nota) {
        return res.status(404).json({ errors: ['Nota não encontrada'] });
      }

      await nota.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new NotaController();
