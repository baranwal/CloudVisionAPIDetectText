$(document).ready(function() {
    // read image file and display to page.

    var Vision_Url = 'https://vision.googleapis.com/v1/images:annotate?key=' + Vision_API_Key;

    // function use to read image
    function readImage(input) {
        if (input.files && input.files[0]) {

            var reader = new FileReader();

            reader.readAsDataURL(input.files[0]);

            var fileType = input.files[0]['type'];

            reader.onload = function(e) {
                var imgSrc = e.target.result;
                var imgSrcWithoutBase64String = imgSrc.replace('data:' + fileType + ';base64,', '');
                storeFileToCloudStorage(input, imgSrcWithoutBase64String);
            }
        }
    }

    function storeFileToCloudStorage(input, imgSrcWithoutBase64String) {
        var formData = new FormData();
        formData.append('file', input.files[0]);

        $.ajax({
            url: "./uploadObject.php",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function(data) {
                if (data.hasOwnProperty('error')) {
                    Materialize.toast(data['error'], 2500);
                } else if (data.hasOwnProperty('imgPath')) {
                    callVisionApi(data['imgPath'], imgSrcWithoutBase64String);
                }
            },
            error: function(data) {
                console.log(data);
            }
        });
    }

    // used to call cloud vision api
    function callVisionApi(imgSrc, imgSrcWithoutBase64String) {
        // Strip out the file prefix when you convert to json.
        $('.image-upload-block').removeClass('image-upload-div');
        $('.image-upload-overlay-div').show();

        var request = {
            "requests": [{
                "image": {
                    "content": imgSrcWithoutBase64String
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
                if (data.hasOwnProperty('responses')) {
                    var responses = data['responses'][0];
                    if (responses.hasOwnProperty('error')) {
                        Materialize.toast(responses['error']['message'], 2500);
                    } else if (responses.hasOwnProperty('textAnnotations')) {
                        var ulElem = '<ul class="image-text-list">'
                        $.each(responses['textAnnotations'], function(key, val) {
                            var liElem = "<li><strong>" + (key + 1) + ". </strong>" + val['description'] + "</li>";
                            ulElem += liElem;
                        });
                        ulElem += '</ul>';
                        addImageCard(imgSrc, ulElem);
                    } else {
                        Materialize.toast('No results found', 2500);
                    }
                    $('.image-upload-overlay-div').hide();
                    $('.image-upload-block').addClass('image-upload-div');
                }
            },
            error: function(data) {
                if (data.hasOwnProperty('statusText')) {
                    Materialize.toast(data['statusText'], 2500);
                } else {
                    Materialize.toast('Some Error Occured!', 2500);
                }
                $('.image-upload-overlay-div').hide();
                $('.image-upload-block').addClass('image-upload-div');
            }
        });
    }

    // add a new image card when upload a image for handwritten text detection
    function addImageCard(src, textElem) {

        var $cardElement = $('<div class="col s6 m4 card small">' +
            '                    <div class="card-image  waves-effect waves-block waves-light">' +
            '                        <img class="activator" src="' + src + '">' +
            '                    </div>' +
            '                    <div class="card-content">' +
            '                        <span class="card-title activator grey-text text-darken-4">Click Icon to Show Text/s<i class="material-icons right">more_vert</i></span>' +
            '                    </div>' +
            '                    <div class="card-reveal">' +
            '                        <span class="card-title grey-text text-darken-4"><i class="material-icons right">close</i>Text/s</span>' +
            textElem +
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

    $('.view-all-btn').click(function() {
        $('.uploaded-image-list').html('');
        $('.uploaded-image-list').append($('.preloader-wrapper').clone());
        $.ajax({
            url: "./listObjects.php",
            type: "GET",
            dataType: "json",
            success: function(data) {
                if (data.hasOwnProperty('error')) {
                    Materialize.toast(data['error'], 2500);
                } else if (data.hasOwnProperty('objects')) {
                    data['objects'].forEach(function(item, index) {
                        addImageCard(item, "");
                    });
                }
                $('.uploaded-image-list').find('.preloader-wrapper').remove();
            },
            error: function(data) {
                console.log(data);
                $('.uploaded-image-list').find('.preloader-wrapper').remove();
            }
        })
    });

    // fetch text for previous stored image/s
    $('.main-div').on('click', '.card-image, .card-content', function() {
        var this1 = $(this);
        var src = this1.closest('.card').find('img.activator').attr('src');
        this1.closest('.card').find('.card-reveal').append($('.preloader-wrapper:eq(0)').clone());

        var request = {
            "requests": [{
                "image": {
                    "source": {
                        "imageUri": src
                    }
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
                if (data.hasOwnProperty('responses')) {
                    var responses = data['responses'][0];
                    if (responses.hasOwnProperty('error')) {
                        Materialize.toast(responses['error']['message'], 2500);
                    } else if (responses.hasOwnProperty('textAnnotations')) {
                        var ulElem = '<ul class="image-text-list">'
                        $.each(responses['textAnnotations'], function(key, val) {
                            var liElem = "<li><strong>" + (key + 1) + ". </strong>" + val['description'] + "</li>";
                            ulElem += liElem;
                        });
                        ulElem += '</ul>';
                        this1.closest('.card').find('.card-reveal').append(ulElem);
                    } else {
                        Materialize.toast('No results found', 2500);
                    }
                }
                this1.closest('.card').find('.card-reveal').find('.preloader-wrapper:eq(0)').remove();
            },
            error: function(data) {
                if (data.hasOwnProperty('statusText')) {
                    Materialize.toast(data['statusText'], 2500);
                } else {
                    Materialize.toast('Some Error Occured!', 2500);
                }
                this1.closest('.card').find('.card-reveal').find('.preloader-wrapper:eq(0)').remove();
            }
        });
    });

});