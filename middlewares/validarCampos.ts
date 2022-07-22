import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from 'express-validator';
import { httpResponses } from "../utils";




export const validarCampos  = (req:Request, res:Response, next:NextFunction) => {
    
    const errorsResponse:Result<ValidationError> = validationResult(req);
    if(!errorsResponse.isEmpty()){
        const errors:ValidationError[] = errorsResponse.array();
        
        return res.status(httpResponses.HTTP_BAD_REQUEST).json({
            ok:false,
            message:`Se han encontrado los siguientes errores:\n ${errors.map( (el:ValidationError, index:number) => `${index + 1}.- msg:${el.msg}, param:${el.param}`).join(`\n`)}`,
            data:null
        });
    }

    next();

}