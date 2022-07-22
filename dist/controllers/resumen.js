"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumen = void 0;
const model_1 = require("../model");
const utils_1 = require("../utils");
const getResumen = async (req, res) => {
    const usuario = req.usuario;
    const db = req.bd_conection;
    const { id_especie, id_temporada } = req.query;
    try {
        const resumen = new model_1.Resumen(db);
        const cabeceras = await resumen.getCabecera(id_temporada, id_especie);
        const preData = await resumen.getData(id_temporada, id_especie, usuario);
        console.log(preData);
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            response: `resumen`,
            data: {
                cabeceras,
                preData
            }
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getResumen : ${error}`,
            data: null
        });
    }
};
exports.getResumen = getResumen;
