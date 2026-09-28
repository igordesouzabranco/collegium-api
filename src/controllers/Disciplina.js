import Disciplina from '../models/Disciplina.js';
import Curso from '../models/Curso.js';
import Professor from '../models/Professor.js';
import handleError from '../helpers/handleError.js';
import AppError from '../helpers/AppError.js';

const INCLUIR = [
  { model: Curso, as: 'cursos' },
  { model: Professor, as: 'professores' },
];

class DisciplinaController {
  async index(req, res) {
    try {
      const { cursoId } = req.query;
      const disciplinas = await Disciplina.findAll({
        include: cursoId
          ? [{ model: Curso, as: 'cursos', where: { id: cursoId }, required: true }]
          : undefined,
        order: [['id', 'DESC']],
      });
      return res.json(disciplinas);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const disciplina = await Disciplina.findByPk(req.params.id, { include: INCLUIR });
      if (!disciplina) {
        return res.status(404).json({ errors: ['Disciplina não encontrada'] });
      }
      return res.json(disciplina);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { cursoIds = [] } = req.body;
      const dados = { ...req.body };
      delete dados.cursoIds;

      const cursos = await Curso.findAll({ where: { id: cursoIds } });
      if (cursos.length !== cursoIds.length) {
        throw new AppError(400, ['Curso não encontrado']);
      }

      const disciplina = await Disciplina.create(dados);
      await disciplina.setCursos(cursoIds);

      const criado = await Disciplina.findByPk(disciplina.id, { include: INCLUIR });
      return res.status(201).json(criado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const disciplina = await Disciplina.findByPk(req.params.id);
      if (!disciplina) {
        return res.status(404).json({ errors: ['Disciplina não encontrada'] });
      }

      const { cursoIds } = req.body;
      const dados = { ...req.body };
      delete dados.cursoIds;

      await disciplina.update(dados);

      // cursoIds substitui o conjunto de cursos da disciplina
      if (Array.isArray(cursoIds)) {
        const cursos = await Curso.findAll({ where: { id: cursoIds } });
        if (cursos.length !== cursoIds.length) {
          throw new AppError(400, ['Curso não encontrado']);
        }
        await disciplina.setCursos(cursoIds);
      }

      const atualizado = await Disciplina.findByPk(disciplina.id, { include: INCLUIR });
      return res.json(atualizado);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const disciplina = await Disciplina.findByPk(req.params.id);
      if (!disciplina) {
        return res.status(404).json({ errors: ['Disciplina não encontrada'] });
      }

      await disciplina.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new DisciplinaController();
