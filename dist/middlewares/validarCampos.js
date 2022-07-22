"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCampos = void 0;
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const validarCampos = (req, res, next) => {
    const errorsResponse = (0, express_validator_1.validationResult)(req);
    if (!errorsResponse.isEmpty()) {
        const errors = errorsResponse.array();
        return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
            ok: false,
            message: `Se han encontrado los siguientes errores:\n ${errors.map((el, index) => `${index + 1}.- msg:${el.msg}, param:${el.param}`).join(`\n`)}`,
            data: null
        });
    }
    next();
};
exports.validarCampos = validarCampos;
