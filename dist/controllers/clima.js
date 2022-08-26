"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llenarComunas = void 0;
const axios_1 = __importDefault(require("axios"));
const Region_1 = __importDefault(require("../model/model/Region"));
const xml2js_1 = __importDefault(require("xml2js"));
const llenarComunas = async (req, res) => {
    const bd = req.bd_conection;
    const region = new Region_1.default(bd);
    const regiones = await region.obtenerRegion();
    const arregloComunas = [];
    for (const region of regiones) {
        const { data } = await axios_1.default.get(`http://api.meteored.cl/index.php?api_lang=cl&division=${region.id_region_api}&affiliate_id=vb7jbic553ts`);
        // fs.writeFileSync(`uploads/xml/${region.nombre}.xml`, data);
        const json = await xml2js_1.default.parseStringPromise(data);
        const datos = json.report.location[0].data;
        const nuevosDatos = datos.map((comuna) => {
            return {
                id: comuna.name[0]['$'].id,
                name: comuna.name[0]._
            };
        });
        nuevosDatos.forEach(async (element) => {
            const sql = `SELECT * FROM comuna WHERE nombre  = "${element.name}"`;
            const dataComuna = await bd.select(sql);
            const comuna = dataComuna.flat();
            let cont = 0;
            if (comuna.length > 0) {
                await bd.update({ table: 'comuna', params: { id_api: element.id }, where: ` id_comuna='${comuna[0].id_comuna}' ` });
            }
        });
    }
    res.status(200).json({ regiones });
};
exports.llenarComunas = llenarComunas;
