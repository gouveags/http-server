const fs = require("node:fs");
const net = require("node:net");
const server = require("../main");
const test = require("node:test");
const path = require("node:path");
const assert = require("node:assert");
const { exec } = require("node:child_process");
const { ensureFileExistsSync } = require("../utils");

global.it = test.it;
global.after = test.after;
global.before = test.before;
global.describe = test.describe;
global.afterEach = test.afterEach;
global.beforeEach = test.beforeEach;

const fsPromises = fs.promises;

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

describe("HTTP Server Tests", () => {
	afterEach(async () => {
		const dirDefPath = path.resolve(__dirname, "../tmp");

		if (fs.existsSync(dirDefPath)) {
			await fsPromises.rm(dirDefPath, { recursive: true }, (err) => {
				console.log(err);
				return;
			});
		}
	});

	it("GET / should respond with 200 OK", async () => {
		const rawRequest = `GET / HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 200 OK/);
	});

	it("GET /echo/:string should echo the string", async () => {
		const testString = "hello";
		const rawRequest = `GET /echo/${testString} HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
		const response = await sendRawHttpRequest(rawRequest);
		assert.match(
			response,
			new RegExp(`^HTTP/1.1 200 OK[\\s\\S]*${testString}$`),
		);
	});

	it("GET /user-agent should return User-Agent header", async () => {
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
		assert.match(
			response,
			new RegExp(`^HTTP/1.1 200 OK[\\s\\S]*${userAgent}$`),
		);
	});

	it("GET /not-found should return 404 Not Found", async () => {
		const rawRequest = `GET /not-found HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 404 Not Found/);
	});

	it("Invalid HTTP method should return 500 Internal Server Error", async () => {
		const rawRequest = `INVALID / HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;
		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 500 Internal Server Error/);
	});

	it("Invalid HTTP version should return 500 Internal Server Error", async () => {
		const rawRequest = `GET / HTTP/1.0\r\nHost: ${HOST}\r\n\r\n`;
		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 500 Internal Server Error/);
	});

	it("Malformed User-Agent header should return 400 Bad Request", async () => {
		const rawRequest = [
			"GET /user-agent HTTP/1.1",
			`Host: ${HOST}`,
			"Accept: */*",
			"UserAgent Missing-colon",
			"",
			"",
		].join("\r\n");

		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 400 Bad Request/);
	});

	it("Should return valid file's content", async () => {
		const fileName = "foo";
		const filepath = `../tmp/${fileName}`;
		const fileContent = "Hello World!";

		await ensureFileExistsSync(filepath, fileContent);

		const rawRequest = `GET /files/${fileName} HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;

		const response = await sendRawHttpRequest(rawRequest);
		assert.match(
			response,
			new RegExp(`^HTTP/1.1 200 OK[\\s\\S]*${fileContent}$`),
		);
	});

	it("Should return 404 Not Found for a file that doesn't exist", async () => {
		const fileName = "foo";
		const rawRequest = `GET /files/${fileName} HTTP/1.1\r\nHost: ${HOST}\r\n\r\n`;

		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 404 Not Found/);
	});

	it("GET / should respond with 201 Created", async () => {
		const body = "12345";
		const fileName = "file_123";
		const rawRequest = `POST /files/${fileName} HTTP/1.1\r\nHost: ${HOST}\r\n\r\n${body}`;

		const response = await sendRawHttpRequest(rawRequest);
		assert.match(response, /^HTTP\/1.1 201 Created/);
	});
});
