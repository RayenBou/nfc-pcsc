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
const EncryptionKey = require("./encryptionKey");
console.log(
	"\x1b[1m\x1b[32m" +
		"Bienvenue, ce programme permet de lire les badge NFC, merci de poser un badge sur le lecteur pour commencer" +
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
			console.log("URI: " + uri);

			var idEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[1]);
			var colorEncrypted = ndef.Utils.resolveTextRecord(parsedRecords[2]);
			var userIdEncrypted = ndef.Utils.resolveTextRecord(
				parsedRecords[3]
			);

			// console.log(idEncrypted);
			// console.log(colorEncrypted);
			// console.log(userIdEncrypted);
			// return;
			var id = decryptNumber(idEncrypted.content, EncryptionKey);
			var color = decryptString(colorEncrypted.content, EncryptionKey);
			var userId = decryptNumber1(userIdEncrypted.content, EncryptionKey);

			console.log("id: " + id);
			console.log("color: " + color);
			console.log("userId: " + userId);
		} catch (err) {
			console.error(`error while reading records`, err);
		}
	});
});
