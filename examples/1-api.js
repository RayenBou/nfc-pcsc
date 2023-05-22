"use strict";

// ce code permet l'envoi des donnée en api sur une route.
import { NFC } from "../src/index";
const nfc = new NFC();

import axios from "axios";
import https from "https";

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

nfc.on("reader", async (reader) => {
	reader.on("card", async (card) => {
		try {
			const response = await api.post("data", {
				data: card.uid,
			});
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	});
});
