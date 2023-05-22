"use strict";

// ce code permet la lecture d'un badge nfc ntag213 prealablement ecrit avec la fonction 3-ecriture et l'envoie en api

// il doit etre en constant fonctionnement dans un terminal afin de faire fonctionner l'appli.

const { NFC } = require("../src/index");
const ndef = require("@taptrack/ndef");
import axios from "axios";
import https from "https";
const nfc = new NFC();
const {
	encryptString,
	decryptString,
	encryptNumber,
	decryptNumber,
	encryptNumber1,
	decryptNumber1,
} = require("./cryptage");

// cle de decryptage
const EncryptionKey = 8;
//////////////////

const agent = new https.Agent({
	rejectUnauthorized: false,
});

const api = axios.create({
	baseURL: "https://localhost:8000/ethernighty/api/",
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

nfc.on("reader", (reader) => {
	reader.aid = "F222222222";
	reader.on("card", async (card) => {
		try {
			const data = await reader.read(4, 176);
			const message = ndef.Message.fromBytes(data);
			var parsedRecords = message.getRecords();
			// console.log("Données:");

			var uri = ndef.Utils.resolveUriRecordToString(parsedRecords[0]);

			// var id = ndef.Utils.resolveTextRecord(parsedRecords[1]);
			// var color = ndef.Utils.resolveTextRecord(parsedRecords[2]);
			// console.log("id: " + id.content);

			var idEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[1]);
			var colorEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[2]);
			try {
				var id = decryptNumber(idEncrypted.content, EncryptionKey);
				var color = decryptString(
					colorEncrypted.content,
					EncryptionKey
				);
			} catch (decryptionError) {
				console.error("Erreur lors du déchiffrement des données");
				// Arrête le traitement en cas d'erreur de déchiffrement
			}
			console.log("passed id: " + id);
			// console.log("color: " + color);
			// console.log("URI: " + uri);
			// console.log("color: " + color.content);

			// change la couleur du texte dans le terminal en fonction de la couleur donnee pour plus de lisibilité
			// switch (color) {
			// 	case "pur":
			// 		console.log("color:\x1b[1m\x1b[35m  " + color + "\x1b[0m");
			// 		break;
			// 	case "ora":
			// 		console.log("color:\x1b[1m\x1b[33m  " + color + "\x1b[0m");
			// 		break;
			// 	case "blu":
			// 		console.log("color:\x1b[1m\x1b[34m  " + color + "\x1b[0m");
			// 		break;
			// 	case "red":
			// 		console.log("color:\x1b[1m\x1b[31m  " + color + "\x1b[0m");
			// 		break;
			// 	default:
			// 		console.log("color: " + color);
			// 		break;
			// }

			const dataArray = [uri, id, color];
			const dataArray2 = [uri, id, color];

			try {
				const response = await api.post("data", {
					data: dataArray,
				});

				if (response.data.gagnant === "oui") {
					const api2 = axios.create({
						baseURL: "https://localhost:8000/ethernighty/winner/",
						withCredentials: true,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Headers":
								"Origin, X-Requested-With, Content-Type, Accept",
							"Access-Control-Allow-Methods":
								"GET, POST, PUT, DELETE",
						},
						httpsAgent: agent, // configuration de l'agent pour la communication https
					});

					try {
						// const response2 = await api2.post("data", {
						// 	data: dataArray2,
						// });
						// console.log(response2.data);
					} catch (error) {
						console.error(error);
					}
				}

				console.log(response.data);
			} catch (error) {
				console.error(error);
				console.log(
					"\x1b[1m\x1b[31m  " +
						"erreur de lecture du badge" +
						"\x1b[0m"
				);
			}
		} catch (err) {
			// console.error(`error while reading records`, err);
			console.log(
				"\x1b[1m\x1b[31m  " + "erreur de lecture du badge" + "\x1b[0m"
			);
		}
	});
});
