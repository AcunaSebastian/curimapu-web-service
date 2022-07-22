"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.default = Usuario;
