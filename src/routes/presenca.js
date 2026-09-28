import { Router } from 'express';
import presencaController from '../controllers/Presenca.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, presencaController.index);
router.get('/:id', loginRequired, presencaController.show);

// Escrita: administrador e professor
router.post('/', loginRequired, authorize('administrador', 'professor'), presencaController.store);
router.put('/:id', loginRequired, authorize('administrador', 'professor'), presencaController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'professor'), presencaController.delete);

export default router;
