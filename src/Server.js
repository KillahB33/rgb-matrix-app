const fs = require('fs');
const multer = require("multer");
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const server = require('http').Server(app);
const port = 3030;
var bodyParser = require('body-parser');
const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()
const sharp = require('sharp');

require('dotenv').config();

const storage = multer.diskStorage({
   destination: function (req, file, callback) {
	   callback(null, './public/images/temp/');
   },
   fileName: function (req, file, callback) {
	   callback(null, file.originalname);
   },
   limit: {
		fieldSize: 25 * 1024 * 1024
	}
});

var upload = multer({ storage: storage });

function uploadImage(outputName) {
	ssh
	.connect({
		host: process.env.SSH_host,
		username: process.env.SSH_user,
		password: process.env.SSH_pass
	})
	.then(() => {
		ssh.putFile('/app/public/images/'+outputName, process.env.SSH_pipath+'/images/'+outputName).then(function() {
			console.log("Upload successful");
		  }, function(error) {
			console.log("Something's wrong")
			console.log(error)
		  });
	});
}

app.post('/upload', upload.single('myImage'), async (req, res) => {
	   	if (!req.file) {
			console.log("No file received");
			return res.send({
				success: false
			});
	   	} else {
			var fileName = req.file.filename;
			var outputName = req.file.originalname;
			var parseBody = JSON.parse(JSON.stringify(req.body));
			var configProps = JSON.parse(parseBody.cropConfig);
			console.log(req.file);
			console.log(configProps);
			console.log("X is :"+ configProps.x);
			cropHeight = parseInt(configProps.height);
			cropWidth = cropHeight*2;
			if (cropWidth > 400) {
				sharp('./public/images/temp/' + fileName, { animated: true })
					.extract({ width: cropWidth, height: cropHeight, left: configProps.x, top: configProps.y })
					.toFile('./public/images/temp/cropped/' + fileName)
					.then(() => {
						sharp('./public/images/temp/cropped/' + fileName, { animated: true })
							.resize(400, 200)
							.toFile('./public/images/' + outputName)
							.then(() => {		
								console.log("File cropped and resized");
								uploadImage(outputName);
							})
							.catch(err => {
								console.log(err);
							});
					})
			} else {
				sharp('./public/images/temp/' + fileName, { animated: true })
				.extract({ width: cropWidth, height: cropHeight, left: configProps.x, top: configProps.y })
				.toFile('./public/images/' + outputName)
				.then(() => {
					console.log("File cropped");
					uploadImage(outputName);
				})
			}

		   res.status(200).send(fileName);
	   }
});

var setImage = null
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.post('/setImage', async (req, res) => {
	var reqBody = req.body;
	if (!reqBody.image) {
		console.log("No fileName received");
		return res.send({
			success: false
		});
	} else {
		console.log(reqBody.image);
		var fileName = req.body.image;
		res.send('Set Image to: '+ fileName);
		var stopImage = 'pidof led-image-viewer | xargs sudo kill -9 |';
		setImage = 'sudo '+process.env.SSH_pipath+'/utils/led-image-viewer  --led-cols=64 --led-rows=64 --led-chain=2 --led-gpio-mapping=adafruit-hat-pwm --led-brightness=60 '+process.env.SSH_pipath+'/'+fileName;
		ssh
		.connect({
			host: process.env.SSH_host,
			username: process.env.SSH_user,
			password: process.env.SSH_pass
		})
		.then(() => {
			ssh.execCommand(stopImage+setImage).then((result) => {
				console.log('STDOUT: ' + result.stdout);
				console.log('STDERR: ' + result.stderr);
			}, function(error) {
				console.log("Something's wrong")
				console.log(error)
			});
		});
	}
});

app.post('/endStream', async (req, res) => {
	var reqBody = req.body;
	if (!reqBody.image) {
		console.log("No fileName received");
		return res.send({
			success: false
		});
	} else {
		res.send('Stream Ended');
		var stopImage = 'pidof led-image-viewer | xargs sudo kill -9';
		ssh
		.connect({
			host: process.env.SSH_host,
			username: process.env.SSH_user,
			password: process.env.SSH_pass
		})
		.then(() => {
			ssh.execCommand(stopImage).then((result) => {
				console.log('STDOUT: ' + result.stdout);
				console.log('STDERR: ' + result.stderr);
			});
		});
	}
});

var deleteImage = null
app.post('/deleteImage', async (req, res) => {
	var reqBody = req.body;
	if (!reqBody.image) {
		console.log("No fileName received");
		return res.send({
			success: false
		});
	} else {
		console.log(reqBody.image);
		var fileName = req.body.image;
		fs.unlink('./public/'+fileName, (err) => {
			if (err) {
				throw err;
			}
			console.log("File is deleted.");
		});
		res.send('Deleted following image: '+ fileName);
		deleteImage = 'rm '+process.env.SSH_pipath+'/'+fileName;
		ssh
		.connect({
			host: process.env.SSH_host,
			username: process.env.SSH_user,
			password: process.env.SSH_pass
		})
		.then(() => {
			ssh.execCommand(deleteImage).then((result) => {
				console.log('STDOUT: ' + result.stdout);
				console.log('STDERR: ' + result.stderr);
			});
		});
	}
});

//pre-flight requests
app.options('*', function(req, res) {
	res.sendStatus(200);
});

server.listen(port, (err) => {
	if (err) {
		throw err;
	}
	/* eslint-disable no-console */
	console.log('Node Endpoints working :)');
});

module.exports = server;
