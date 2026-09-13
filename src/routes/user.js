import { Router } from 'express';
import userController from '../controllers/User.js';


const router = new Router();

router.post('/', userController.store); // cria usuário (POST)
router.get('/', userController.index); // lista todos usuários cadastrados (GET)
router.get('/:id', userController.show); // retorna usuário específico (GET/QUERY)
router.put('/:id', userController.update); // atualiza usuário (PUT/PATCH)
router.delete('/:id', userController.delete); // exclui usuário (DELETE)

export default router;
