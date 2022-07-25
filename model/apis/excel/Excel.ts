import { IUsuario } from '../../../interfaces';
import { DatabaseService } from '../../database/';
import Excel from "excel4node";
import { Especie, Resumen, Temporada } from '../../model';


type tipoExcel = 'RESUMEN' | 'ALL' | 'SOWING' | 'FLOWERING' | 'HARVEST';

export default class ExcelClass {

    private dbConnection:DatabaseService;
    private Excel:Excel.Workbook;
    private style:Excel.Style;

    constructor( dbConnection:DatabaseService ){
        this.dbConnection = dbConnection;
        this.Excel = new Excel.Workbook();
        this.style = this.Excel.createStyle({
            numberFormat:'#.##0,00'
        });
    }


    async generarExcel( type:tipoExcel, id_temporada:number, id_especie:number, usuario:IUsuario ){

        switch(type){
            case 'ALL':  return await this.generarAll(id_temporada, id_especie, usuario);
            case 'RESUMEN': return await this.generarResumen(id_temporada, id_especie, usuario);
        }

    }
    async generarAll(id_temporada: number, id_especie: number, usuario: IUsuario) {
        
        const workbook = new Excel.Workbook();

        var worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.cell(1,3).string('sssss');


        console.log(worksheet);

        workbook.write('./uploads/Excel.xlsx');

    }


    async generarResumen (id_temporada: number, id_especie: number, usuario: IUsuario) {
        

        const resumen = new Resumen( this.dbConnection );
        const cabeceras = await resumen.getCabecera(id_temporada, id_especie);
        const datas = await resumen.getData(id_temporada, id_especie, usuario);
        var worksheet = this.Excel.addWorksheet('RESUMEN');


        const especieClass  = new Especie( this.dbConnection );
        const especie = await especieClass.getEspecieById( id_especie ); 

        const temporadaClass = new Temporada( this.dbConnection );
        const temporada = await temporadaClass.getTemporadaById( id_temporada );

        worksheet.cell(1,1).string(`RESUME FOR ${especie.nombre} ON SEASON (${temporada.nombre}) `);
        
        let cont = 1;
        for (const cabecera of cabeceras) {
            worksheet.cell(2,cont++).string(`${cabecera?.nombre_propiedad || ''}\n${cabecera.nombre_sub_propiedad}`);
        }


        let contRow = 3;
        for( const anexos of datas ){
            let contColumn = 1;
            for (const data of anexos.data) {
                const linea =  worksheet.cell(contRow,contColumn++);

                // if( typeof data.valor) linea.number(`${data?.valor || 0}`)
            }
            contRow++;
        }



        this.Excel.write('uploads/Excel.xlsx');
    }

}