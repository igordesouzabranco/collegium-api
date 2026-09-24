import { Router } from 'express';
import alunoController from '../controllers/Aluno.js';

import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

router.get('/', alunoController.index);
router.post('/', loginRequired, alunoController.store);
router.put('/:id', loginRequired, alunoController.update);
router.delete('/:id', loginRequired, alunoController.delete);
router.get('/:id', alunoController.show);

export default router;
