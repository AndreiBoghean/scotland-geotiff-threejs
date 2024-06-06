import './geotiff.js';

onmessage = async (something) => {
	try {
  const url = something.data;
  const workerResult = `Result: ${url}`;
  console.log("meester worker got", workerResult);
  
  const tiff = await GeoTIFF.fromUrl(url);
  const tiff_image = await tiff.getImage();
  const data = await tiff_image.readRasters();
  const boundingBox = tiff_image.getBoundingBox();
   postMessage( [tiff_image, data, boundingBox] );
	}
	catch (e)
	{ console.log("worker def:", e) }
};
