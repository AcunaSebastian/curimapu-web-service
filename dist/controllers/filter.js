"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilters = void 0;
const utils_1 = require("../utils/");
const model_1 = require("../model/model/");
const Temporada_1 = __importDefault(require("../model/model/Temporada"));
const getFilters = async (req, res) => {
    const db = req.bd_conection;
    const usuario = req.usuario;
    try {
        const especie = new model_1.Especie(db);
        const variedad = new model_1.Variedad(db);
        const temporada = new Temporada_1.default(db);
        const especies = await especie.getEspeciesCliente(usuario);
        const variedades = await variedad.getVariedades();
        const temporadas = await temporada.getTemporadas(usuario);
        const data = {
            especies,
            variedades,
            temporadas
        };
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'Filtros',
            data
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion getFilters : ${error}`,
            data: null
        });
    }
};
exports.getFilters = getFilters;
