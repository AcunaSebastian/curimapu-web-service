"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llenarComunas = void 0;
const Region_1 = __importDefault(require("../model/model/Region"));
const llenarComunas = async (req, res) => {
    const bd = req.bd_conection;
    const region = new Region_1.default(bd);
    const regiones = await region.obtenerRegion();
    res.status(200).json({ regiones });
};
exports.llenarComunas = llenarComunas;
