import Professor from '../models/Professor.js';
import Disciplina from '../models/Disciplina.js';
import handleError from '../helpers/handleError.js';
import semSenha from '../helpers/semSenha.js';
import AppError from '../helpers/AppError.js';
import { emailUnico, semSenhaVazia } from '../services/AcessoService.js';

const INCLUIR = [{ model: Disciplina, as: 'disciplinas' }];

class ProfessorController {
  async index(req, res) {
    try {
      const { disciplinaId } = req.query;
      // filtro: só professores que lecionam a disciplina informada
      const professores = await Professor.findAll({
        include: disciplinaId
          ? [{ model: Disciplina, as: 'disciplinas', where: { id: disciplinaId }, required: true }]
          : undefined,
        order: [['id', 'DESC']],
      });
      return res.json(professores);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const professor = await Professor.findByPk(req.params.id, { include: INCLUIR });
      if (!professor) {
        return res.status(404).json({ errors: ['Professor não encontrado'] });
      }
      return res.json(semSenha(professor));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { disciplinaIds = [] } = req.body;
      const dados = semSenhaVazia(req.body);
      delete dados.disciplinaIds;

      // Senha é obrigatória: o professor faz login com ela
      if (!req.body.password) {
        throw new AppError(400, ['Senha é obrigatória']);
      }

      await emailUnico(dados.email, { tabela: 'professores' });

      const disciplinas = await Disciplina.findAll({ where: { id: disciplinaIds } });
      if (disciplinas.length !== disciplinaIds.length) {
        throw new AppError(400, ['Disciplina não encontrada']);
      }

      const professor = await Professor.create(dados);
      await professor.setDisciplinas(disciplinaIds);

      const criado = await Professor.findByPk(professor.id, { include: INCLUIR });
      return res.status(201).json(semSenha(criado));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const professor = await Professor.findByPk(req.params.id);
      if (!professor) {
        return res.status(404).json({ errors: ['Professor não encontrado'] });
      }

      const { disciplinaIds } = req.body;
      const dados = semSenhaVazia(req.body);
      delete dados.disciplinaIds;

      await emailUnico(dados.email, { tabela: 'professores', id: professor.id });
      await professor.update(dados);

      // disciplinaIds substitui o conjunto de disciplinas do professor
      if (Array.isArray(disciplinaIds)) {
        const disciplinas = await Disciplina.findAll({ where: { id: disciplinaIds } });
        if (disciplinas.length !== disciplinaIds.length) {
          throw new AppError(400, ['Disciplina não encontrada']);
        }
        await professor.setDisciplinas(disciplinaIds);
      }

      const atualizado = await Professor.findByPk(professor.id, { include: INCLUIR });
      return res.json(semSenha(atualizado));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const professor = await Professor.findByPk(req.params.id);
      if (!professor) {
        return res.status(404).json({ errors: ['Professor não encontrado'] });
      }

      await professor.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new ProfessorController();
