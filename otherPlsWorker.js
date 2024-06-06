console.log("are we doing something?")

import * as THREE from "./three.module.js";

onmessage = async (something) => {
	console.log("we;re something?", something.data)
	
	/*
	const testArrBuff = something.data
	const testArr = new Float32Array(testArrBuff)
	testArr[2] = 9.99
	testArr[3] = 8.88
	testArr[4] = 5.55
	console.log("populated", testArr)
	postMessage(["we're done", testArrBuff], [testArrBuff]);
	//*/
	
	/*
	try {
		// const url = something.data;
		// const workerResult = `Result: ${url}`;
		// const data = [something.data]
		console.log("other meester worker got", something.data);
		const tiffData = something.data[0]
		const planeData = something.data[1]
		
		// set plane vertices to that of the tif data
		for (let i=0 ; i <= tiffData[0].length ; i++ )
			planeData[i*3+2] = tiffData[0][i];
		console.log("processed.");
		postMessage("we're done");
	}
	catch (e)
	{ console.log("plsWorker issue:", e); }
	//*/
	
	///*
	try {
		// const url = something.data;
		// const workerResult = `Result: ${url}`;
		// const data = [something.data]
		console.log("other meester worker got", something.data);
		const tiffData = something.data[0]
		const planeData = new Float32Array(something.data[1])
		
		// set plane vertices to that of the tif data
		for (let i=0 ; i <= tiffData[0].length ; i++ )
		 	planeData[i*3+2] = tiffData[0][i];
		console.log("processed.");
		postMessage(["we're done", planeData.buffer], [planeData.buffer]);
	}
	catch (e)
	{ console.log("plsWorker issue:", e); }
	//*/
};
