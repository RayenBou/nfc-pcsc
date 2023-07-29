"use strict";

// ce code permet l'ecriture d'une url ainsi que de deux champs texte sur un ntag213

const { NFC } = require("../src/index");
import axios from "axios";
import https from "https";
const nfc = new NFC();
const token = require("./token");
const EncryptionKey = require("./encryptionKey");
const ndef = require("@taptrack/ndef");
const { encryptString, encryptNumber, encryptNumber1 } = require("./cryptage");

// generation d'un id unique
const crypto = require("crypto");
function generateId() {
	const id = crypto.randomBytes(4).toString("hex");
	return parseInt(id, 16).toString().substring(0, 8);
}
// fonction de cryptage de la route avec une clé
function encryptUrlId(id) {
	const key = id
		.match(/\d/g)
		.reduce((acc, digit) => acc + parseInt(digit), 0);
	const encryptedId = id + "-" + key.toString().padStart(3, "0");
	return encryptedId;
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
		"Bienvenue, ce programme permet d'ecrire sur un badge" +
		"\x1b[0m"
);

nfc.on("reader", (reader) => {
	reader.aid = "F222222222";
	let tagId = 850;
	let color = "red";

	reader.on("card", async (card) => {
		try {
			//////////////// application de la couleur en fonction du numero de badge
			tagId++;
			if (tagId < 375) {
				color = "red";
			} else if (tagId < 750) {
				color = "blu";
			} else if (tagId < 1125) {
				color = "pur";
			} else if (tagId < 1500) {
				color = "ora";
			}
			// Ajouter un 0 devant le tagId si celui-ci ne comporte que 3 chiffres
			const paddedTagId = tagId.toString().padStart(4, "0");

			////////////////// cryptage des donnees

			// nombre du badge
			const encryptedNumber = encryptNumber(paddedTagId, EncryptionKey);

			//couleur du badge
			const encryptedColor = encryptString(color, EncryptionKey);

			//uniq id du badge
			let user = generateId();

			const encryptedId = encryptNumber1(user, EncryptionKey);

			// cryptage de la route avec une clé
			const encryptedUrlId = encryptUrlId(user);

			///////////// encodage du message

			// url du badge (pas de cryptage car doit etre lisible par telephone)
			// const uriRecord = ndef.Utils.createUriRecord(
			// 	`http://192.168.1.177:8000/player/${encryptedUrlId}`
			// );
			const uriRecord = ndef.Utils.createUriRecord(
				`https://ethernighty.seasonspeak.fr/player/${encryptedUrlId}`
			);

			const colorRecord = ndef.Utils.createTextRecord(
				encryptedColor,
				"en"
			);
			const numberRecord = ndef.Utils.createTextRecord(
				encryptedNumber,
				"en"
			);

			const userId = ndef.Utils.createTextRecord(encryptedId, "en");

			/////////// affichage des donnees enregistré sur le badge
			console.log(encryptedColor, encryptedNumber, encryptedId);

			////////////// enpacketage des donnees
			const message = new ndef.Message([
				uriRecord,
				numberRecord,
				colorRecord,
				userId,
			]);
			//////////////// conversion en bytes
			const bytes = message.toByteArray();
			// convert the Uint8Array into to the Buffer and encapsulate it
			const data = encapsulate(Buffer.from(bytes.buffer));

			// data is instance of Buffer containing encapsulated NDEF message
			//////////////// ecriture du message sur badge
			await reader.write(4, data);
			////////////// message de validation de l'ecriture du badge
			console.log(
				`records written, tagId: ${tagId}, color: ${color}, userId: ${user}`
			);

			///////////////// creation de l'utilisateur en bdd
			const dataArray = [user, tagId, color];
			const agent = new https.Agent({
				rejectUnauthorized: false,
			});
			const api = axios.create({
				baseURL: "https://localhost:8000/api/",
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
			// const api = axios.create({
			// 	baseURL: "https://ethernighty.seasonspeak.fr/api/",
			// 	withCredentials: true,
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 		"Access-Control-Allow-Origin":
			// 			"https://ethernighty.seasonspeak.fr/",
			// 		"Access-Control-Allow-Headers":
			// 			"Origin, X-Requested-With, Content-Type, Accept",
			// 		"Access-Control-Allow-Methods": "POST",
			// 	},
			// 	// httpsAgent: agent, // configuration de l'agent pour la communication https
			// });

			try {
				const response = await api.post("participant", {
					data: dataArray,
					token: token,
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
