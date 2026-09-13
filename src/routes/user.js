import { Router } from 'express';
import userController from '../controllers/User.js';


const router = new Router();

router.post('/', userController.store);

export default router;

/*
index - lista todos usuários cadastrados (GET)
store/create - cria usuário (POST)
delete - exclui usuário (DELETE)
show - retorna usuário específico (GET/QUERY)
update - atualiza usuário (PUT/PATCH)
*/
