<?php

# Includes the autoloader for libraries installed with composer
require __DIR__ . '/vendor/autoload.php';

# Imports the Google Cloud client library
use Google\Cloud\Storage\StorageClient;

function uploadObject(){

	// path of json file
	$keyFilePath = './MyBucket.json';
	$bucketName = 'visionstoragebucket';
	$bucketUrl = 'https://storage.googleapis.com/visionstoragebucket/';

	# Instantiates a client
	$config = [
		'keyFilePath' => $keyFilePath
	];
	$storage = new StorageClient($config);

	$response = array();

	if (($_FILES['file'] == "none") OR (empty($_FILES['file']['name'])) ){
	  $response['error'] = "No file uploaded.";
	}
	else{
		$fileName = $_FILES["file"]["name"];

		try{
			$file = fopen($_FILES["file"]["tmp_name"], 'r');
			$bucket = $storage->bucket($bucketName);
			$object = $bucket->upload($file, [
				'name' => $fileName,
				'predefinedAcl' => 'publicRead'
			]);

			$response['success'] = "Object Uploaded";
			$response['imgPath'] = $bucketUrl.$fileName;
		}
		catch(Exception $e){
	    	$response['error'] = $e->getMessage();
		}
	}

	echo json_encode($response);
}

uploadObject();
?>
