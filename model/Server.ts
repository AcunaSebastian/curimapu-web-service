import express, {Application} from 'express';
import cors from 'cors'
import fileUpload from 'express-fileupload';

import { authRouter, filterRouter, homeRouter, ingresosRouter, resumenRouter, visitasRouter } from '../router/';


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
        this.app.use('/api/auth', authRouter);
        this.app.use('/api/filters', filterRouter);
        this.app.use('/api/home', homeRouter);
        this.app.use('/api/resumen', resumenRouter);
        this.app.use('/api/visitas', visitasRouter);
        this.app.use('/api/ingresos', ingresosRouter);
        // this.app.use('/api/dte', dteRouter);
    }


    listen():void{
        this.app.listen( this.port, () => {
            console.log(`Server running on port : ${ this.port }`);
        })
    }
}