import Curso from '../models/Curso.js';
import Disciplina from '../models/Disciplina.js';
import Coordenador from '../models/Coordenador.js';
import Turma from '../models/Turma.js';
import handleError from '../helpers/handleError.js';
import AppError from '../helpers/AppError.js';

const INCLUIR = [
  { model: Coordenador, as: 'coordenador' },
  { model: Disciplina, as: 'disciplinas' },
  { model: Turma, as: 'turmas' },
];

class CursoController {
  async index(req, res) {
    try {
      const cursos = await Curso.findAll({ order: [['id', 'DESC']] });
      return res.json(cursos);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const curso = await Curso.findByPk(req.params.id, { include: INCLUIR });
      if (!curso) {
        return res.status(404).json({ errors: ['Curso não encontrado'] });
      }
      return res.json(curso);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { coordenadorId } = req.body;
      if (coordenadorId) {
        const coordenador = await Coordenador.findByPk(coordenadorId);
        if (!coordenador) {
          throw new AppError(400, ['Coordenador não encontrado']);
        }
      }

      const curso = await Curso.create(req.body);
      const criado = await Curso.findByPk(curso.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const curso = await Curso.findByPk(req.params.id);
      if (!curso) {
        return res.status(404).json({ errors: ['Curso não encontrado'] });
      }

      const { coordenadorId } = req.body;
      if (coordenadorId) {
        const coordenador = await Coordenador.findByPk(coordenadorId);
        if (!coordenador) {
          throw new AppError(400, ['Coordenador não encontrado']);
        }
      }

      await curso.update(req.body);
      const atualizado = await Curso.findByPk(curso.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const curso = await Curso.findByPk(req.params.id);
      if (!curso) {
        return res.status(404).json({ errors: ['Curso não encontrado'] });
      }

      await curso.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new CursoController();
