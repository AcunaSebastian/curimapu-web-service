import express, {Application} from 'express';
import cors from 'cors'
import fileUpload from 'express-fileupload';

import { authRouter, filterRouter, homeRouter, ingresosRouter, resumenRouter, visitasRouter, libroCampoRouter } from '../router/';



export default class Server {

    private app: Application;
    private port: number;


    constructor(){
        this.app = express();
        this.port = Number(process.env.PORT) | 3000;

        this.middlewares();
        this.routes();
    }


    middlewares():void { 

        this.app.use( cors() );
        this.app.use( express.json() );
        this.app.use( express.static('public'));
        this.app.use( fileUpload({useTempFiles:true, tempFileDir:'/tmp/'}) )

    }


    routes():void{
        this.app.use('/api/v1/auth', authRouter);
        this.app.use('/api/v1/filters', filterRouter);
        this.app.use('/api/v1/home', homeRouter);
        this.app.use('/api/v1/resumen', resumenRouter);
        this.app.use('/api/v1/visitas', visitasRouter);
        this.app.use('/api/v1/ingresos', ingresosRouter);
        this.app.use('/api/v1/libro-campo', libroCampoRouter);
        // this.app.use('/api/dte', dteRouter);
    }


    listen():void{
        this.app.listen( this.port, () => {
            console.log(`Server running on port : ${ this.port }`);
        })
    }
}