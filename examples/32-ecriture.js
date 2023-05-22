"use strict";

// ce code permet l'ecriture d'une url ainsi que de deux champs texte sur un ntag213

const { NFC } = require("../src/index");

const nfc = new NFC();
const ndef = require("@taptrack/ndef");

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

nfc.on("reader", (reader) => {
	reader.aid = "F222222222";
	let count = 1120;
	let color = "red";

	reader.on("card", async (card) => {
		try {
			count++;
			if (count < 375) {
				color = "red";
			} else if (count < 750) {
				color = "blue";
			} else if (count < 1125) {
				color = "purple";
			} else if (count < 1500) {
				color = "orange";
			}

			const uriRecord = ndef.Utils.createUriRecord(
				"http://www.seasonspeak.fr/ethernighty"
			);

			const textRecord = ndef.Utils.createTextRecord(
				count.toString(),
				"en"
			);

			const colorRecord = ndef.Utils.createTextRecord(color, "en");

			const message = new ndef.Message([
				uriRecord,
				textRecord,
				colorRecord,
			]);
			const bytes = message.toByteArray();
			// convert the Uint8Array into to the Buffer and encapsulate it
			const data = encapsulate(Buffer.from(bytes.buffer));

			// data is instance of Buffer containing encapsulated NDEF message
			await reader.write(4, data);
			console.log(`records written, count: ${count}, color: ${color}`);
		} catch (err) {
			console.error(`error while writing records`, err);
		}
	});
});
