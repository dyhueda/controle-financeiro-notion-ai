import { IncomingForm } from "formidable";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { Client } from "@notionhq/client";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const form = new IncomingForm({
    uploadDir: "/tmp",
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erro ao fazer o upload:", err);
      return res.status(500).json({ message: "Erro ao fazer upload do arquivo." });
    }

    const file = files.image?.[0] || files.image;
    const filePath = file?.filepath;

    if (!filePath) {
      return res.status(400).json({ message: "Imagem não enviada." });
    }

    let json;

    try {
      const ai = new GoogleGenAI({});
      const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("Erro ao apagar arquivo:", e);
      }

      const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64ImageFile,
          },
        },
        {
          text: 'Take this image, the date sometimes are YY年/MM月/DD日 or YYYY年/MM月/DD日 transform to YYYY-MM-DD translate to english and create a json like this {"store_name": ,"purchase_date": "YYYY-MM-DD" ,"items":[{"name": ,"quantity": ,"price":, "price_per_item": }],"total":}, the value of total is always with tax ',
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      const match = response.text.match(/{[\s\S]*}/);

      if (!match) {
        console.error("Resposta da IA não contém JSON válido:", response.text);
        return res.status(500).json({ message: "Erro ao interpretar resposta da IA." });
      }

      json = JSON.parse(match[0]);

    } catch (e) {
      console.error("Erro ao processar imagem com IA:", e);
      return res.status(500).json({ message: "Erro ao processar imagem com IA." });
    }

    try {
      if (!json.items || !Array.isArray(json.items) || json.items.length === 0) {
        return res.status(400).json({ message: "Nenhum item encontrado no recibo." });
      }

      const itemIds = [];

      for (const item of json.items) {
        const createdPage = await notion.pages.create({
          parent: {
            database_id: process.env.NOTION_DATABASE_ID_ITENS,
          },
          properties: {
            Nome: {
              title: [{ text: { content: item.name || "Item sem nome" } }],
            },
            "Valor Total": { number: item.price || 0 },
            "Valor por Item": { number: item.price_per_item || 0 },
            Quantidade: { number: item.quantity || 1 },
          },
        });

        itemIds.push(createdPage.id);
      }

      await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID_DESPESAS,
        },
        properties: {
          Despesa: {
            title: [{ text: { content: json.store_name || "Sem Nome" } }],
          },
          Valor: { number: json.total || 0 },
          Data: { date: { start: json.purchase_date || new Date().toISOString() } },
          Itens: {
            relation: itemIds.map((id) => ({ id })),
          },
        },
      });

      return res.status(200).json({
        message: "Itens adicionados com sucesso.",
        result: json,
      });

    } catch (e) {
      console.error("Erro ao salvar no Notion:", e);
      return res.status(500).json({ message: "Erro ao salvar dados no Notion." });
    }
  });
}
