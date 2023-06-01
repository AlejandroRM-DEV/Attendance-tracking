const fs = require('fs');
const path = require('path');
const axios = require('axios');

function generarImagenQR(qr_code_text) {
    const url = "https://api.qr-code-generator.com/v1/create?access-token=XXX";
    const headers = {
        "Content-Type": "application/json",
    };

    const data = {
        "qr_code_text": qr_code_text,
        "image_format": "SVG",
        "frame_name": "bottom-frame",
        "download": 1,
        "frame_icon_name": "vcard",
        "frame_text": "ASISTENTE"
    };

    const folderPath = path.join(__dirname, 'imagenes');
    const fileName = `${qr_code_text}.svg`;
    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    return axios.post(url, data, {
        headers,
        responseType: 'stream'
    })
        .then(response => {
            response.data.pipe(fs.createWriteStream(filePath));
            return new Promise((resolve, reject) => {
                response.data.on('error', (err) => {
                    console.error('Error al guardar el archivo:', err);
                    reject(err);
                });

                response.data.on('finish', () => {
                    resolve();
                });
            });
        })
        .catch(error => {
            console.error('Error al hacer la solicitud:', error);
            throw error;
        });
}

function generarImagenesQR(arrayQR) {
    const promises = arrayQR.map(qr_code_text => {
        return generarImagenQR(qr_code_text)
            .catch(error => console.error(`Error al generar la imagen QR para ${qr_code_text}:`, error));
    });

    return Promise.all(promises);
}

const arrayQR = ["ROTH020414MQRJMLA1"];
generarImagenesQR(arrayQR);
