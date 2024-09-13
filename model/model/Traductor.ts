import axios from "axios";

import "dotenv/config";

export class Traductor {
  async traducir({
    texto,
    rut,
    sistema,
    id_registro,
  }: {
    texto: string;
    rut: string;
    sistema: string;
    id_registro: number;
  }) {
    const body = {
      texto,
      rut,
      sistema,
      language: ["spanish", "english"],
      ambiente: process.env.AMBIENTE,
      id_registro,
    };

    try {
      const { data } = await axios.post(
        "https://traductor.zproduccion.cl/traductor-api/api/v1/openai/translate",
        body
      );

      if (!data.ok) {
        return "";
      }

      console.log({ trasn: data.data.translations[0] });

      return data.data.translations[0].translation;
    } catch (error) {
      console.log(error);
    }
  }
}
