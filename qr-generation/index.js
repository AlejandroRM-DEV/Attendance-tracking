const fs = require("fs");
const path = require("path");
const axios = require("axios");
const XLSX = require("xlsx");

function fetchQR(qr_code_text) {
    const url =
        "https://api.qr-code-generator.com/v1/create?access-token=XXXXXX";
    const headers = {
        "Content-Type": "application/json",
    };

    const data = {
        qr_code_text: qr_code_text,
        image_format: "SVG",
        frame_name: "bottom-frame",
        download: 1,
        frame_icon_name: "vcard",
        frame_text: "ASISTENTE",
    };

    const folderPath = path.join(__dirname, "images");
    const fileName = `${qr_code_text}.svg`;
    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    return axios
        .post(url, data, {
            headers,
            responseType: "stream",
        })
        .then((response) => {
            return new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);
                writer.on("finish", resolve);
                writer.on("error", reject);
            });
        })
        .catch((error) => {
            console.error("Error al hacer la solicitud:", error);
            throw error;
        });
}

async function main() {
    const workbook = XLSX.readFile("./source.xlsx");
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const startRow = 2;
    const endRow = sheet["!ref"].split(":").pop().replace(/\D/g, "");
    const curps = [];
    for (let row = startRow; row <= endRow; row++) {
        const cellAddress = `G${row}`;
        const cell = sheet[cellAddress];
        const value = (cell && cell.v) || "";
        curps.push(value.toUpperCase().trim().replace(/\t/g, ''));
    }

    const folderPath = path.join(__dirname, "images");
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.readdir(folderPath, (error, files) => {
        if (error) {
            console.error(error);
            return;
        }
        files.forEach((file) => {
            if (curps.includes(file)) {
                curps = curps.filter((curp) => curp !== file);
            }
        });
    });

    try {
        for (const curp of curps) {
            try {
                await fetchQR(curp);
            } catch (error) {
                console.error(`Error al generar la imagen QR para ${curp}:`, error);
            }
        }
        console.error("Terminado.");
    } catch (error) {
        console.error("Error al generar las imágenes QR:", error);
    }
}

main();
