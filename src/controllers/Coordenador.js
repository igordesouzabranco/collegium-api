import { Op } from 'sequelize';
import Coordenador from '../models/Coordenador.js';
import Curso from '../models/Curso.js';
import handleError from '../helpers/handleError.js';
import semSenha from '../helpers/semSenha.js';
import AppError from '../helpers/AppError.js';
import { emailUnico, semSenhaVazia } from '../services/AcessoService.js';

class CoordenadorController {
  async index(req, res) {
    try {
      const coordenadores = await Coordenador.findAll({ order: [['id', 'DESC']] });
      return res.json(coordenadores);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const coordenador = await Coordenador.findByPk(req.params.id, {
        include: { model: Curso, as: 'cursos' },
      });
      if (!coordenador) {
        return res.status(404).json({ errors: ['Coordenador não encontrado'] });
      }
      return res.json(coordenador);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const { cursoIds = [] } = req.body;
      const dados = semSenhaVazia(req.body);
      delete dados.cursoIds;

      if (!Array.isArray(cursoIds) || cursoIds.length === 0) {
        throw new AppError(400, ['Informe pelo menos 1 curso em "cursoIds"']);
      }

      await emailUnico(dados.email, { tabela: 'coordenadores' });

      const cursos = await Curso.findAll({ where: { id: cursoIds } });
      if (cursos.length !== cursoIds.length) {
        throw new AppError(400, ['Curso não encontrado']);
      }

      const coordenador = await Coordenador.create(dados);

      // Os cursos passam a apontar para este coordenador (reatribuição)
      await Curso.update({ coordenadorId: coordenador.id }, { where: { id: cursoIds } });

      const criado = await Coordenador.findByPk(coordenador.id, {
        include: { model: Curso, as: 'cursos' },
      });
      return res.status(201).json(semSenha(criado));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const coordenador = await Coordenador.findByPk(req.params.id);
      if (!coordenador) {
        return res.status(404).json({ errors: ['Coordenador não encontrado'] });
      }

      const { cursoIds } = req.body;
      const dados = semSenhaVazia(req.body);
      delete dados.cursoIds;

      await emailUnico(dados.email, { tabela: 'coordenadores', id: coordenador.id });
      await coordenador.update(dados);

      // cursoIds substitui o conjunto: os removidos ficam sem coordenador
      if (Array.isArray(cursoIds)) {
        const cursos = await Curso.findAll({ where: { id: cursoIds } });
        if (cursos.length !== cursoIds.length) {
          throw new AppError(400, ['Curso não encontrado']);
        }

        await Curso.update(
          { coordenadorId: null },
          { where: { coordenadorId: coordenador.id, id: { [Op.notIn]: cursoIds } } },
        );
        await Curso.update({ coordenadorId: coordenador.id }, { where: { id: cursoIds } });
      }

      const atualizado = await Coordenador.findByPk(coordenador.id, {
        include: { model: Curso, as: 'cursos' },
      });
      return res.json(semSenha(atualizado));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const coordenador = await Coordenador.findByPk(req.params.id);
      if (!coordenador) {
        return res.status(404).json({ errors: ['Coordenador não encontrado'] });
      }

      await coordenador.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new CoordenadorController();
