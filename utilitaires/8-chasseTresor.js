"use strict";

// ce code permet l'ecriture d'une url ainsi que de deux champs texte sur un ntag213

const { NFC } = require("../src/index");
import axios from "axios";
import https from "https";
const nfc = new NFC();
const ndef = require("@taptrack/ndef");
const { encryptString, encryptNumber, encryptNumber1 } = require("./cryptage");

// generation d'un id unique
const crypto = require("crypto");
function generateId() {
	const id = crypto.randomBytes(4).toString("hex");
	return parseInt(id, 16).toString().substring(0, 8);
}

const encapsulate = (data, blockSize = 4) => {
	if (data.length > 0xfffe) {
		throw new Error("Maximal NDEF message size exceeded.");
	}

	const prefix = Buffer.allocUnsafe(data.length > 0xfe ? 4 : 2);
	prefix[0] = 0x03; // NDEF type
	if (data.length > 0xfe) {
		prefix[1] = 0xff;
		prefix.writeInt16BE(data.length, 2);
	} else {
		prefix[1] = data.length;
	}

	const suffix = Buffer.from([0xfe]);

	const totalLength = prefix.length + data.length + suffix.length;
	const excessLength = totalLength % blockSize;
	const rightPadding = excessLength > 0 ? blockSize - excessLength : 0;
	const newLength = totalLength + rightPadding;

	return Buffer.concat([prefix, data, suffix], newLength);
};

console.log(
	"\x1b[1m\x1b[32m" +
		"Bienvenue, ce programme permet de generer des balise de chasse au tresor , merci de scanner les balises pour les generer" +
		"\x1b[0m"
);
nfc.on("reader", (reader) => {
	reader.aid = "F222222222";

	//////////////////
	reader.on("card", async (card) => {
		try {
			let treasureId = generateId();

			///////////// encodage du message

			// url du badge (pas de cryptage car doit etre lisible par telephone)
			const uriRecord = ndef.Utils.createUriRecord(
				`http://192.168.1.177:8000/treasureHunt/${treasureId}`
			);

			////////////// enpacketage des donnees
			const message = new ndef.Message([uriRecord]);
			//////////////// conversion en bytes
			const bytes = message.toByteArray();
			// convert the Uint8Array into to the Buffer and encapsulate it
			const data = encapsulate(Buffer.from(bytes.buffer));

			// data is instance of Buffer containing encapsulated NDEF message
			//////////////// ecriture du message sur badge
			await reader.write(4, data);
			////////////// message de validation de l'ecriture du badge
			console.log(`records written, treasureId: ${treasureId}`);

			///////////////// creation de l'utilisateur en bdd
			const dataArray = [treasureId];
			const agent = new https.Agent({
				rejectUnauthorized: false,
			});
			const api = axios.create({
				baseURL: "https://localhost:8000/api",
				withCredentials: true,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Headers":
						"Origin, X-Requested-With, Content-Type, Accept",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
				},
				httpsAgent: agent, // configuration de l'agent pour la communication https
			});

			try {
				const response = await api.post("treasureHunt", {
					data: dataArray,
				});
				console.log(response.data);
			} catch (error) {
				console.error(error);
			}
		} catch (err) {
			console.error(`error while writing records`, err);
		}
	});
});
