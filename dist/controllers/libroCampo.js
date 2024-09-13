"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCabeceraReporteQuot = exports.getReporteQuotation = exports.getImagenesAnexo = exports.getExcelLC = exports.getLibroCampo = void 0;
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const model_1 = require("../model");
const utils_1 = require("../utils");
const getLibroCampo = async (req, res) => {
    const { id_especie, id_temporada, etapa, limit = 100, page = 0, num_anexo, ready_batch, recomendaciones, agricultor, variedad, predio, lote, } = req.query;
    const usuario = req.usuario;
    const db = req.bd_conection;
    try {
        const params = {
            usuario,
            id_especie: id_especie,
            id_temporada: id_temporada,
            etapa: etapa ? etapa : undefined,
            lote: lote,
            predio: predio,
            limit: limit ? Number(limit) : undefined,
            page: page ? Number(page) : 0,
            num_anexo: num_anexo,
            ready_batch: ready_batch,
            recomendaciones: recomendaciones,
            agricultor: agricultor,
            variedad: variedad,
        };
        const libroCampo = new model_1.LibroCampo(db);
        const cabeceras = await libroCampo.getCabecera(params);
        const finalCabs = [];
        if (cabeceras.length > 0) {
            for (const cabecera of cabeceras) {
                const tmpSubProps = cabeceras.filter((cab) => cab.id_prop === cabecera.id_prop && cab.id_etapa === cabecera.id_etapa);
                const existe = finalCabs.filter((p) => p.id_prop === cabecera.id_prop && p.id_etapa === cabecera.id_etapa);
                if (existe.length <= 0) {
                    finalCabs.push({ ...cabecera, subProps: tmpSubProps });
                }
            }
        }
        const data = await libroCampo.getData(params);
        const dataTotal = await libroCampo.getData({ ...params, limit: undefined });
        res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: "LIBRO CAMPO",
            data: {
                cabecera: finalCabs,
                data,
                total: dataTotal.length,
            },
        });
    }
    catch (error) {
        res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
            data: null,
        });
    }
};
exports.getLibroCampo = getLibroCampo;
const getExcelLC = async (req, res) => {
    const { id_especie, id_temporada, etapa, limit, page = 0, num_anexo, ready_batch, recomendaciones, agricultor, predio, lote, } = req.query;
    const usuario = req.usuario;
    const db = req.bd_conection;
    try {
        const params = {
            usuario,
            id_especie: id_especie,
            id_temporada: id_temporada,
            etapa: etapa ? etapa : undefined,
            lote: lote,
            predio: predio,
            limit: limit ? Number(limit) : undefined,
            page: page ? Number(page) : 0,
            num_anexo: num_anexo,
            ready_batch: ready_batch,
            recomendaciones: recomendaciones,
            agricultor: agricultor,
            type: "ALL",
        };
        const excel = new model_1.ExcelClass(db);
        const downloadExcel = await excel.generarExcel(params);
        const excelFile = fs_1.default.readFileSync(`./` + downloadExcel);
        fs_1.default.unlinkSync(`./` + downloadExcel);
        return res
            .status(utils_1.httpResponses.HTTP_OK)
            .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .send(excelFile);
    }
    catch (error) {
        res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
            data: null,
        });
    }
};
exports.getExcelLC = getExcelLC;
const getImagenesAnexo = async (req, res) => {
    const usuario = req.usuario;
    const db = req.bd_conection;
    const params = req.bd_params;
    const { id_anexo } = req.query;
    try {
        const libroCampo = new model_1.LibroCampo(db);
        const listaImagenes = await libroCampo.getImagenes(id_anexo, params);
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: `IMAGENES`,
            data: listaImagenes,
        });
    }
    catch (error) {
        res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `PROBLEMAS EN FUNCION getImagenesAnexo ERROR : ${error}`,
            data: null,
        });
    }
};
exports.getImagenesAnexo = getImagenesAnexo;
const getReporteQuotation = async (req, res) => {
    const db = req.bd_conection;
    const usuario = req.usuario;
    const bdParams = req.bd_params;
    const { id_cliente, id_temporada, id_especie } = req.query;
    console.log(bdParams);
    const { checks } = req.body;
    const quotationClass = new model_1.Quotation(db);
    console.log("inicio peticion", (0, moment_1.default)().format("YYYY-MM-DD H:m:s"));
    const informe = await quotationClass.getReporteQuotation(usuario, id_cliente, id_temporada, bdParams, checks, id_especie);
    if (!fs_1.default.existsSync(`./` + informe)) {
        return res
            .status(utils_1.httpResponses.HTTP_OK)
            .contentType("html")
            .send(`<h1>No se pudo obtener el documento</h1>`);
    }
    const pdfFile = fs_1.default.readFileSync(`./` + informe);
    fs_1.default.unlinkSync(`./` + informe);
    return res.status(utils_1.httpResponses.HTTP_OK).contentType("application/pdf").send(pdfFile);
    // return res.json({
    //     informe
    // })
};
exports.getReporteQuotation = getReporteQuotation;
const getCabeceraReporteQuot = async (req, res) => {
    const db = req.bd_conection;
    const usuario = req.usuario;
    const bdParams = req.bd_params;
    const { id_cliente, id_temporada, id_especie } = req.query;
    try {
        const quotationClass = new model_1.Quotation(db);
        const cabeceras = await quotationClass.getCabeceraReporte(usuario, id_cliente, id_temporada, bdParams, id_especie);
        res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: "LIBRO CAMPO",
            data: {
                cabeceras,
            },
        });
    }
    catch (error) {
        res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `PROBLEMAS EN FUNCION getCabeceraReporteQuot ERROR : ${error}`,
            data: null,
        });
    }
};
exports.getCabeceraReporteQuot = getCabeceraReporteQuot;
