class HomeController {
  // Só confirma que a API está no ar (não cria mais registro no banco)
  async index(req, res) {
    return res.json({ status: 'ok' });
  }
}

export default new HomeController();

