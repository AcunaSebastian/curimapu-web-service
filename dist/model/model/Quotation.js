"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const utils_1 = require("../../utils");
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
            total: quotations[0].total
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
        let superficieContratada = (surface?.id_um === 2) ? surface?.total / 10000 : surface?.total;
        let superficieGPS = surfaceGPS?.total;
        let porcentajeAsignado = ((superficieGPS / 100) / superficieContratada);
        return {
            titulo: `Surface, Data:`,
            superficieContratada: { titulo: `Ha Contracted`, total: superficieContratada },
            superficieGPS: { titulo: `Ha Asigned`, total: superficieGPS },
            porcentajeAsignado: { titulo: ` % Asigned `, total: porcentajeAsignado }
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
            total: kgContracted[0].total
        };
    }
    async getReporteQuotation(id_cliente, id_temporada, id_especie) {
        const formato = 2;
        let nombreEspecie = ``;
        if (id_especie) {
            const especieClass = new _1.Especie(this.dbConnection);
            const especie = await especieClass.getEspecieById(id_especie);
            nombreEspecie = especie.nombre;
        }
        const clienteClass = new _1.Cliente(this.dbConnection);
        const cliente = await clienteClass.getClienteById(id_cliente);
        const nombreCliente = cliente.razon_social;
        const anexosClass = new _1.Anexo(this.dbConnection);
        const anexos = await anexosClass.getAnexosByIdCli(id_cliente, id_temporada, id_especie);
        const observaciones = await anexosClass.getObservacionesByAnexo(anexos);
        // console.log("obs",observaciones);
        // const fmd = new FormData();
        // fmd.append('Temporada', id_temporada);
        // fmd.append('Quotation', undefined);
        // fmd.append('id_especie', id_especie);
        // fmd.append('Especie', nombreEspecie);
        // fmd.append('Cliente', nombreCliente);
        // fmd.append('Formato', formato);
        // fmd.append('Formato', formato);
    }
}
exports.default = Quotation;
