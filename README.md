# CloudVisionAPIDetectText
Detect handwrittetn text from an image

For running this webapp do the following steps:-

  1. Clone this repo to your local system.
  2. Install Apache server in your local system and setup a virtual host for this directory (For installing apache server and seeting up a new virtual host: https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-ubuntu-18-04-quickstart)
  3. Install composer using command if not already install in your system: **sudo apt install composer**
  4. After successfully install composer run command **composer require google/cloud-storage** to install Google Cloud Storage library.

For Setting Credentials:-

  1. Edit js/key.js file and insert your Google Cloud Vision API Key over there.
  2. Store your key.json(which you are getting when you creating the bucket on Google Cloud Storage) file in the same directory.
  3. Here I named my key.json file to MyBucket.json file.
  4. Just start your Apache server and navigate to index.html file in your browser.
  5. Thats All! Now you're ready to upload image to Google Cloud Storage and detect text in an image file using Google Cloud Vision API.
