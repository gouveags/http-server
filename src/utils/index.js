const fs = require("node:fs");
const path = require("node:path");

const ensureFileExistsSync = async (filePath, defaultContent = "") => {
	const fileDefPath = path.resolve(__dirname, filePath);

	if (fs.existsSync(fileDefPath)) return;

	const dir = path.dirname(fileDefPath);
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(fileDefPath, defaultContent);
};

const HttpError = (message, status) => ({
	status,
	message,
	name: "HttpError",
});

const findMatchingRoute = (routes, receivedPath, method) => {
	const receivedSegments = receivedPath.split("/");

	return routes.find(({ path, method: routeMethod }) => {
		const routeSegments = path.split("/");

		if (routeSegments.length !== receivedSegments.length) return false;
		if (routeMethod !== method) return false;

		return routeSegments.every(
			(seg, i) => seg.startsWith(":") || seg === receivedSegments[i],
		);
	});
};

const byteSize = (str) => new Blob([str]).size ?? 0;

const createResponse = ({ responseStatus, responseBody = "" }) => {
	const responseHeader = `Content-Type: text/plain\r\nContent-Length: ${byteSize(responseBody)}\r\n`;

	return `HTTP/1.1 ${responseStatus}\r\n${responseHeader}\r\n${responseBody}`;
};

module.exports = {
	byteSize,
	HttpError,
	createResponse,
	findMatchingRoute,
	ensureFileExistsSync,
};
