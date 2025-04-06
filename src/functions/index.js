const fs = require("node:fs");
const path = require("node:path");
const { HTTP_STATUS_CODES } = require("../constants");
const { HttpError, ensureFileExistsSync } = require("../utils");

const BASE_DIR = path.resolve(__dirname, "../tmp");

const stringHandler = ({ query }) => query;

const fileReaderHandler = ({ query, body }) => {
	const requestedPath = path.resolve(BASE_DIR, query);

	if (!requestedPath.startsWith(BASE_DIR)) {
		throw HttpError("Error", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
	}

	try {
		const fileContent = fs.readFileSync(requestedPath, "utf8");
		return fileContent;
	} catch (err) {
		throw HttpError("File Not Found", HTTP_STATUS_CODES.NOT_FOUND);
	}
};

const fileWriterHandler = async ({ query, body }) => {
	const requestedPath = path.resolve(BASE_DIR, query);

	if (!requestedPath.startsWith(BASE_DIR)) {
		throw HttpError("Error", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
	}

	try {
		const fileContent = await ensureFileExistsSync(requestedPath, body);
		return { status: HTTP_STATUS_CODES.CREATED };
	} catch (err) {
		throw HttpError("File Not Found", HTTP_STATUS_CODES.NOT_FOUND);
	}
};

const headerHandler = ({ headers }) => {
	const [host, accept, userAgent] = headers.split("\r\n");
	const [key, value] = userAgent.split(": ");

	if (key === "User-Agent") {
		return value;
	}

	throw HttpError("Header Malformed", HTTP_STATUS_CODES.BAD_REQUEST);
};

module.exports = {
	stringHandler,
	headerHandler,
	fileReaderHandler,
	fileWriterHandler,
};
