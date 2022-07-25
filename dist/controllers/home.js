"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHome = void 0;
const model_1 = require("../model");
const utils_1 = require("../utils");
const getHome = async (req, res) => {
    const { id_temporada } = req.query;
    const db = req.bd_conection;
    const usuario = req.usuario;
    try {
        const quotation = new model_1.Quotation(db);
        const variedad = new model_1.Variedad(db);
        const agricultor = new model_1.Agricultor(db);
        const anexo = new model_1.Anexo(db);
        const especie = new model_1.Especie(db);
        const visita = new model_1.Visita(db);
        const quotations = await quotation.getQuotationCard(usuario, id_temporada);
        const superficies = await quotation.getSurfaceQuotation(usuario, id_temporada);
        const kgContratados = await quotation.getKgContracted(usuario, id_temporada);
        const variedades = await variedad.getVariedadesCard(usuario, id_temporada);
        const agricultores = await agricultor.getAgricultorCard(usuario, id_temporada);
        const anexos = await anexo.getAnexosCard(usuario, id_temporada);
        const especies = await especie.getEspeciesCard(usuario, id_temporada);
        const visitas = await visita.getVisitasCard(usuario, id_temporada);
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'HOME',
            data: {
                quotations,
                variedades,
                agricultores,
                anexos,
                especies,
                superficies,
                kgContratados,
                visitas
            }
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getHome : ${error}`,
            data: null
        });
    }
};
exports.getHome = getHome;
