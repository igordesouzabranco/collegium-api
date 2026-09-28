import { Router } from 'express';
import coordenadorController from '../controllers/Coordenador.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, coordenadorController.index);
router.get('/:id', loginRequired, coordenadorController.show);

// Escrita: somente administrador
router.post('/', loginRequired, authorize('administrador'), coordenadorController.store);
router.put('/:id', loginRequired, authorize('administrador'), coordenadorController.update);
router.delete('/:id', loginRequired, authorize('administrador'), coordenadorController.delete);

export default router;
