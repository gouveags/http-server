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

module.exports = { createResponse, findMatchingRoute, HttpError, byteSize };
