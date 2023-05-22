module.exports = {
	encryptString,
	decryptString,
	encryptNumber,
	decryptNumber,
	encryptNumber1,
	decryptNumber1,
};

// function encryptString(str, key) {
// 	let result = "";
// 	for (let i = 0; i < str.length; i++) {
// 		const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
// 		if (
// 			(charCode >= 48 && charCode <= 57) ||
// 			(charCode >= 65 && charCode <= 90) ||
// 			(charCode >= 97 && charCode <= 122)
// 		) {
// 			// console.log("charCode:", charCode);
// 			result += charCode.toString() + " ";
// 		}
// 	}
// 	return result.trim();
// }

// function decryptString(str, key) {
// 	let result = "";
// 	const codes = str.split(" ");
// 	for (let i = 0; i < codes.length; i++) {
// 		const charCode = parseInt(codes[i]);
// 		result += String.fromCharCode(
// 			charCode ^ key.charCodeAt(i % key.length)
// 		);
// 	}
// 	return result;
// }
// Fonction de cryptage de la couleur

function encryptString(str, key) {
	let result = "";
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i);
		if (charCode >= 97 && charCode <= 122) {
			// si la lettre est en minuscule
			result += String.fromCharCode(((charCode - 97 + key) % 26) + 97); // ajout de la lettre cryptée en minuscule
		} else if (charCode >= 65 && charCode <= 90) {
			// si la lettre est en majuscule
			result += String.fromCharCode(((charCode - 65 + key) % 26) + 65); // ajout de la lettre cryptée en majuscule
		} else {
			result += str.charAt(i); // ajout du caractère non alphabétique inchangé
		}
	}
	return result;
}

// Fonction de décryptage
function decryptString(str, key) {
	return encryptString(str, 26 - key); // 26 étant le nombre de lettres dans l'alphabet
}

// function encryptString(message, cle) {
// 	let messageCrypte = "";
// 	for (let i = 0; i < message.length; i++) {
// 		let code = message.charCodeAt(i) + cle;
// 		if (code > 122) {
// 			code = 97 + (code - 123);
// 		} else if (code > 90 && code < 97) {
// 			code = 48 + (code - 91);
// 		} else if (code > 57 && code < 65) {
// 			code = 65 + (code - 58);
// 		}
// 		messageCrypte += String.fromCharCode(code);
// 	}
// 	return messageCrypte;
// }

// // Décryptage d'une chaîne de caractères
// function decryptString(messageCrypte, cle) {
// 	let messageDecrypte = "";
// 	for (let i = 0; i < messageCrypte.length; i++) {
// 		let code = messageCrypte.charCodeAt(i) - cle;
// 		if (code < 48) {
// 			code = 91 - (48 - code);
// 		} else if (code < 65 && code > 57) {
// 			code = 123 - (65 - code);
// 		} else if (code < 97 && code > 90) {
// 			code = 58 - (97 - code);
// 		}
// 		messageDecrypte += String.fromCharCode(code);
// 	}
// 	return messageDecrypte;
// }

// Cryptage d'un nombre
// Cryptage d'un nombre
function encryptNumber(number, key) {
	const digits = number.toString().split("");
	let result = "";
	digits.forEach((digit) => {
		const encrypted = (parseInt(digit) + key) % 10;
		result += encrypted;
	});
	return result;
}

// Décryptage d'un nombre
function decryptNumber(number, key) {
	const digits = number.toString().split("");
	let result = "";
	digits.forEach((digit) => {
		const decrypted = (parseInt(digit) - key + 10) % 10;
		result += decrypted;
	});
	return result;
}

///////////////// cryptage du tagId
function encryptNumber1(num, key) {
	const digits = num.toString().split(""); // Convertir le nombre en tableau de chiffres
	let result = "";
	for (let i = 0; i < digits.length; i++) {
		const encryptedDigit = (parseInt(digits[i]) + key) % 10; // Cryptage du chiffre en utilisant la clé fournie
		result += encryptedDigit.toString(); // Ajout du chiffre crypté au résultat
	}
	return result;
}

function decryptNumber1(num, key) {
	const digits = num.toString().split(""); // Convertir le nombre en tableau de chiffres
	let result = "";
	for (let i = 0; i < digits.length; i++) {
		const decryptedDigit = (parseInt(digits[i]) + 10 - key) % 10; // Décryptage du chiffre en utilisant la clé fournie
		result += decryptedDigit.toString(); // Ajout du chiffre décrypté au résultat
	}
	return result;
}
