import { Router } from 'express';
import professorController from '../controllers/Professor.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, professorController.index);
router.get('/:id', loginRequired, professorController.show);

// Escrita: administrador e coordenador
router.post('/', loginRequired, authorize('administrador', 'coordenador'), professorController.store);
router.put('/:id', loginRequired, authorize('administrador', 'coordenador'), professorController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'coordenador'), professorController.delete);

export default router;
