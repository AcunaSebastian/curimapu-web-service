import express, {Application} from 'express';
import cors from 'cors'
import fileUpload from 'express-fileupload';

// import { authRouter, authFilter, homeRouter, dteRouter } from '../routes';


export default class Server {

    private app: Application;
    private port: string;


    constructor(){
        this.app = express();
        this.port = process.env.PORT!;

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
        // this.app.use('/api/auth', authRouter);
        // this.app.use('/api/filters', authFilter);
        // this.app.use('/api/home', homeRouter);
        // this.app.use('/api/dte', dteRouter);
    }


    listen():void{
        this.app.listen( this.port, () => {
            console.log(`Server running on port : ${ this.port }`);
        })
    }
}