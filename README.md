Video.js Thumbnails
===================
A plugin that allows you to configure thumbnails to display when the user is hovering over the progress bar or dragging it to seek.

Using the Plugin
----------------
The plugin automatically registers itself when you include video.thumbnails.js in your page:

```html
<script src='videojs.thumbnails.js'></script>
```

You probably want to include the default stylesheet, too. It handles showing and hiding thumbnails while hovering over the progress bar and a quick animation during the transition:

```html
<link href="videojs.thumbnails.css" rel="stylesheet">
```

To activate the plugin, add it to your videojs settings object:

```html
<script>
// initialize video.js
var video = videojs('video',{plugins:{thumbnails:{}}});
</script>
```

The thumbnails need to be added with a VTT file. For this file, the [specification used by JW Player](http://support.jwplayer.com/customer/portal/articles/1407439-adding-preview-thumbnails) applies.
The VTT file is added as a metadata track to the video object, for example:

```html
<track kind="metadata" src="oceans.vtt"></track>
```

Full object example:

```html
<video id='video'
       class='video-js vjs-default-skin'
       width='640'
       height='264'
       poster='http://video-js.zencoder.com/oceans-clip.jpg'
       controls>
  <source src='http://video-js.zencoder.com/oceans-clip.mp4' type='video/mp4' />
  <track kind="metadata" src="oceans.vtt"></track>
</video>
```

If your thumbnails do not include specified width and height in the VTT file (via the Media Fragment hash), you have to specify the default width and height in pixels the plugin settings:

```html
<script>
// initialize video.js
var video = videojs('video',{plugins:{thumbnails:{width:120,height:90}}});
</script>
```

You can add an optional basePath if you want to use images hosted on another domain
```html
<script>
// initialize video.js
var video = videojs('video',{plugins:{thumbnails:{width:120,height:90, basePath : "//external.url/basepath/"}}});
</script>
```
