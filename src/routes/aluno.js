import { Router } from 'express';
import alunoController from '../controllers/Aluno.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, alunoController.index);
router.get('/:id/boletim', loginRequired, alunoController.boletim);
router.get('/:id', loginRequired, alunoController.show);

// Escrita: somente administrador
router.post('/', loginRequired, authorize('administrador'), alunoController.store);
router.put('/:id', loginRequired, authorize('administrador'), alunoController.update);
router.delete('/:id', loginRequired, authorize('administrador'), alunoController.delete);

export default router;
