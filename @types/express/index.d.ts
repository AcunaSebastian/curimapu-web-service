import express from "express";
import { ISystemParameters, IUsuario } from '../../interfaces';
import { DatabaseService } from '../../model/database';

declare global {
  namespace Express {
    interface Request {
      bd_conection: DatabaseService,
      bd_params:ISystemParameters, 
      usuario:IUsuario
    }
  }
}