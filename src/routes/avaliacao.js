import { Router } from 'express';
import avaliacaoController from '../controllers/Avaliacao.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, avaliacaoController.index);
router.get('/:id', loginRequired, avaliacaoController.show);

// Escrita: administrador e professor
router.post('/', loginRequired, authorize('administrador', 'professor'), avaliacaoController.store);
router.put('/:id', loginRequired, authorize('administrador', 'professor'), avaliacaoController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'professor'), avaliacaoController.delete);

// Notas em lote: mesmo perfil que lança notas
router.post('/:id/notas/lote', loginRequired, authorize('administrador', 'professor'), avaliacaoController.notasLote);

export default router;
