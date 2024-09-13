"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_data_1 = __importDefault(require("form-data"));
const _1 = require("./");
const utils_1 = require("../../utils");
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
class Quotation {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getQuotationCard(usuario, id_temporada) {
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = ` SELECT COUNT(DISTINCT(Q.id_quotation)) AS total
        FROM quotation Q
        INNER JOIN detalle_quotation DQ ON (DQ.id_quotation = Q.id_quotation)
        ${inner} 
        WHERE 1 ${filtro}`;
        const quotations = await this.dbConnection.select(sql);
        return {
            titulo: `Quotations`,
            total: quotations[0].total,
        };
    }
    async getSurfaceQuotation(usuario, id_temporada) {
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = ` SELECT DISTINCT ( DQ.id_de_quo  ) AS id, SUM( DQ.superficie_contr ) AS total, DQ.id_um
        FROM detalle_quotation DQ
        INNER JOIN quotation Q ON Q.id_quotation = DQ.id_quotation
        ${inner} 
        WHERE (DQ.id_um = 2 OR DQ.id_um = 3) ${filtro}
        GROUP BY DQ.id_um`;
        const surfaces = await this.dbConnection.select(sql);
        const sql2 = `SELECT DISTINCT ( AC.id_ac  )  AS id, SUM( AC.has_gps ) AS total
        FROM anexo_contrato AC
        INNER JOIN detalle_quotation DQ ON DQ.id_de_quo = AC.id_de_quo
        INNER JOIN quotation Q ON Q.id_quotation = DQ.id_quotation
        ${inner} 
        WHERE 1 ${filtro} `;
        const surfaceGPSs = await this.dbConnection.select(sql2);
        const surface = surfaces[0];
        const surfaceGPS = surfaceGPSs[0];
        let superficieContratada = surface?.id_um === 2 ? surface?.total / 10000 : surface?.total;
        let superficieGPS = surfaceGPS?.total;
        let porcentajeAsignado = superficieGPS / 100 / superficieContratada;
        return {
            titulo: `Surface, Data:`,
            superficieContratada: { titulo: `Ha Contracted`, total: superficieContratada },
            superficieGPS: { titulo: `Ha Asigned`, total: superficieGPS },
            porcentajeAsignado: { titulo: ` % Asigned `, total: porcentajeAsignado },
        };
    }
    async getKgContracted(usuario, id_temporada) {
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = ` SELECT DISTINCT ( DQ.id_de_quo  ) AS ides, SUM( DQ.kg_contratados ) AS total
        FROM detalle_quotation DQ
        INNER JOIN quotation Q ON Q.id_quotation = DQ.id_quotation
        ${inner} 
        WHERE 1 ${filtro}`;
        const kgContracted = await this.dbConnection.select(sql);
        return {
            titulo: `Kg Contracted`,
            total: kgContracted[0].total,
        };
    }
    async getCabeceraReporte(usuario, id_cliente, id_temporada, bd_params, id_especie) {
        let filtro = ``;
        if (id_especie) {
            filtro = ` AND Q.id_esp = '${id_especie}' `;
        }
        const sql = `SELECT Q.*, especie.nombre  FROM quotation  Q
        INNER JOIN especie  USING (id_esp)
        WHERE Q.id_cli = '${id_cliente}' AND Q.id_tempo = '${id_temporada}' ${filtro} 
        GROUP BY Q.id_esp 
        ORDER BY Q.id_esp `;
        const quotations = await this.dbConnection.select(sql);
        const checks = [];
        const lc = new _1.LibroCampo(this.dbConnection);
        if (quotations.length > 0) {
            for (const quotation of quotations) {
                const cabecera = await lc.getCabeceraCustom({
                    id_temporada: quotation.id_tempo,
                    id_especie: quotation.id_esp,
                    id_cliente: id_cliente,
                });
                const especies = [2, 3, 4].map((etapa) => {
                    const etapas = cabecera.filter((cab) => cab.id_etapa === etapa);
                    return {
                        etapa: etapas[0]?.etapa || "",
                        propiedades: etapas,
                    };
                });
                checks.push({ especie: quotation.nombre, etapas: especies });
            }
        }
        return checks;
    }
    async getReporteQuotation(usuario, id_cliente, id_temporada, bd_params, checks, id_especie) {
        let nombreEspecie = ``;
        if (id_especie) {
            const especieClass = new _1.Especie(this.dbConnection);
            const especie = await especieClass.getEspecieById(id_especie);
            nombreEspecie = especie.nombre;
        }
        const sistema = bd_params._id === "EXPORT" ? "CURIMAPU_EXPORT" : "CURIMAPU_VEGETALES";
        const anexosClass = new _1.Anexo(this.dbConnection);
        console.log("obtiene anexos ", (0, moment_1.default)().format("YYYY-MM-DD H:m:s"));
        const anexos = await anexosClass.getAnexosByIdCli(id_cliente, id_temporada, id_especie);
        console.log("obtiene observaciones ", (0, moment_1.default)().format("YYYY-MM-DD H:m:s"));
        const observaciones = await anexosClass.getObservacionesByAnexo(anexos, usuario, sistema);
        const formData = new form_data_1.default();
        // ✅ id_cliente;
        // ✅ id_quotation;
        // ✅ id_esp
        // ✅ agrega_drive;
        // ✅ envia_correo;
        // ✅ nombre_correo;
        // ✅ mail_correo;
        // ✅ id_tempo
        // ✅ tipo_informe;
        // ✅ checks;
        // ✅ plantillas;
        // ✅ anexos;
        // 🚩 observaciones;
        formData.append("id_tempo", Number(id_temporada));
        if (id_especie) {
            formData.append("id_esp", Number(id_especie));
        }
        formData.append("id_cliente", Number(id_cliente));
        formData.append("observaciones", JSON.stringify(observaciones));
        formData.append("id_usuario", usuario.id_usuario);
        formData.append("checks", JSON.stringify(checks));
        formData.append("anexos", JSON.stringify(anexos?.map((el) => el.id_ac) ?? []));
        formData.append("tipo_informe", 1);
        formData.append("mail_correo", "");
        formData.append("nombre_correo", "");
        formData.append("envia_correo", "NO");
        formData.append("agrega_drive", "NO");
        formData.append("id_quotation", "");
        formData.append("plantillas", JSON.stringify([]));
        console.log("escribe pdf vacio ", (0, moment_1.default)().format("YYYY-MM-DD H:m:s"));
        const namePDf = `uploads/pdf/pdf_${id_cliente}_${(0, moment_1.default)().format("YYYYMMSSHHmmss")}.pdf`;
        const writer = fs_1.default.createWriteStream(namePDf);
        try {
            console.log("hace peticion a servidor ", (0, moment_1.default)().format("YYYY-MM-DD H:m:s"));
            const { config, data } = await axios_1.default.post(`http://${bd_params.ip_host}/${bd_params.proyect_main_folder}/docs/pdf/ep_quotation_detalle.php`, formData, {
                headers: formData.getHeaders(),
                responseType: "stream",
            });
            data.pipe(writer);
            return new Promise((resolve) => {
                writer.on("finish", () => {
                    console.log("escribiendo...");
                    resolve(namePDf);
                });
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.log(error.message);
            }
        }
    }
}
exports.default = Quotation;
