import Aluno from '../models/Aluno.js'

class AlunoController {
    async index(req, res) {
        const alunos = await Aluno.findAll()
        return res.json(alunos)
    }

    async store(req, res) {
      try {
        const aluno = await Aluno.create(req.body)
        return res.json(aluno)
      } catch (error) {
        return res.status(400).json({ error: error.message })
      }
    }

    async show(req, res) {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ error: 'ID não informado' })
        }
        const aluno = await Aluno.findByPk(id)
        if (!aluno) {
          return res.status(404).json({ error: 'Aluno não encontrado' })
        }
        return res.json(aluno)
      } catch (error) {
        return res.status(400).json({ error: error.message })
      }
    }

    async update(req, res) {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ error: 'ID não informado' })
        }
        const aluno = await Aluno.findByPk(id)
        if (!aluno) {
          return res.status(404).json({ error: 'Aluno não encontrado' })
        }
        const newAluno = await aluno.update(req.body)
        return res.json(newAluno)
      } catch (error) {
        return res.status(400).json({ error: error.message })
      }
    }

    async delete(req, res) {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ error: 'ID não informado' })
        }
        const aluno = await Aluno.findByPk(id)
        if (!aluno) {
          return res.status(404).json({ error: 'Aluno não encontrado' })
        }
        await aluno.destroy()
        return res.json({ message: 'Aluno excluído com sucesso' })
      } catch (error) {
        return res.status(400).json({ error: error.message })
      }
    }
}

export default new AlunoController();
