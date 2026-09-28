import { Router } from 'express';
import notaController from '../controllers/Nota.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, notaController.index);
router.get('/:id', loginRequired, notaController.show);

// Escrita: administrador e professor
router.post('/', loginRequired, authorize('administrador', 'professor'), notaController.store);
router.put('/:id', loginRequired, authorize('administrador', 'professor'), notaController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'professor'), notaController.delete);

export default router;
