import * as THREE from "three";
	
  async function tiff_load(url) {
	return new Promise(function(resolve) {
		const worker = new Worker("tiffLoadWorker.js", {
			type: "module"
		});
		worker.onmessage = (e) => {
			resolve(e.data)
		}
		worker.postMessage(url);
	});
  }

export function longitudeDistAtLatitude(x)
{
	x = 55 // hardcoded because enabling accurate widths (i.e. removing this line) seems to actually mis-align the tiles
	// (tiles that are further north end up being slid further east)
	// note that currently this effect isnt even noticed because we only actually load one of the tiles.
	return 111.76 * Math.cos( Math.PI * x / 180)
}

export function latlongToCartesianXZ(latitude, longitude)
{
	console.log("lat:", latitude, "long:", longitude)
	console.log("we're using a width of", longitudeDistAtLatitude(latitude))
	return [- longitude * longitudeDistAtLatitude(latitude), latitude * 111.76]
	// ^ negative here since in my brain the positive x axis is going "left", and I want tiles with an increasingly negative longitude (i.e. tiles that are further west)
	// to go further to the "left"
	// note that latitude is fine because bigger latitude means further north, and this aligns with the cartesean coordinate system
	
}

  export function mountGeoTiff(url, scene) {
	// get tif and load it
	tiff_load(url).then(([tiff_image, data, BoundingBox]) => {
		const worker = new Worker("tiffMountWorker.js", {
			type: "module"
		})

		const latDiff = BoundingBox[3]-BoundingBox[1]
		const latitude = BoundingBox[1]+latDiff/2
		const latLength = latDiff * 111.76
		
		const longDiff = BoundingBox[2]-BoundingBox[0]
		const longitude = BoundingBox[0]+longDiff/2
		const longLength = longDiff * longitudeDistAtLatitude(latitude)
		
		console.log("BBox", BoundingBox)
		console.log("long:", longitude, "lat:", latitude)
		console.log("tile", longitude, latitude, "has lengths", longLength, latLength)
		
		const geometry = new THREE.PlaneGeometry(longLength, latLength, tiff_image.fileDirectory.ImageWidth - 1, tiff_image.fileDirectory.ImageLength - 1);
		const material = new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide
		});
		const plane = new THREE.Mesh(geometry, material)
		
		console.log("translatored")
		plane.rotation.x -= Math.PI/2
		plane.rotation.z += Math.PI


		worker.onmessage = (e) => {
			geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(e.data), 3))

			geometry.attributes.position.needsUpdate = true;
			geometry.computeVertexNormals(); // needed for meshnormalmaterial

			scene.add(plane)
			
			// place plane appropriately (remembering the plane origin is in it's centre, but given lat/long is the bottom left of the map section)
			const [newX, newZ] = latlongToCartesianXZ(latitude, longitude)
			
			plane.position.x = newX
			plane.position.z = newZ
			console.log("placed longitude", longitude, "at", plane.position.x)
			console.log("placed latitude", latitude, "at", plane.position.z)
		};
		
		console.log("about to post to otherWorker")
		worker.postMessage([data, geometry.attributes.position.array.buffer], [geometry.attributes.position.array.buffer])

	})
  }
  
  export async function getMountainData()
  {
	  return new Promise( (resolve, reject) => {
		  Papa.parse("http://localhost:3000/munromap_data.csv", {download: true, complete: (result) => {
		  // Papa.parse("http://localhost:3000/munromap_data_debug.csv", {download: true, complete: (result) => {
			  console.log("result:", result)
			  resolve(result.data)
		  }})
	  })
  }

  export function getRelevantTiffNames(data)
  {
	  let tiffs = new Set()
	  data.slice(1).forEach( (entry) => {
		const comment = entry[5]
		const [latitude,longitude,_] = comment.split(";")
		// console.log(`lat: ${latitude} long: ${longitude} entry:`, entry)
		tiffs.add(`ASTGTMV003_N${Math.floor(parseInt(latitude))}W${Math.ceil(-longitude).toString().padStart(3, "0")}_dem.tif`)
	  })
	  // console.log("tiffs", tiffs)
	  return Array.from(tiffs)
  }