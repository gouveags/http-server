const { HTTP_METHODS } = require("./constants");
const { stringHandler, headerHandler } = require("./handlers");

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
		path: "/user-agent",
		handler: headerHandler,
		method: HTTP_METHODS.GET,
	},
];
