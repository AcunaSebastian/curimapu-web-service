"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
exports.filterRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.filterRouter.get('/get-filters', [
    jwtService.validarJWT,
    middlewares_1.validarCampos
], controllers_1.getFilters);
