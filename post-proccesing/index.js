const fs = require("fs");

const data = JSON.parse(fs.readFileSync("data.json"));

let csv = "";
for (const key of Object.keys(data.attendance)) {
	const registry = data.attendance[key];
	csv += `${registry.curp},${registry.tipo},${registry.fecha}\n`;
}

fs.writeFile("attendance.csv", csv, (err) => {
	if (err) console.error(err);
	else console.log("Ok");
});
