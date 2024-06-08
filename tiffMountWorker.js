import * as THREE from "./three.module.js";

onmessage = async (something) => {
	try {
		console.log("other meester worker got", something.data);
		const tiffData = something.data[0]
		const planeData = new Float32Array(something.data[1])

		// set plane vertices to that of the tif data
		for (let i = 0; i <= tiffData[0].length; i++)
			planeData[i * 3 + 2] = tiffData[0][i];
		
		postMessage(planeData.buffer, [planeData.buffer]);
	} catch (e) {
		console.log("plsWorker issue:", e);
	}
};