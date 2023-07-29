"use strict";

// ce code permet la lecture d'un badge nfc ntag213 prealablement ecrit avec la fonction 3-ecriture

const { NFC } = require("../src/index");
const ndef = require("@taptrack/ndef");
const {
	encryptString,
	decryptString,
	encryptNumber,
	decryptNumber,
	encryptNumber1,
	decryptNumber1,
} = require("./cryptage");
const nfc = new NFC();
const token = require("./token");
const EncryptionKey = require("./encryptionKey");
import axios from "axios";
import https from "https";

console.log(
	"\x1b[1m\x1b[32m" +
		"Bienvenue, ce programme permet de scanner les participant au jeu" +
		"\x1b[0m"
);
nfc.on("reader", (reader) => {
	reader.aid = "F222222222";

	reader.on("card", async (card) => {
		try {
			const data = await reader.read(4, 176);

			const message = ndef.Message.fromBytes(data);
			var parsedRecords = message.getRecords();

			console.log("Données:");

			var uri = ndef.Utils.resolveUriRecordToString(parsedRecords[0]);

			var tagIdEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[1]);
			var colorEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[2]);
			var userIdEncrypted = ndef.Utils.resolveTextRecord(
				parsedRecords[3]
			);

			var tagId = decryptNumber(tagIdEncrypted.content, EncryptionKey);
			var color = decryptString(colorEncrypted.content, EncryptionKey);
			var userId = decryptNumber1(userIdEncrypted.content, EncryptionKey);

			console.log("id: " + tagId);
			console.log("color: " + color);

			/////////////////////////// envoie dans la route d'enregistrement en db

			///////////////// creation de l'utilisateur en bdd
			const dataArray = [userId, tagId, color];
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

			try {
				const response = await api.post("game", {
					data: dataArray,
					token: token,
				});
				console.log(response.data);
			} catch (error) {
				console.error(error);
			}
		} catch (err) {
			console.error(`error while reading records`, err);
		}
	});
});
