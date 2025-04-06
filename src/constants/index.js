const HTTP_METHODS = Object.freeze({
	GET: "GET",
	PUT: "PUT",
	POST: "POST",
	HEAD: "HEAD",
	PATCH: "PATCH",
	TRACE: "TRACE",
	DELETE: "DELETE",
	OPTIONS: "OPTIONS",
	CONNECT: "CONNECT",
});

const HTTP_STATUS_CODES = Object.freeze({
	OK: "200 OK",
	CREATED: "201 Created",
	NOT_FOUND: "404 Not Found",
	BAD_REQUEST: "400 Bad Request",
	INTERNAL_SERVER_ERROR: "500 Internal Server Error",
});

module.exports = { HTTP_METHODS, HTTP_STATUS_CODES };
