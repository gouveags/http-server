const net = require("node:net");
const routes = require("./routes.js");
const { HTTP_STATUS_CODES, HTTP_METHODS } = require("./constants");
const { HttpError, findMatchingRoute, createResponse } = require("./utils");

const server = net.createServer((socket) => {
	const middleware = (fn) => async (data) => {
		const { result, error } = await fn(data).catch((error) => ({ error }));

		const res = createResponse({
			responseBody: error
				? error.message
				: result?.message
					? result.message
					: result,
			responseStatus: error
				? error.status
				: result?.status
					? result.status
					: HTTP_STATUS_CODES.OK,
		});

		socket.write(res);

		socket.end();
	};

	socket.on(
		"data",
		middleware(async (data) => {
			const [reqInfo, ...headersAndBody] = data.toString().split("\r\n");
			const [method, path, version] = reqInfo.split(" ");

			const [headers, body] = headersAndBody.join("\r\n").split("\r\n\r\n");

			if (version !== "HTTP/1.1") {
				throw HttpError(
					"Invalid HTTP Version Request",
					HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
				);
			}

			if (!Object.values(HTTP_METHODS).includes(method)) {
				throw HttpError(
					"Invalid Method",
					HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
				);
			}

			const route = findMatchingRoute(routes, path, method);

			if (!route) {
				throw HttpError("", HTTP_STATUS_CODES.NOT_FOUND);
			}

			const paramType = route.path.split(":")[1];

			const pathParam = path.split("/")[2];
			const pathParamType = typeof pathParam;

			if (!!paramType && (pathParamType !== paramType || !route.handler)) {
				throw HttpError("Invalid Param", HTTP_STATUS_CODES.BAD_REQUEST);
			}

			return {
				result: route.handler
					? await route.handler({ query: pathParam, headers, body })
					: route.handler,
			};
		}),
	);

	socket.on("close", () => {
		socket.end();
	});
});

server.listen(4221, "localhost", () => {
	console.info("Server running at http://localhost:4221/");
});

module.exports = server;
