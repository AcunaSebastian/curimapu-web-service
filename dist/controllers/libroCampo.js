"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLibroCampo = void 0;
const model_1 = require("../model/model/");
const utils_1 = require("../utils");
const getLibroCampo = async (req, res) => {
    const { id_especie, id_temporada, etapa } = req.query;
    const usuario = req.usuario;
    const db = req.bd_conection;
    try {
        const params = {
            usuario,
            id_especie: id_especie,
            id_temporada: id_temporada,
            etapa: (etapa) ? etapa : undefined
        };
        const libroCampo = new model_1.LibroCampo(db);
        const cabeceras = await libroCampo.getCabecera(params);
        const finalCabs = [];
        if (cabeceras.length > 0) {
            for (const cabecera of cabeceras) {
                const tmpSubProps = cabeceras.filter(cab => cab.id_prop === cabecera.id_prop);
                const existe = finalCabs.filter(p => p.id_prop === cabecera.id_prop);
                if (existe.length <= 0) {
                    finalCabs.push({ ...cabecera, subProps: tmpSubProps });
                }
            }
        }
        const data = await libroCampo.getData(params);
        res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'LIBRO CAMPO',
            data: {
                cabecera: finalCabs,
                data
            }
        });
    }
    catch (error) {
        res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
            data: null
        });
    }
};
exports.getLibroCampo = getLibroCampo;
