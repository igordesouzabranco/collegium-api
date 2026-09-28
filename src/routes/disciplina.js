import { Router } from 'express';
import disciplinaController from '../controllers/Disciplina.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, disciplinaController.index);
router.get('/:id', loginRequired, disciplinaController.show);

// Escrita: administrador e coordenador
router.post('/', loginRequired, authorize('administrador', 'coordenador'), disciplinaController.store);
router.put('/:id', loginRequired, authorize('administrador', 'coordenador'), disciplinaController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'coordenador'), disciplinaController.delete);

export default router;
