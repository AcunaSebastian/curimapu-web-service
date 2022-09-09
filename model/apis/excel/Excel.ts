import { IUsuario } from '../../../interfaces';
import { DatabaseService } from '../../database/';
import Excel from "excel4node";
import { Especie, LibroCampo, Resumen, Temporada } from '../../model';
import moment from 'moment';


export type tipoExcel = 'RESUMEN' | 'ALL' | 'SOWING' | 'FLOWERING' | 'HARVEST';


interface IParamsExcel {
    type:tipoExcel, 
    id_temporada:number, 
    id_especie:number, 
    usuario:IUsuario,
    etapa?:number,
    lote?:string,
    predio?:string,
    limit?:number,
    page?:number,
    num_anexo?:string,
    ready_batch?:string,
    recomendaciones?:string,
    agricultor?:string,
}

export default class ExcelClass {

    private dbConnection:DatabaseService;
    private Excel:Excel.Workbook;
    private style:Excel.Style;

    constructor( dbConnection:DatabaseService ){
        this.dbConnection = dbConnection;
        this.Excel = new Excel.Workbook({
            logLevel:0
        });
        this.style = this.Excel.createStyle({
            numberFormat:'#,##0.00'
        });
    }


    async generarExcel( params:IParamsExcel ):Promise<string>{

        const { id_temporada, id_especie, usuario,type }= params;

        switch(type){
            case 'ALL'      :   return await this.generarAll(params);
            case 'RESUMEN'  :   return await this.generarResumen(id_temporada, id_especie, usuario);
            default         :   return ''
        }

    }
    async generarAll(params:IParamsExcel):Promise<string> {
        
        const libroCampo = new LibroCampo( this.dbConnection );

        const { id_temporada, id_especie, usuario, etapa, type } = params;

        const cabeceras = await libroCampo.getCabecera({id_temporada, id_especie, usuario, etapa});
        const data = await libroCampo.getData(params);
        const finalCabs:any[] = [];
        if(cabeceras.length > 0){
            for (const cabecera of cabeceras) {
            
                const tmpSubProps = cabeceras.filter( cab => cab.id_prop === cabecera.id_prop);
                const existe  = finalCabs.filter( p => p.id_prop === cabecera.id_prop);
                if(existe.length <= 0){
                    finalCabs.push({...cabecera, subProps:tmpSubProps});
                }
            }
        }


        const especieClass  = new Especie( this.dbConnection );
        const especie = await especieClass.getEspecieById( id_especie ); 

        const temporadaClass = new Temporada( this.dbConnection );
        const temporada = await temporadaClass.getTemporadaById( id_temporada );


        var worksheet = this.Excel.addWorksheet(type);

        const titleStyle = this.Excel.createStyle({
            font:{
             size:22,
             bold:true
            }
         }) 
 
        worksheet.cell(1,1).string(`${type} FOR ${especie.nombre} ON SEASON (${temporada.nombre}) `).style(titleStyle);

        let cont = 1;
        for (const cabecera of finalCabs) {

            const rowHasta = cabecera.subProps.length > 0 ? cabecera.subProps.length - 1 : cont;
            worksheet.cell(2,cont, 2, cont + rowHasta, true).string(`${cabecera?.nombre_propiedad || 'RESUME'}`).style(this.Excel.createStyle({
                border:{
                    left:{
                        color:'black',
                        style:'thin'
                    },
                    right:{
                        color:'black',
                        style:'thin'
                    },
                    top:{
                        color:'black',
                        style:'thin'
                    },
                    bottom:{
                        color:'black',
                        style:'thin'
                    },
                    outline:true
                },
                fill:{
                    type:'gradient',
                    bgColor:'dark green',
                    fgColor:'dark green',
                }
            }));

            cont += (rowHasta + 1);
        }

        cont = 1;
        for (const cabecera of cabeceras) {

            worksheet.cell(3,cont++).string(`${cabecera?.nombre_sub_propiedad || ''}`).style(this.Excel.createStyle({
                border:{
                    left:{
                        color:'black',
                        style:'thin'
                    },
                    right:{
                        color:'black',
                        style:'thin'
                    },
                    top:{
                        color:'black',
                        style:'thin'
                    },
                    bottom:{
                        color:'black',
                        style:'thin'
                    },
                    outline:true
                },
                fill:{
                    type:'gradient',
                    bgColor:'dark green',
                    fgColor:'dark green',
                }
            }));
        }

        let contRow = 4;
        for( const anexos of data ){
            let contColumn = 1;
            for (const data of anexos.data) {
                const linea =  worksheet.cell(contRow,contColumn++);

                const regex = /^[0-9]*(\.?)[ 0-9]+$/;
                const esNumerico = regex.test(data.valor);

                if(esNumerico){
                    linea.number(parseFloat(data.valor) * 1).style(this.style);
                }else{
                    linea.string(`${data?.valor || ''}`)
                }
            }
            contRow++;
        }

        const excelName = `uploads/${type}_${especie.nombre}_${moment().format('YYYYMMDDHHmmss')}.xlsx`;

        return new Promise( resolve => {
            this.Excel.write(excelName, (err, stats) => {

                if(err) return '';
    
                return resolve(excelName);
            });
        })
        

    }


    async generarResumen (id_temporada: number, id_especie: number, usuario: IUsuario):Promise<string> {
        

        const resumen = new Resumen( this.dbConnection );
        const cabeceras = await resumen.getCabecera(id_temporada, id_especie);
        const datas = await resumen.getData(id_temporada, id_especie, usuario, 0, undefined);
        var worksheet = this.Excel.addWorksheet('SUMMARY');


        const especieClass  = new Especie( this.dbConnection );
        const especie = await especieClass.getEspecieById( id_especie ); 

        const temporadaClass = new Temporada( this.dbConnection );
        const temporada = await temporadaClass.getTemporadaById( id_temporada );

        const titleStyle = this.Excel.createStyle({
           font:{
            size:22,
            bold:true
           }
        }) 

        worksheet.cell(1,1, 1, 5, true).string(`PEA SUMMARY ${temporada.nombre} SEASON `).style(titleStyle);
        
        let cont = 1;
        for (const cabecera of cabeceras) {
            worksheet.cell(2,cont++).string(`${cabecera.nombre_sub_propiedad}`).style(this.Excel.createStyle({
                font:{
                    bold:true
                },
                border:{
                    top:{
                        color:'black',
                        style:'thin'
                    },
                    bottom:{
                        color:'black',
                        style:'thin'
                    },
                    right:{
                        color:'black',
                        style:'thin'
                    },
                    left:{
                        color:'black',
                        style:'thin'
                    },
                    outline:true
                },
                fill:{
                    type:'gradient',
                    bgColor:'dark green',
                    fgColor:'dark green',
                }
            }));
        }


        let contRow = 3;
        for( const anexos of datas ){
            let contColumn = 1;
            for (const data of anexos.data) {
                const linea =  worksheet.cell(contRow,contColumn++);

                const regex = /^[0-9]*(\.?)[ 0-9]+$/;
                const esNumerico = regex.test(data.valor);

                if(esNumerico){
                    linea.number(parseFloat(data.valor) * 1).style(this.style);
                }else{
                    linea.string(`${data?.valor || ''}`)
                }
            }
            contRow++;
        }

        const excelName = `uploads/Summary_${especie.nombre}_${moment().format('YYYYMMDDHHmmss')}.xlsx`;
        return new Promise( resolve => {
            this.Excel.write(excelName, (err, stats) => {
                if(err) resolve('');
                return resolve(excelName);
            });
        })
    }

}