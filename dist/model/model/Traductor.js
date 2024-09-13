"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traductor = void 0;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
class Traductor {
    async traducir({ texto, rut, sistema, id_registro, }) {
        const body = {
            texto,
            rut,
            sistema,
            language: ["spanish", "english"],
            ambiente: process.env.AMBIENTE,
            id_registro,
        };
        try {
            const { data } = await axios_1.default.post("https://traductor.zproduccion.cl/traductor-api/api/v1/openai/translate", body);
            if (!data.ok) {
                return "";
            }
            console.log({ trasn: data.data.translations[0] });
            return data.data.translations[0].translation;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.Traductor = Traductor;
