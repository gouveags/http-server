const net = require("node:net");
const test = require("node:test");
const assert = require("node:assert");
const server = require("../main");

const PORT = 4221;
const HOST = "localhost";

const sendRawHttpRequest = (rawRequest) => {
	return new Promise((resolve, reject) => {
		const client = new net.Socket();
		let response = "";

		client.connect(PORT, HOST, () => {
			client.write(rawRequest);
		});

		client.on("data", (data) => {
			response += data.toString();
		});

		client.on("end", () => {
			resolve(response);
		});

		client.on("error", reject);
	});
};

test("GET / should respond with 200 OK", async (t) => {
	const rawRequest = `GET / HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, /^HTTP\/1.1 200 OK/);
});

test("GET /echo/:string should echo the string", async (t) => {
	const testString = "hello";
	const rawRequest = `GET /echo/${testString} HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, new RegExp(`^HTTP/1.1 200 OK[\\s\\S]*${testString}$`));
});

test("GET /user-agent should return User-Agent header", async (t) => {
	const userAgent = "TestAgent";
	const rawRequest = [
		"GET /user-agent HTTP/1.1",
		`Host: ${HOST}`,
		"Accept: */*",
		`User-Agent: ${userAgent}`,
		"",
		"",
	].join("\r\n");

	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, new RegExp(`^HTTP/1.1 200 OK[\\s\\S]*${userAgent}$`));
});

test("GET /not-found should return 404 Not Found", async (t) => {
	const rawRequest = `GET /not-found HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, /^HTTP\/1.1 404 Not Found/);
});

test("Invalid HTTP method should return 500 Internal Server Error", async (t) => {
	const rawRequest = `INVALID / HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, /^HTTP\/1.1 500 Internal Server Error/);
});

test("Invalid HTTP version should return 500 Internal Server Error", async (t) => {
	const rawRequest = `GET / HTTP/1.0\r\nHost: ${HOST}\r\n\r\n`;
	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, /^HTTP\/1.1 500 Internal Server Error/);
});

test("Malformed User-Agent header should return 400 Bad Request", async (t) => {
	const rawRequest = [
		"GET /user-agent HTTP/1.1",
		`Host: ${HOST}`,
		"Accept: */*",
		"UserAgent Missing-colon", // Malformed header
		"",
		"",
	].join("\r\n");

	const response = await sendRawHttpRequest(rawRequest);
	assert.match(response, /^HTTP\/1.1 400 Bad Request/);
});
