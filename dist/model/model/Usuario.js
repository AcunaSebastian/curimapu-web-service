"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class Usuario {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getUserById(id_usuario) {
        const sql = `SELECT 
        usuarios.id_usuario,
        usuarios.rut,
        usuarios.user,
        usuarios.nombre,
        usuarios.apellido_p,
        usuarios.apellido_m,
        usuarios.telefono,
        usuarios.id_region,
        usuarios.id_pais,
        usuarios.id_comuna,
        usuarios.id_provincia,
        usuarios.direccion,
        usuarios.supervisa_otro,
        usuarios.email,
        usuarios.enlazado,
        usuarios.ciudad,
        usuarios.mod_pass,
        usuarios.user_crea,
        usuarios.fecha_crea,
        usuarios.user_mod,
        usuarios.fecha_mod,
        usuarios.mod_prop,
        usuarios.ve_ingresos,
        usuarios.rebote_wsp,
        tipo_usuario.id_tu AS id_tipo_usuario,
        tipo_usuario.descripcion  AS desc_tipo_usuario
        FROM usuarios 
        INNER JOIN  usuario_tipo_usuario  USING (id_usuario) 
        INNER JOIN  tipo_usuario   USING (id_tu) 
        WHERE id_usuario = '${id_usuario}'`;
        const bdUser = await this.dbConnection.select(sql);
        if (bdUser.length <= 0)
            return null;
        const user = bdUser[0];
        const userEnlazado = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${user.id_usuario}' `);
        user.usuarios_enlazados = userEnlazado.map(el => Number(el.id_enlazado));
        const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${user.id_usuario}'`);
        const isUsuarioDetQuo = (usuarioDeQuo.length > 0);
        user.isUsuarioDetQuo = isUsuarioDetQuo;
        return user;
    }
    async getUsers() {
        const sql = `SELECT 
        usuarios.id_usuario,
        usuarios.rut,
        usuarios.user,
        usuarios.nombre,
        usuarios.apellido_p,
        usuarios.apellido_m,
        usuarios.telefono,
        usuarios.id_region,
        usuarios.id_pais,
        usuarios.id_comuna,
        usuarios.id_provincia,
        usuarios.direccion,
        usuarios.supervisa_otro,
        usuarios.email,
        usuarios.enlazado,
        usuarios.ciudad,
        usuarios.mod_pass,
        usuarios.user_crea,
        usuarios.fecha_crea,
        usuarios.user_mod,
        usuarios.fecha_mod,
        usuarios.mod_prop,
        usuarios.ve_ingresos,
        usuarios.rebote_wsp,
        tipo_usuario.id_tu AS id_tipo_usuario,
        tipo_usuario.descripcion  AS desc_tipo_usuario
        FROM usuarios 
        INNER JOIN  usuario_tipo_usuario  USING (id_usuario) 
        INNER JOIN  tipo_usuario   USING (id_tu)`;
        const bdUser = await this.dbConnection.select(sql);
        const user = [];
        for (const usuario of bdUser) {
            const userEnlazado = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${usuario.id_usuario}' `);
            const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${usuario.id_usuario}'`);
            const isUsuarioDetQuo = (usuarioDeQuo.length > 0);
            user.push({ ...usuario, usuarios_enlazados: userEnlazado.map(el => Number(el.id_enlazado)), isUsuarioDetQuo });
        }
        return user;
    }
    async getUserForLogin(username, password) {
        const sql = `SELECT 
        usuarios.id_usuario,
        usuarios.rut,
        usuarios.user,
        usuarios.nombre,
        usuarios.apellido_p,
        usuarios.apellido_m,
        usuarios.telefono,
        usuarios.id_region,
        usuarios.id_pais,
        usuarios.id_comuna,
        usuarios.id_provincia,
        usuarios.direccion,
        usuarios.supervisa_otro,
        usuarios.email,
        usuarios.enlazado,
        usuarios.ciudad,
        usuarios.mod_pass,
        usuarios.user_crea,
        usuarios.fecha_crea,
        usuarios.user_mod,
        usuarios.fecha_mod,
        usuarios.mod_prop,
        usuarios.ve_ingresos,
        usuarios.rebote_wsp,
        tipo_usuario.id_tu AS id_tipo_usuario,
        tipo_usuario.descripcion  AS desc_tipo_usuario
        FROM usuarios 
        INNER JOIN  usuario_tipo_usuario  USING (id_usuario) 
        INNER JOIN  tipo_usuario   USING (id_tu)
        WHERE user = '${username}' AND pass = '${password}'
        `;
        const bdUser = await this.dbConnection.select(sql);
        if (bdUser.length <= 0) {
            return null;
        }
        const user = bdUser[0];
        const userEnlazado = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${user.id_usuario}' `);
        const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${user.id_usuario}'`);
        const isUsuarioDetQuo = (usuarioDeQuo.length > 0);
        return { ...user, usuarios_enlazados: userEnlazado.map(el => Number(el.id_enlazado)), isUsuarioDetQuo };
    }
    async setIngreso(usuario, system) {
        const date = (0, moment_1.default)().format('YYYY-MM-DD hh:mm:ss');
        const insertParams = {
            rut_ingresa: usuario.rut,
            nombre_ingresa: `${usuario.nombre} ${usuario.apellido_p} ${usuario.apellido_m}`,
            fecha_hora_ingresa: date,
            dia: (0, moment_1.default)().format('DD'),
            mes: (0, moment_1.default)().format('MM'),
            anno: (0, moment_1.default)().format('YYYY'),
            hora: (0, moment_1.default)().format('hh:mm:ss'),
            tipo_usuario: usuario.id_tipo_usuario,
            usuario_asociado: usuario.enlazado,
            sistema_login: system
        };
        this.dbConnection.insert({ table: 'registro_login', params: insertParams });
    }
    async getIngresos(filtros) {
        const { usuario, id, rut, nombre, fecha, hora, system, limit, page } = filtros;
        if (usuario.ve_ingresos === 'NO') {
            return [];
        }
        const sistema = (system === 'EXPORT') ? 'c.curimapu' : 'c.vegetables';
        let filtro = ` AND sistema_login = '${sistema}' `;
        if (id) {
            filtro += ` AND id_registro_login = '${id}' `;
        }
        if (rut) {
            filtro += ` AND rut_ingresa LIKE '%${rut}%' `;
        }
        if (nombre) {
            filtro += ` AND nombre_ingresa LIKE '%${nombre}%' `;
        }
        if (fecha && hora) {
            filtro += ` AND fecha_hora_ingresa = '${fecha} ${hora}'`;
        }
        else if (fecha && !hora) {
            filtro += ` AND fecha_hora_ingresa BETWEEN '${fecha} 00:00:00' AND '${fecha} 23:59:59' `;
        }
        else if (!fecha && hora) {
            filtro += ` AND hora = '${hora}' `;
        }
        let limite = ``;
        if (limit) {
            const pagina = (page > 0) ? (page - 1) * limit : 0;
            limite = ` LIMIT ${pagina}, ${limit} `;
        }
        const ingresos = await this.dbConnection.select(` SELECT * FROM registro_login 
        WHERE 1 ${filtro} ORDER BY fecha_hora_ingresa DESC ${limite}`);
        return ingresos;
    }
    async changePassword(usuario, password) {
        const update = await this.dbConnection.update({
            table: 'usuarios',
            params: {
                pass: password
            },
            where: ` id_usuario = '${usuario.id_usuario}' `
        });
        return update[0] >= 0;
    }
}
exports.default = Usuario;
