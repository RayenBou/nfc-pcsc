"use strict";

// ce code permet de formater une puce NFC en utilisant le protocole NDEF

const { NFC } = require("../src/index");

const nfc = new NFC();
const ndef = require("@taptrack/ndef");

// fonction qui encapsule les données pour former un message NDEF
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

nfc.on("reader", async (reader) => {
	reader.aid = "F222222222";
	reader.on("card", async (card) => {
		try {
			const message = new ndef.Message([]);

			// formater la puce NFC
			await reader.write(4, message.toByteArray());
			console.log("NFC tag formatted successfully");
		} catch (err) {
			console.error(`error while formatting NFC tag`, err);
		}
	});
});
