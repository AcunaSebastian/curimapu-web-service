"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPDFVisita = exports.getVisitas = void 0;
const fs_1 = __importDefault(require("fs"));
const model_1 = require("../model/");
const httpResponses_1 = require("../utils/httpResponses");
const getVisitas = async (req, res) => {
    const { num_anexo, lote, agricultor, ready_batch, id_variedad, id_temporada, id_especie, fecha_visita, limit, page = 0 } = req.query;
    const usuario = req.usuario;
    const db = req.bd_conection;
    try {
        const filter = {
            usuario,
            num_anexo: num_anexo,
            lote: lote,
            agricultor: agricultor,
            ready_batch: ready_batch,
            id_variedad: id_variedad,
            id_temporada: id_temporada,
            id_especie: id_especie,
            fecha_visita: fecha_visita,
            limit: limit,
            page
        };
        const visita = new model_1.Visita(db);
        const visitas = await visita.getVisitas(filter);
        return res.status(httpResponses_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'Visitas',
            data: {
                visitas
            }
        });
    }
    catch (error) {
        return res.status(httpResponses_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getVisitas : ${error}`,
            data: null
        });
    }
};
exports.getVisitas = getVisitas;
const getPDFVisita = async (req, res) => {
    const { id_visita } = req.query;
    const db = req.bd_conection;
    const bd_params = req.bd_params;
    try {
        const visita = new model_1.Visita(db);
        const pdf = await visita.getPDF(Number(id_visita), bd_params);
        const pdfFile = fs_1.default.readFileSync(`./` + pdf);
        fs_1.default.unlinkSync(`./` + pdf);
        return res.status(httpResponses_1.httpResponses.HTTP_OK).contentType(`application/pdf`).send(pdfFile);
    }
    catch (error) {
        return res.status(httpResponses_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getPDFVisita : ${error}`,
            data: null
        });
    }
};
exports.getPDFVisita = getPDFVisita;
