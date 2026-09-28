import { Router } from 'express';
import cursoController from '../controllers/Curso.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, cursoController.index);
router.get('/:id', loginRequired, cursoController.show);

// Escrita: somente administrador
router.post('/', loginRequired, authorize('administrador'), cursoController.store);
router.put('/:id', loginRequired, authorize('administrador'), cursoController.update);
router.delete('/:id', loginRequired, authorize('administrador'), cursoController.delete);

export default router;
