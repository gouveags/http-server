const { HttpError } = require("../utils");
const { HTTP_STATUS_CODES } = require("../constants");

const stringHandler = ({ query }) => query;

const headerHandler = ({ headers }) => {
	const [host, accept, userAgent] = headers.split("\r\n");
	const [key, value] = userAgent.split(": ");

	if (key === "User-Agent") {
		return value;
	}

	throw HttpError("Header Malformed", HTTP_STATUS_CODES.BAD_REQUEST);
};

module.exports = { stringHandler, headerHandler };
