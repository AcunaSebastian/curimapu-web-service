import express from "express";
import { ISystemParameters, IUsuario } from '../../interfaces';

declare global {
  namespace Express {
    interface Request {
      bd_conection: DatabaseService,
      bd_params:ISystemParameters, 
      usuario:IUsuario[]
    }
  }
}