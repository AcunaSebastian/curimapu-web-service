import fs from "fs";
import moment from "moment";
import { Request, Response } from "express";
import { ExcelClass, tipoExcel, LibroCampo, Quotation } from "../model";
import { httpResponses } from "../utils";

export const getLibroCampo = async (req: Request, res: Response) => {
  const {
    id_especie,
    id_temporada,
    etapa,
    limit = 100,
    page = 0,
    num_anexo,
    ready_batch,
    recomendaciones,
    agricultor,
    variedad,
    predio,
    lote,
  } = req.query;

  const usuario = req.usuario;
  const db = req.bd_conection;

  try {
    const params = {
      usuario,
      id_especie: id_especie as unknown as number,
      id_temporada: id_temporada as unknown as number,
      etapa: etapa ? (etapa as unknown as number) : undefined,
      lote: lote as unknown as string,
      predio: predio as unknown as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : 0,
      num_anexo: num_anexo as unknown as string,
      ready_batch: ready_batch as unknown as string,
      recomendaciones: recomendaciones as unknown as string,
      agricultor: agricultor as unknown as string,
      variedad: variedad as unknown as string,
    };

    const libroCampo = new LibroCampo(db);

    const cabeceras = await libroCampo.getCabecera(params);

    const finalCabs: any[] = [];

    if (cabeceras.length > 0) {
      for (const cabecera of cabeceras) {
        const tmpSubProps = cabeceras.filter((cab) => cab.id_prop === cabecera.id_prop);
        const existe = finalCabs.filter((p) => p.id_prop === cabecera.id_prop);
        if (existe.length <= 0) {
          finalCabs.push({ ...cabecera, subProps: tmpSubProps });
        }
      }
    }

    const data = await libroCampo.getData(params);
    const dataTotal = await libroCampo.getData({ ...params, limit: undefined });

    res.status(httpResponses.HTTP_OK).json({
      ok: true,
      message: "LIBRO CAMPO",
      data: {
        cabecera: finalCabs,
        data,
        total: dataTotal.length,
      },
    });
  } catch (error) {
    res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: `PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
      data: null,
    });
  }
};

export const getExcelLC = async (req: Request, res: Response) => {
  const {
    id_especie,
    id_temporada,
    etapa,
    limit,
    page = 0,
    num_anexo,
    ready_batch,
    recomendaciones,
    agricultor,
    predio,
    lote,
  } = req.query;

  const usuario = req.usuario;
  const db = req.bd_conection;

  try {
    const params = {
      usuario,
      id_especie: id_especie as unknown as number,
      id_temporada: id_temporada as unknown as number,
      etapa: etapa ? (etapa as unknown as number) : undefined,
      lote: lote as unknown as string,
      predio: predio as unknown as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : 0,
      num_anexo: num_anexo as unknown as string,
      ready_batch: ready_batch as unknown as string,
      recomendaciones: recomendaciones as unknown as string,
      agricultor: agricultor as unknown as string,
      type: "ALL" as tipoExcel,
    };

    const excel = new ExcelClass(db);
    const downloadExcel = await excel.generarExcel(params);

    const excelFile = fs.readFileSync(`./` + downloadExcel);

    fs.unlinkSync(`./` + downloadExcel);

    return res
      .status(httpResponses.HTTP_OK)
      .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .send(excelFile);
  } catch (error) {
    res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: `PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
      data: null,
    });
  }
};

export const getImagenesAnexo = async (req: Request, res: Response) => {
  const usuario = req.usuario;
  const db = req.bd_conection;
  const params = req.bd_params;

  const { id_anexo } = req.query as unknown as { id_anexo: number };

  try {
    const libroCampo = new LibroCampo(db);

    const listaImagenes = await libroCampo.getImagenes(id_anexo, params);

    return res.status(httpResponses.HTTP_OK).json({
      ok: true,
      message: `IMAGENES`,
      data: listaImagenes,
    });
  } catch (error) {
    res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: `PROBLEMAS EN FUNCION getImagenesAnexo ERROR : ${error}`,
      data: null,
    });
  }
};

export const getReporteQuotation = async (req: Request, res: Response) => {
  const db = req.bd_conection;
  const usuario = req.usuario;
  const bdParams = req.bd_params;

  const { id_cliente, id_temporada, id_especie } = req.query as unknown as {
    id_cliente: number;
    id_temporada: number;
    id_especie?: number;
    checks: any[];
  };

  const { checks } = req.body;

  const quotationClass = new Quotation(db);

  console.log("inicio peticion", moment().format("YYYY-MM-DD H:m:s"));

  const informe = await quotationClass.getReporteQuotation(
    usuario,
    id_cliente,
    id_temporada,
    bdParams,
    checks,
    id_especie
  );

  if (!fs.existsSync(`./` + informe)) {
    return res
      .status(httpResponses.HTTP_OK)
      .contentType("html")
      .send(`<h1>No se pudo obtener el documento</h1>`);
  }

  const pdfFile = fs.readFileSync(`./` + informe);
  fs.unlinkSync(`./` + informe);
  return res.status(httpResponses.HTTP_OK).contentType("application/pdf").send(pdfFile);

  // return res.json({
  //     informe
  // })
};

export const getCabeceraReporteQuot = async (req: Request, res: Response) => {
  const db = req.bd_conection;
  const usuario = req.usuario;
  const bdParams = req.bd_params;

  const { id_cliente, id_temporada, id_especie } = req.query as unknown as {
    id_cliente: number;
    id_temporada: number;
    id_especie?: number;
  };

  try {
    const quotationClass = new Quotation(db);

    const cabeceras = await quotationClass.getCabeceraReporte(
      usuario,
      id_cliente,
      id_temporada,
      bdParams,
      id_especie
    );

    res.status(httpResponses.HTTP_OK).json({
      ok: true,
      message: "LIBRO CAMPO",
      data: {
        cabeceras,
      },
    });
  } catch (error) {
    res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: `PROBLEMAS EN FUNCION getCabeceraReporteQuot ERROR : ${error}`,
      data: null,
    });
  }
};
// export const getImage = async (req:Request, res:Response) => {

//     const usuario = req.usuario;
//     const db = req.bd_conection;
//     const params = req.bd_params;

//     const { path } = req.query  as unknown as { path:string };

//     try {

//         const libroCampo  = new LibroCampo( db );

//         const image = await libroCampo.getOneImage( path, params );

//         return res.status( httpResponses.HTTP_OK ).send(image);

//     } catch (error) {
//         res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR ).json({
//             ok:false,
//             message:`PROBLEMAS EN FUNCION getImage ERROR : ${error}`,
//             data:null
//         })
//     }

// }
