"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPDFVisita = exports.getVisitas = void 0;
const model_1 = require("../model/model/");
const httpResponses_1 = require("../utils/httpResponses");
const getVisitas = async (req, res) => {
    const { num_anexo, lote, agricultor, ready_batch, id_variedad, id_temporada, id_especie, fecha_visita, } = req.query;
    const usuario = req.usuario;
    const db = req.bd_conection;
    const filter = {
        usuario
    };
    if (num_anexo) {
        Object.assign(filter, { num_anexo });
    }
    if (lote) {
        Object.assign(filter, { lote });
    }
    if (agricultor) {
        Object.assign(filter, { agricultor });
    }
    if (ready_batch) {
        Object.assign(filter, { ready_batch });
    }
    if (id_variedad) {
        Object.assign(filter, { id_variedad });
    }
    if (id_temporada) {
        Object.assign(filter, { id_temporada });
    }
    if (id_especie) {
        Object.assign(filter, { id_especie });
    }
    if (fecha_visita) {
        Object.assign(filter, { fecha_visita });
    }
    const visita = new model_1.Visita(db);
    const visitas = await visita.getVisitas(filter);
    return res.status(httpResponses_1.httpResponses.HTTP_OK).json({
        ok: true,
        message: 'Visitas',
        data: {
            visitas
        }
    });
};
exports.getVisitas = getVisitas;
const getPDFVisita = async (req, res) => {
    const { id_visita } = req.query;
    const db = req.bd_conection;
    const visita = new model_1.Visita(db);
    const pdf = await visita.getPDF(Number(id_visita));
    return res.status(200).json({
        ok: true,
        message: `PDF`,
        data: {
            pdf
        }
    });
};
exports.getPDFVisita = getPDFVisita;
