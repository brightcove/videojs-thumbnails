(function() {
  var defaults = {
      0: {
        src: 'example-thumbnail.png'
      }
    },
    extend = function() {
      var args, target, i, object, property;
      args = Array.prototype.slice.call(arguments);
      target = args.shift() || {};
      for (i in args) {
        object = args[i];
        for (property in object) {
          if (object.hasOwnProperty(property)) {
            if (typeof object[property] === 'object') {
              target[property] = extend(target[property], object[property]);
            } else {
              target[property] = object[property];
            }
          }
        }
      }
      return target;
    };

  /**
   * register the thubmnails plugin
   */
  videojs.plugin('thumbnails', function(options) {
    var settings, img, player, progressControl, duration, updateThumbnail;
    settings = extend(defaults, options);
    player = this;

    // create the thumbnail image
    img = document.createElement('img');
    img.src = settings['0'].src;
    img.setAttribute('style', settings['0'].style || '');
    img.setAttribute('class', 'vjs-thumbnail');

    // keep track of the duration to calculate correct thumbnail to display
    duration = player.duration();
    player.on('durationchange', function(event) {
      duration = player.duration();
    });

    // add the thumbnail to the player
    progressControl = player.controlBar.progressControl;
    progressControl.el().appendChild(img);

    // listener to adjust the thumbnail position while hovering
    updateThumbnail = function(event) {
      img.style.left = event.offsetX + 'px';
    };
    // display the thumbnail and listen for mouse movements
    progressControl.on('mouseover', function(event) {
      if (event.target === progressControl.el()) {
        img.className += ' vjs-thumbnail-hover';
        img.style.left = event.offsetX + 'px';
        progressControl.el().addEventListener('mousemove', updateThumbnail, false);
      }
    });
    // hide the thumbnail and stop listening for mouse movements
    progressControl.on('mouseout', function(event) {
      var toElement = event.relatedTarget || event.toElement;
      if (toElement !== progressControl.seekBar.el()) {
        img.className = img.className.replace(/(?:^|\s)vjs-thumbnail-hover(?!\S)/g , '');
        progressControl.el().removeEventListener('mousemove', updateThumbnail);
      }
    });
    
  });
})();