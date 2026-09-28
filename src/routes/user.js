import { Router } from 'express';
import userController from '../controllers/User.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, userController.index);
router.get('/:id', loginRequired, userController.show);

// Escrita: somente administrador
router.post('/', loginRequired, authorize('administrador'), userController.store);
router.put('/:id', loginRequired, authorize('administrador'), userController.update);
router.delete('/:id', loginRequired, authorize('administrador'), userController.delete);

export default router;
