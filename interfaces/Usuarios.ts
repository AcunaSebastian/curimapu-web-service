export interface IUsuario {
    id_usuario: bigint;
    rut: string;
    user: string;
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    telefono: string;
    id_region: string;
    id_pais: string;
    id_comuna: string;
    id_provincia: bigint;
    direccion: string;
    supervisa_otro: string;
    email: string;
    enlazado: string;
    ciudad: string;
    mod_pass: number;
    user_crea: string;
    fecha_crea: string;
    user_mod: string;
    fecha_mod: string;
    mod_prop: number;
    ve_ingresos: string;
    rebote_wsp: number;
    id_tipo_usuario:number;
    desc_tipo_usuario:string;
    usuarios_enlazados:number[];
    isUsuarioDetQuo:boolean;
}