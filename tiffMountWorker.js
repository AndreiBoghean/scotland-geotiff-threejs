import * as THREE from "./three.module.js";

onmessage = async (something) => {
	try {
		console.log("other meester worker got", something.data);
		const tiffData = something.data[0]
		const planeData = new Float32Array(something.data[1])

		// some code for amplyfing the first few entries in the mountain data, so it's obvious what the top left corner is of the tiles.
		//for (let ii = 0; ii <= 3601; ii++)
		//	tiffData[0][ii] = 2000;

		// for (let ii = 0; ii <= 3601/36; ii++)
		// 	tiffData[0][ii] = 4000;

		// set plane vertices to that of the tif data
		for (let i = 0; i < tiffData[0].length ; i++)
		{
			planeData[i * 3 + 2] = tiffData[0][i] / 100;
			// ^ /1000 to convert height from meters to km (most of our lat/long calcs produce km and this is easier)
			// but also * 10 to emphasise heights because the world isnt as tall as it is vast and true heights look boring.
			continue;
			
			// old code for literally rotating the mountain data. not sure what how or why it was needed, but it remains here for now.
			let current_row = Math.floor(i / 3601)
			let current_column = i % 3601
			
			let new_i = current_column * 3601 + current_row
			
			planeData[i * 3 + 2] = - tiffData[0][tiffData[0].length-1-new_i] / 1000; // /1000 to convert height from meters to km (most of our lat/long calcs produce km and this is easier)
		}
		
		postMessage(planeData.buffer, [planeData.buffer]);
	} catch (e) {
		console.log("plsWorker issue:", e);
	}
};