import { Router } from 'express';
import * as clientsController from '../controllers/clients.controller';

const router = Router();

router.get('/', clientsController.listClients);

export default router;
