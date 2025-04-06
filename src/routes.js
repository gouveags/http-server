const { HTTP_METHODS } = require("./constants");
const {
	stringHandler,
	headerHandler,
	fileReaderHandler,
	fileWriterHandler,
} = require("./functions");

module.exports = [
	{
		method: HTTP_METHODS.GET,
		path: "/",
	},
	{
		path: "/echo/:string",
		handler: stringHandler,
		method: HTTP_METHODS.GET,
	},
	{
		path: "/files/:string",
		method: HTTP_METHODS.GET,
		handler: fileReaderHandler,
	},
	{
		path: "/files/:string",
		method: HTTP_METHODS.POST,
		handler: fileWriterHandler,
	},
	{
		path: "/user-agent",
		handler: headerHandler,
		method: HTTP_METHODS.GET,
	},
];
