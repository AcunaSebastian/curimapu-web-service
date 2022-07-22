
import { Router } from "express";
import { getFilters } from '../controllers/';
import { validarCampos, JWTService } from '../middlewares/';

export const filterRouter:Router = Router();
const jwtService = new JWTService();

filterRouter.get('/get-filters', [
    jwtService.validarJWT,
    validarCampos
], getFilters);