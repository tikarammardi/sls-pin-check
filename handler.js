'use strict';
const fs = require('fs');
const process = require('process');
module.exports.pinCodeCheck = async (event, context) => {
	try {
		console.log('event is ', event.queryStringParameters);

		const payload = event.queryStringParameters;
		if (!payload.product_id || !payload.pincode) {
			throw new Error('Missing Query Parameters');
		}
		console.log('payload', payload);
		const pincodes = loadPincodes();
		console.log('pincodes loaded', pincodes);
		let deliverablePincodes;

		pincodes.forEach((pincode) => {
			if (payload.product_id === pincode.product_id) {
				deliverablePincodes = pincode.pincodes.split(',');
			}
		});

		console.log('deliverablePincodes', deliverablePincodes);
		if (!deliverablePincodes) {
			throw new Error('No Pincodes available');
		}

		const isDeliverable = deliverablePincodes.includes(payload.pincode);
		console.log('isDeliverable', isDeliverable);

		return {
			statusCode: 200,
			body: JSON.stringify(
				{
					pincode: payload.pincode,
					isDeliverable
				},
				null,
				2
			)
		};
	} catch (error) {
		console.log('error in pincode check', error);
		return {
			statusCode: 500,
			body: JSON.stringify(
				{
					error: true,
					message: error.message
				},
				null,
				2
			)
		};
	}
};

module.exports.uploadCsv = async (event, context) => {
	try {
		console.log('event.body', JSON.parse(event.body));
		const payload = JSON.parse(event.body);
		savePincodes(payload.data);
		return {
			statusCode: 200,
			body: JSON.stringify(
				{
					message: 'Pincodes uploded successfully!'
				},
				null,
				2
			)
		};
	} catch (error) {
		console.error('error is', error);
		return {
			statusCode: 500,
			body: JSON.stringify(
				{
					error: true,
					message: error.message
				},
				null,
				2
			)
		};
	}
};

const savePincodes = (pincode) => {
	try {
		console.log('Starting directory: ', process.cwd());
		process.chdir('/tmp');
		console.log('New directory: ', process.cwd());

		const dataJSON = JSON.stringify(pincode);
		fs.writeFileSync(`${process.cwd()}/pincodes.json`, dataJSON);
	} catch (error) {
		console.log('error in saving pincodes', error);
	}
};

const loadPincodes = () => {
	try {
		console.log('Starting directory: ', process.cwd());
		process.chdir('/tmp');
		console.log('New directory: ', process.cwd());

		const dataBuffer = fs.readFileSync(`${process.cwd()}/pincodes.json`);
		const dataJSON = dataBuffer.toString();
		return JSON.parse(dataJSON);
	} catch (error) {
		console.log('error in loading pincodes', error);
		return [];
	}
};

function getFiles(dir) {
	return fs.readdirSync(dir).flatMap((item) => {
		const path = `${dir}/${item}`;
		if (fs.statSync(path).isDirectory()) {
			return getFiles(path);
		}

		return path;
	});
}
//GET - https://74hy6mycd5.execute-api.us-east-1.amazonaws.com/pincode-check
//POST - https://74hy6mycd5.execute-api.us-east-1.amazonaws.com/upload
