import { readFileSync } from 'node:fs';
import path from 'node:path';

const ARQUIVO = path.join(__dirname, '..', '..', 'public', 'index.html');
const PACOTE = path.join(__dirname, '..', '..', 'package.json');

// Lida uma vez, ao subir o servidor: é a versão que está de fato no ar
// (a mesma que vira tag e release no GitHub)
const VERSAO = JSON.parse(readFileSync(PACOTE, 'utf8')).version;

// Navegador pede text/html; clientes de API e scripts enviam */* ou application/json
function querHtml(req) {
  return req.accepts(['json', 'html']) === 'html';
}

class HomeController {
  // Health check em JSON e página de boas-vindas em HTML, na mesma rota GET /
  async index(req, res) {
    if (querHtml(req)) {
      return res.type('html').send(readFileSync(ARQUIVO, 'utf8'));
    }

    return res.json({ status: 'ok', version: VERSAO });
  }
}

export default new HomeController();
