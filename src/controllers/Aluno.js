import Aluno from '../models/Aluno.js'

class AlunoController {
    async index(req, res) {
        const alunos = await Aluno.findAll()
        return res.json(alunos)
    }
}

export default new AlunoController();
