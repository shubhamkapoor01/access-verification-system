require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const Path = require("path");
const Fs = require("fs");
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
		response.sendFile(Path.resolve(__dirname, 'client', 'build', 'index.html'));
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

app.get("/hasmask/0", (request, response) => {
// 	socket.emit("no mask");
	console.log("recieved no mask from middleman");
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("recieved no mask from middleman");
})

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

			axios.get('https://middleman-broker-server.herokuapp.com/isallowed/1')
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
// 					console.log(error);
				})
			// port.write("1");
			
		} else if (data.status === 2) {
			console.log("writing LOW...");

			axios.get('https://middleman-broker-server.herokuapp.com/isallowed/0')
				.then((response) => {
					console.log(response.data);
				})
				.catch((error) => {
// 					console.log(error);
				})
			// port.write("0");
		}

		// const path = Path.resolve(__dirname, 'files', 'image.jpg');
		// const pathModel = Path.resolve('files', 'image.jpg');

		// axios.get('http://192.168.180.161/1600x1200.jpg', {responseType: 'stream'})
		// 	.then(response => {
		// 		response.data.pipe(Fs.createWriteStream(path));

		// 		return new Promise((resolve, reject) => {
		// 			response.data.on('end', () => {
		// 				console.log('image downloaded successfully');

		// 				let model = new cvtfjs.ObjectDetectionModel();
		// 				model.loadModelAsync('model.json')
		// 					.then(() => {
		// 						const image = Fs.createReadStream(pathModel);
		// 						console.log(image);
		// 						model.executeAsync(image)
		// 							.then((result) => {
		// 								console.log(result);
		// 							})
		// 					});

		// 				resolve();
		// 			})
		// 		})

		// 		response.data.on('error', (error) => {
		// 			reject(error);
		// 		})
		// 		// console.log(response);
		// 		// const buffer = Buffer.from(response.data, 'binary').toString('base64')
		// 		// console.log(buffer);
		// 	})
		// 	.catch(error => {
		// 		console.log(error);
		// 	})

		socket.emit('recieved', {data: data, port: Port});
	});
});

const Port = process.env.PORT || 3001;
server.listen(Port, () => console.log(`server is running on port ${Port}`));
