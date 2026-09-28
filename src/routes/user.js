import { Router } from 'express';
import userController from '../controllers/User.js';

import loginRequired from '../middlewares/loginRequired.js';



const router = new Router();

router.get('/', loginRequired, userController.index);
router.get('/:id', loginRequired, userController.show);

router.post('/', loginRequired, userController.store); // cria usuário (POST)
router.put('/', loginRequired, userController.update); // atualiza usuário (PUT/PATCH)
router.delete('/', loginRequired, userController.delete); // exclui usuário (DELETE)

export default router;
