import { IUsuario } from '../../interfaces/';
import { DatabaseService } from '../database/';
import moment from 'moment';
import { Constants } from '../../utils';

interface IFiltersIngresos {
    usuario:IUsuario;
    id?:number;
    rut?:string;
    nombre?:string;
    fecha?:string;
    hora?:string;
    system:string;
    limit?:number;
    page:number;
}

export default class Usuario {
  
   


    constructor( private dbConnection:DatabaseService ){}


    async getUserById(id_usuario:number):Promise<IUsuario|null> {

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

        const bdUser:IUsuario[] = await this.dbConnection.select( sql );

        if(bdUser.length <= 0) return null;

        const user:IUsuario = bdUser[0];

        const userEnlazado:any[] = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${ user.id_usuario}' `);
        user.usuarios_enlazados = userEnlazado.map( el => Number(el.id_enlazado));
        
        // const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${ user.id_usuario }'`);
        // const isUsuarioDetQuo = (usuarioDeQuo.length > 0);
        const isUsuarioDetQuo = (user.id_tipo_usuario === Constants.USUARIO_CLIENTE);
        user.isUsuarioDetQuo = isUsuarioDetQuo;

        return user;
    }

    async getUsers(): Promise<IUsuario[]> {
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

        const bdUser:IUsuario[] = await this.dbConnection.select( sql );


        const user:IUsuario[] = [];


        for (const usuario of bdUser) {
            const userEnlazado:any[] = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${ usuario.id_usuario}' `);
            
            // const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${ usuario.id_usuario }'`);
            // const isUsuarioDetQuo = (usuarioDeQuo.length > 0);
            const isUsuarioDetQuo = (usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE);

            user.push({...usuario, usuarios_enlazados:userEnlazado.map( el => Number(el.id_enlazado)), isUsuarioDetQuo});

        }

        return user;
    }

    async getUserForLogin( username:string, password:string ): Promise<IUsuario | null> {

        const sql =`SELECT 
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
        const bdUser:IUsuario[] = await this.dbConnection.select( sql );

        if(bdUser.length <= 0){
            return null;
        }

        const user:IUsuario = bdUser[0];
        const userEnlazado:any[] = await this.dbConnection.select(`SELECT id_enlazado FROM usuario_enlazado WHERE id_usuario = '${ user.id_usuario}' `);
     

        // const usuarioDeQuo = await this.dbConnection.select(`SELECT * FROM usuario_det_quo WHERE id_usuario = '${ user.id_usuario }'`);
        const isUsuarioDetQuo = (user.id_tipo_usuario === Constants.USUARIO_CLIENTE);


        return {...user, usuarios_enlazados:userEnlazado.map( el => Number(el.id_enlazado)), isUsuarioDetQuo};
    }

    
    async setIngreso( usuario: IUsuario, system:string ) {

        const date = moment().format('YYYY-MM-DD hh:mm:ss');
       
        const insertParams = {
            rut_ingresa:usuario.rut,
            nombre_ingresa:`${usuario.nombre} ${usuario.apellido_p} ${usuario.apellido_m}`,
            fecha_hora_ingresa:date,
            dia:moment().format('DD'),
            mes:moment().format('MM'),
            anno:moment().format('YYYY'),
            hora:moment().format('hh:mm:ss'),
            tipo_usuario:usuario.id_tipo_usuario,
            usuario_asociado:usuario.enlazado,
            sistema_login:system
        }

        this.dbConnection.insert({table:'registro_login', params:insertParams})

    }


    async getIngresos( filtros:IFiltersIngresos ) {


        const { 
            usuario, id,
            rut, nombre,
            fecha, hora, system, limit, page
         } = filtros;



         if(usuario.ve_ingresos === 'NO'){
            return [];
         }

         const sistema = (system === 'EXPORT') ? 'c.curimapu' : 'c.vegetables';


         let filtro = ` AND sistema_login = '${ sistema }' `;

         if( id ){
            filtro += ` AND id_registro_login = '${id}' `;
         }

         if(rut){
            filtro += ` AND rut_ingresa LIKE '%${rut}%' `;
         }

         if(nombre){
            filtro += ` AND nombre_ingresa LIKE '%${nombre}%' `;
         }

         if( fecha && hora ){
            filtro += ` AND fecha_hora_ingresa = '${fecha} ${hora}'`
         }else if (fecha && !hora){
            filtro += ` AND fecha_hora_ingresa BETWEEN '${fecha} 00:00:00' AND '${fecha} 23:59:59' `;
         }else if(!fecha && hora){
            filtro += ` AND hora = '${hora}' `;
         }


         let limite = ``;
         if(limit){
            const pagina = (page > 0) ? ( page - 1 ) * limit : 0;
            limite = ` LIMIT ${pagina}, ${limit} `;
         }


         const sql = ` SELECT * FROM registro_login 
         WHERE 1 ${ filtro } ORDER BY fecha_hora_ingresa DESC ${limite}`;

        // console.log(sql)

        const ingresos = await this.dbConnection.select( sql ); 


        return ingresos;
    }


    async changePassword(usuario:IUsuario, password:string) {

        const update = await this.dbConnection.update({
            table:'usuarios',
            params:{
                pass:password
            },
            where:` id_usuario = '${usuario.id_usuario}' `
        })

        return update[0] >= 0;

    }
}