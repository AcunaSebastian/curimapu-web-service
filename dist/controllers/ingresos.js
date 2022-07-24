"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIngresos = void 0;
const model_1 = require("../model/model/");
const utils_1 = require("../utils");
const getIngresos = async (req, res) => {
    const { id, rut, nombre, fecha, hora, } = req.query;
    const usuario = req.usuario;
    const { _id } = req.bd_params;
    const db = req.bd_conection;
    try {
        const filterParams = {
            usuario,
            id: (id) ? id : undefined,
            rut: (rut) && rut,
            nombre: (nombre) && nombre,
            fecha: (fecha) && fecha,
            hora: (hora) && hora,
            system: _id
        };
        const user = new model_1.Usuario(db);
        const ingresos = await user.getIngresos(filterParams);
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: `Ingresos`,
            data: {
                ingresos
            }
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getIngresos : ${error}`,
            data: null
        });
    }
};
exports.getIngresos = getIngresos;