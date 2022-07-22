"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controllers_1 = require("../controllers/");
const middlewares_1 = require("../middlewares/");
exports.authRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.authRouter.post('/login', [
    (0, express_validator_1.check)('username', 'Debes incluir el nombre de usuario').notEmpty(),
    (0, express_validator_1.check)('password', 'Debes incluir la contraseña').notEmpty(),
    middlewares_1.validarCampos
], controllers_1.login);
exports.authRouter.post('/set-system', [
    (0, express_validator_1.check)('id_usuario', 'Debe incluir el id de usuario').notEmpty(),
    (0, express_validator_1.check)('system', 'Debe incluir el sistema').notEmpty(),
    middlewares_1.validarCampos
], controllers_1.setSystem);
exports.authRouter.post('/renew', [
    jwtService.validarJWT,
    middlewares_1.validarCampos
], (req, res) => jwtService.revalidarJWT(req, res));
