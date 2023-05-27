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
console.log(
	"\x1b[1m\x1b[32m" +
		"Bienvenue, ce programme permet de verifier les gagnant de boissons" +
		"\x1b[0m"
);
nfc.on("reader", (reader) => {
	reader.aid = "F222222222";
	reader.on("card", async (card) => {
		try {
			const data = await reader.read(4, 176);
			const message = ndef.Message.fromBytes(data);
			var parsedRecords = message.getRecords();

			var TagIdEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[1]);
			var colorEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[2]);

			var userIdEncrypted = ndef.Utils.resolveTextRecord(
				parsedRecords[3]
			);
			try {
				var color = decryptString(
					colorEncrypted.content,
					EncryptionKey
				);
				var tagId = decryptNumber(
					TagIdEncrypted.content,
					EncryptionKey
				);

				var userId = decryptNumber1(
					userIdEncrypted.content,
					EncryptionKey
				);
			} catch (decryptionError) {
				console.error("Erreur lors du déchiffrement des données");
				// Arrête le traitement en cas d'erreur de déchiffrement
			}

			const dataArray = [tagId, userId, color];

			try {
				const api = axios.create({
					baseURL: "https://localhost:8000/api/",
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
					const response2 = await api.post("winner", {
						data: dataArray,
					});

					console.log("tagId: " + tagId, response2.data);
				} catch (error) {
					console.error(error);
				}

				// console.log(response.data);
			} catch (error) {
				// console.error(error);
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
