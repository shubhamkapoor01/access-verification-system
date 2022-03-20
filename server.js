require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const { pipeline } = require("serialport");
const SerialPort = require("serialport");
const axios = require('axios');
const cvtfjs = require('@microsoft/customvision-tfjs');

app.use(cors());

// app.use(express.static(__dirname + '/../build'));
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(__dirname + '/client/build'));

	app.get('*', (request, response) => {
		response.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// eslint-disable-next-line no-unused-vars

// const parsers = SerialPort.parsers;
// const parser = new parsers.Readline({
// 	delimiter: '\r\n'
// });
		
var allowed = 0;

app.get("/", (request, response) => {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(JSON.stringify(allowed));
})

app.post("/", (request, response) => {
	console.log("got post");
})

// const port = new SerialPort("/dev/cu.usbserial-A50285BI", {
// 	baudRate: 9600,
// 	dataBits: 8,
// 	parity: 'none',
// 	stopBits: 1,
// 	flowControl: false
// });

// port.pipe(parser);

// setTimeout(() => {
// 	port.write("1");
// }, 3000);

io.on('connection', (socket) => {
	socket.on('result', (data) => {
		if (data.status === 1) {
			console.log("writing HIGH...");
			allowed = 1;
			// port.write("1");
		} else {
			console.log("writing LOW...");
			allowed = 0;
			// port.write("0");
		}

		axios.get('http://192.168.180.161/1600x1200.jpg', {responseType: 'arraybuffer'})
			.then(response => {
				const buffer = Buffer.from(response.data, 'binary').toString('base64')
				console.log(buffer);
			})
			.catch(error => {
				console.log(error);
			})

		socket.emit('recieved', {data: data, port: Port});
	});
});

const Port = process.env.PORT || 3001;
server.listen(Port, () => console.log(`server is running on port ${Port}`));
