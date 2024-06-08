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

function longitudeDistAtLatitude(x)
{
	return 111.320 * Math.cos(x * 3.14159 / 180)
}

  export function mountGeoTiff(url, scene) {
	// get tif and load it
	tiff_load(url).then(([tiff_image, data, BoundingBox]) => {
		const worker = new Worker("tiffMountWorker.js", {
			type: "module"
		})

		const longitude = BoundingBox[1]
		const latitude = -BoundingBox[0]
		console.log("long:", longitude, "lat:", latitude)
		// create suitable planeGeometry and add it to scene
		// scale longest side to be 10000m
		const scale = 10000 / Math.max(tiff_image.fileDirectory.ImageWidth, tiff_image.fileDirectory.ImageLength)
		// find out how wide a degree of longitude is at this particular longitude
		const ratio = 111.2 / longitudeDistAtLatitude(longitude)
		const geometry = new THREE.PlaneGeometry(scale * tiff_image.fileDirectory.ImageWidth, ratio * scale * tiff_image.fileDirectory.ImageLength, tiff_image.fileDirectory.ImageWidth - 1, tiff_image.fileDirectory.ImageLength - 1);
		const material = new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.rotation.x -= 1.571; // 90 degrees in radians


		worker.onmessage = (e) => {			
			geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(e.data), 3))

			geometry.attributes.position.needsUpdate = true;
			geometry.computeVertexNormals(); // needed for meshnormalmaterial

			scene.add(plane)
			plane.translateY(plane.geometry.parameters.width * (longitude - 55));
			plane.translateX(-plane.geometry.parameters.height * (latitude - 2));
		};
		console.log("about to post to otherWorker")
		worker.postMessage([data, geometry.attributes.position.array.buffer], [geometry.attributes.position.array.buffer])

	})
  }
  
  
  export async function getRelevantTiffNames()
  {
	  return new Promise( (resolve, reject) => {
		  Papa.parse("http://localhost:3000/munromap_data.csv", {download: true, complete: (result) => {
			  console.log("result:", result)
			  let tiffs = new Set()
			  result.data.slice(1).forEach( (entry) => {
				const comment = entry[5]
				const [latitude,longitude,_] = comment.split(";")
				// console.log(`lat: ${latitude} long: ${longitude} entry:`, entry)
				tiffs.add(`ASTGTMV003_N${Math.floor(parseInt(latitude))}W${Math.ceil(-longitude).toString().padStart(3, "0")}_dem.tif`)
			  })
			  // console.log("tiffs", tiffs)
			  resolve(Array.from(tiffs))
		  }})
	  })
  }