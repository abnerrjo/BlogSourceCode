---
layout: post
title: "Taking photos from webcam using HTML5"
date: 2014-12-24 11:57:06 -0300
comments: true
categories: Tutorials, HTML5
---
On today's tutorial I'll teach how to take snapshots from webcam using only HTML5.

On the past, accessing user webcam was something onerous, sometimes falling back on Flash. Gladly, HTML5 brought an innovation to this area, thanks to the `<video>` tag.

->![]({{ root_url }}/images/posts/webcam-snapshot.png)<-

<!-- more -->

## Getting webcam access

On our demo we're going to create a tag to display the live stream of webcam, a tag to display a webcam snapshot, and two buttons: One to take a snapshot and another to save (download) the photo. 

``` HTML
<video id="video" width="640" height="480" autoplay></video> <!-- Live stream of webcam -->
<canvas id="canvas" width="640" height="480"></canvas> <!-- Snapshot of webcam -->
<button id="snap">Take snapshot</button> <!-- Button to take snapshot -->
<a id="save" download><button>Download photo</button></a> <!-- Button to download photo -->
```
However, that alone will not performe anything. We need a bit of Javascript to do the magic.

There are three ways to get access to the user webcam, depending on his browser: getUserMedia (for IE and alike), webkitGetUserMedia (for Chrome and Safari) and mozGetUserMedia (for Firefox), so we need to handle all them.  

``` Javascript
window.addEventListener("DOMContentLoaded", function() {
	var canvas = document.getElementById("canvas");
	var video = document.getElementById("video");
	if(navigator.getUserMedia) {
		navigator.getUserMedia({ "video": true }, function(stream) {
			video.src = stream;
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	} else if(navigator.webkitGetUserMedia) { 
		navigator.webkitGetUserMedia({ "video": true }, function(stream) {
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	}
	else if(navigator.mozGetUserMedia) { 
		navigator.mozGetUserMedia({ "video": true }, function(stream) {
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	}
});
```

First I'm creating a listener to when content is loaded. It's important, otherwise Javascript won't be able to find the tags! :-)

Inside the listener there are three "if", for compatibility reasons described above.

Each "if" is similar, just some changes here and there: We are setting "video.src" to webcam stream (remember: video variable is the `<video>` tag we set previously) and immediately playing it through the function "play()". We also need to pass a callback function in case of error (permission not given or webcam not found, for example).

## Taking a snapshot
Now we're going to implement the take snapshot functionality. First thing: Create a listener to when button "Take snapshot" is clicked:

``` Javascript
document.getElementById("snap").addEventListener("click", function() {
	
});
```

This listener must be inside "DOMContentLoaded" listener created previously.

Now, inside this new listener that we've created, let's draw a webcam frame inside the `<canvas>` tag that we created on first section of this tutorial. To be able to draw an image inside a canvas, we first need to get its "context" and through it call the function "drawImage(x, y, width, height)", where x, y representates the origin of source image (if you need to translate it...) and width, height the area you are going to take from source image (if you need to crop it...).

``` Javascript
document.getElementById("snap").addEventListener("click", function() {
	canvas.getContext("2d").drawImage(video, 0, 0, 640, 480);
});
```

Aaaaaand it's done! Pretty easy, huh? :-)

## Downloading a photo
Now we just need to implement the "Download photo" button. That is easy too. Inside the listener of "Take snapshot" button, add the following line:

``` Javascript
document.getElementById("save").href = canvas.toDataURL("image/jpeg");
```

"toDataURL()" convert canvas image to a URL. We can also define the image extension. 

It's simple like that! :)

Now the complete code:

``` HTML
<video id="video" width="640" height="480" autoplay></video> <!-- Live stream of webcam -->
<canvas id="canvas" width="640" height="480"></canvas> <!-- Snapshot of webcam -->
<button id="snap">Take snapshot</button> <!-- Button to take snapshot -->
<a id="save" download><button>Download photo</button></a> <!-- Button to download photo -->
<script type="text/javascript">
window.addEventListener("DOMContentLoaded", function() {
	var canvas = document.getElementById("canvas");
	var video = document.getElementById("video");
	if(navigator.getUserMedia) {
		navigator.getUserMedia({ "video": true }, function(stream) {
			video.src = stream;
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	} else if(navigator.webkitGetUserMedia) { 
		navigator.webkitGetUserMedia({ "video": true }, function(stream) {
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	}
	else if(navigator.mozGetUserMedia) { 
		navigator.mozGetUserMedia({ "video": true }, function(stream) {
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, function(error) {
			console.log("Video capture error: ", error.code); 
		});
	}
	document.getElementById("snap").addEventListener("click", function() {
		canvas.getContext("2d").drawImage(video, 0, 0, 640, 480);
		document.getElementById("save").href = canvas.toDataURL("image/jpeg");
	});
});
</script>
```

->![]({{ root_url }}/images/posts/webcam-snapshot.png)<-

I hope you've enjoyed and Merry Christmas! :-)
