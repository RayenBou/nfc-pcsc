"use strict";

// #############
// Example: Controlling LED and buzzer on ACR122U
// - what is covered:
//   - custom led blinks
//   - custom buzzer output
//   - repeated beeping on unsuccessful read/write operation
// - TODO:
//   - document how to allow escape commands (direct communication without card)
//   - meanwhile please see https://github.com/pokusew/nfc-pcsc/issues/13
// #############

import { NFC, CONNECT_MODE_DIRECT } from "../src/index";
import pretty from "./pretty-logger";

const nfc = new NFC(pretty); // const nfc = new NFC(pretty); // optionally you can pass logger to see internal debug logs

nfc.on("reader", async (reader) => {
	pretty.info(`device attached`, reader);

	try {
		await reader.connect(CONNECT_MODE_DIRECT);
		await reader.setBuzzerOutput(false);
		await reader.disconnect();
	} catch (err) {
		pretty.info(`initial sequence error`, reader, err);
	}

	reader.on("card", async (card) => {
		pretty.info(`card detected`, reader, card);

		try {
			// red error
			await reader.led(0b01011101, [0x02, 0x01, 0x05, 0x01]);

			// green success
			// await reader.led(0b00101110, [0x01, 0x00, 0x01, 0x01]);
		} catch (err) {
			pretty.error(`error when writing led`, reader, err);
		}
	});

	reader.on("error", (err) => {
		pretty.error(`an error occurred`, reader, err);
	});

	reader.on("end", () => {
		pretty.info(`device removed`, reader);
	});
});
// const pcsclite = require("@pokesuw/pcslite");

// nfc.on("error", (err) => {
// 	pretty.error(`an error occurred`, err);
// });

// const connect = (reader) =>
// 	new Promise((resolve, reject) =>
// 		reader.connect(
// 			{ share_mode: reader.SCARD_SHARE_SHARED },
// 			(err, protocol) => (err ? reject(err) : resolve(protocol))
// 		)
// 	);
// const send = (reader, data, protocol) =>
// 	new Promise((resolve, reject) =>
// 		reader.transmit(Buffer.from(data), 40, protocol, (err, data) =>
// 			err ? reject(err) : resolve(data)
// 		)
// 	);

// // const pcsc = pcsclite();
// pcsc.on("reader", (reader) => {
// 	reader.on("status", async (status) => {
// 		// status changed to 'present'
// 		if (
// 			!(reader.state & reader.SCARD_STATE_PRESENT) &&
// 			status.state & reader.SCARD_STATE_PRESENT
// 		) {
// 			try {
// 				const protocol = await connect(reader);
// 				const result = await send(
// 					reader,
// 					[0xff, 0xca, 0x00, 0x00, 0x00],
// 					protocol
// 				); // read id
// 				await send(reader, [0xff, 0x00, 0x52, 0x00, 0x00], protocol); // mute speaker
// 				console.log(
// 					"card present",
// 					result.subarray(0, result.length - 2).toString("hex")
// 				);
// 			} catch (e) {
// 				console.error("cannot read data", reader.name, e);
// 			}
// 		}
// 	});
// });
