$(document).ready(function() {
    // read image file and display to page.

    var Vision_Url = 'https://vision.googleapis.com/v1/images:annotate?key=' + Vision_API_Key;
    var apiCall = true;

    // function use to read image
    function readImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.readAsDataURL(input.files[0]);

            var fileType = input.files[0]['type'];

            reader.onload = function(e) {
                var imgSrc = e.target.result;
                callVisionApi(imgSrc, imgSrc.replace('data:'+fileType+';base64,', ''));
            }
        }
    }

    // used to call cloud vision api
    function callVisionApi(imgSrcBase64String, imgSrc) {
        // Strip out the file prefix when you convert to json.
        $('.image-upload-block').removeClass('image-upload-div');
        $('.image-upload-overlay-div').show();

        var request = {
            "requests": [{
                "image": {
                    "content": imgSrc
                },
                "features": [{
                    "type": "DOCUMENT_TEXT_DETECTION",
                    "maxResults": 200
                }]
            }]
        };

        $.ajax({
            url: Vision_Url,
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function(data) {
            	if(data.hasOwnProperty('responses')){
            		var responses = data['responses'][0];
            		if(responses.hasOwnProperty('error')){
            			Materialize.toast(responses['error']['message'], 2500);
            		}
            		else if(responses.hasOwnProperty('textAnnotations')){
            			var ulElem = '<ul>'
            			$.each(responses['textAnnotations'], function(key, val){
            				var liElem = "<li><strong>"+(key+1)+". </strong>"+val['description']+"</li>";
            				ulElem += liElem;
            			});
            			ulElem += '</ul>';
            			addImageCard(imgSrcBase64String, ulElem);
            		}
            		else{
            			Materialize.toast('No results found', 2500);
            		}
            		$('.image-upload-overlay-div').hide();
            		$('.image-upload-block').addClass('image-upload-div');
            	}
            },
            error: function(data) {
                Materialize.toast(data, 2500);
                $('.image-upload-overlay-div').hide();
                $('.image-upload-block').addClass('image-upload-div');
            }
        });
    }

    // add a new image card when upload a image for handwritten text detection
    function addImageCard(src, textElem) {

        var $cardElement = $('<div class="col s4 card small">' +
            '                    <div class="card-image  waves-effect waves-block waves-light">' +
            '                        <img class="activator" src="' + src + '">' +
            '                    </div>' +
            '                    <div class="card-content">'+
            '                        <span class="card-title activator grey-text text-darken-4">Click Icon to Show Text/s<i class="material-icons right">more_vert</i></span>'+
            '                    </div>'+
            '                    <div class="card-reveal">' +
            '                        <span class="card-title grey-text text-darken-4"><i class="material-icons right">close</i>Text/s</span>'+
            						 textElem+
            '                    </div>' +
            '                </div>');
        $('.uploaded-image-list').prepend($cardElement);
    }

    // event trigger when upload an image
    $('.image-upload').change(function() {
        readImage(this);
    });

    $('.main-div').on('click', '.image-upload-div', function() {
        // tigger image upload input
        $('.image-upload').click();
    });
});