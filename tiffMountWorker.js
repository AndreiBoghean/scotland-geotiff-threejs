import * as THREE from "./three.module.js";

onmessage = async (something) => {
	try {
		console.log("other meester worker got", something.data);
		const tiffData = something.data[0]
		const planeData = new Float32Array(something.data[1])

		for (let ii = 0; ii <= 3601; ii++)
			tiffData[0][ii] = 2000;

		// set plane vertices to that of the tif data
		for (let i = 0; i <= tiffData[0].length; i++)
			planeData[i * 3 + 2] = tiffData[0][i] / 1000; // /1000 to convert height from meters to km (most of our lat/long calcs produce km and this is easier)
		
		
		
		postMessage(planeData.buffer, [planeData.buffer]);
	} catch (e) {
		console.log("plsWorker issue:", e);
	}
};