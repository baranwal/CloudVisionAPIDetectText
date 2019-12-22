<?php

# Includes the autoloader for libraries installed with composer
require __DIR__ . '/vendor/autoload.php';

# Imports the Google Cloud client library
use Google\Cloud\Storage\StorageClient;

function listObjects(){
	$response = array();

	// path of json file
	$keyFilePath = './MyBucket.json';
	$bucketName = 'visionstoragebucket';
	$bucketUrl = 'https://storage.googleapis.com/visionstoragebucket/';

	# Instantiates a client
	$config = [
		'keyFilePath' => $keyFilePath
	];
	try{
		$storage = new StorageClient($config);
		$bucket = $storage->bucket($bucketName);
		$response['objects'] = array();
		foreach ($bucket->objects() as $object) {
			$objectUrl = $bucketUrl.$object->name();
		    $response['objects'][] = $objectUrl;
		}
	}
	catch(Exception $e){
		$response['error'] = $e->getMessage();
	}
	echo json_encode($response);
}

listObjects();

?>
