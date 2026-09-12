import Aluno from '../models/Aluno';

class HomeController {
  async index(req, res) {
    try {
      const newAluno = await Aluno.create({
        nome: 'Igor',
        sobrenome: 'Branco',
        email: 'igor@example.com',
        idade: 17,
        serie: 2,
      });
      res.json(newAluno);
    } catch (error) {
      console.log('MENSAGEM:', error.message);
      console.log('DETALHE DO BANCO:', error.parent);
      res.status(500).json({
        message: error.message,
        detail: error.parent?.sqlMessage,
      });
    }
  }
}

export default new HomeController();

