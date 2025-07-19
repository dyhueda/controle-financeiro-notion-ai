import { IncomingForm } from "formidable";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
export const config = {
  api: {
    bodyParser: false,
  },
};
export default function handler(req, res) {
  const form = new IncomingForm({
    uploadDir: "./public/uploads",
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Erro no upload" });
    }

    const filePath = files.image?.[0]?.filepath || files.image?.filepath;

    try {
      const ai = new GoogleGenAI({});
      const base64ImageFile = fs.readFileSync(filePath, {
        encoding: "base64",
      });
      fs.unlinkSync(filePath);
      const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64ImageFile,
          },
        },
        {
          text: 'Take this image, create a json like this {"store_name": ,"purchase_date": "YYYY-MM-DD" ,"items":[{"name": ,"quantity": ,"price":, "price_per_item": }],"total":} all in english the value of total is always with tax',
        },
      ];
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
      let json = response.text;
      const match = json.match(/{[\s\S]*}/);
      if (match) {
        const jsonStr = match[0];
        const obj = JSON.parse(jsonStr);
        json = obj;
      } else {
        console.log("JSON não encontrado.");
      }
      console.log(json);
      let ids = [];
      for (const item of json.items) {
        const responseNotion = await notion.pages.create({
          parent: {
            database_id: process.env.NOTION_DATABASE_ID_ITENS,
          },
          properties: {
            Nome: {
              title: [
                {
                  text: {
                    content: item.name,
                  },
                },
              ],
            },
            "Valor Total": {
              number: item.price,
            },
            "Valor por Item": {
              number: item.price_per_item,
            },
            Quantidade: {
              number: item.quantity
            }
          },
        });
        ids.push(responseNotion.id);
      }
      const responseNotionDespesas = await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID_DESPESAS,
        },
        properties: {
          Despesa: {
            title: [
              {
                text: {
                  content: json.store_name,
                },
              },
            ],
          },
          Valor: {
            number: json.total,
          },
          Data: {
            date: {
              start: json.purchase_date,
            },
          },
          Itens: {
            relation: ids.map((id) => ({ id })),
          },
        },
      });
      console.log(responseNotionDespesas)
      res.status(200).json({
        message: "Itens adicionados",
        result: json,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Erro no processamento" });
    } 
  });
}
