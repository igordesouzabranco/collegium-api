import { Router } from 'express';
import turmaController from '../controllers/Turma.js';
import loginRequired from '../middlewares/loginRequired.js';
import authorize from '../middlewares/authorize.js';

const router = new Router();

// Leitura: qualquer perfil autenticado
router.get('/', loginRequired, turmaController.index);
router.get('/:id/alunos', loginRequired, turmaController.alunos);
router.get('/:id', loginRequired, turmaController.show);

// Escrita: administrador e coordenador
router.post('/', loginRequired, authorize('administrador', 'coordenador'), turmaController.store);
router.put('/:id', loginRequired, authorize('administrador', 'coordenador'), turmaController.update);
router.delete('/:id', loginRequired, authorize('administrador', 'coordenador'), turmaController.delete);

// Chamada em lote: mesmo perfil que registra presenças
router.post('/:id/chamada', loginRequired, authorize('administrador', 'professor'), turmaController.chamada);

export default router;
