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
    var div, settings, img, player, progressControl, duration, updateThumbnail;
    settings = extend(defaults, options);
    player = this;

    // create the thumbnail image
    div = document.createElement('div');
    div.className = 'vjs-thumbnail-holder';
    img = document.createElement('img');
    div.appendChild(img);
    img.src = settings['0'].src;
    extend(img.style, settings['0'].style);
    img.className = 'vjs-thumbnail';

    // keep track of the duration to calculate correct thumbnail to display
    duration = 50; // player.duration();
    player.on('durationchange', function(event) {
      // duration = player.duration();
    });

    // add the thumbnail to the player
    progressControl = player.controlBar.progressControl;
    progressControl.el().appendChild(div);

    // listener to update the thumbnail while hovering
    updateThumbnail = function(event) {
      var mouseTime, time, active, left, setting;
      active = 0;
      // move the thumbnail
      left = event.pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
      div.style.left = left + 'px';

      // update the thumbnail if necessary
      mouseTime = Math.floor(event.offsetX / progressControl.width() * duration);
      for (time in settings) {
        if (mouseTime > time) {
          active = Math.max(active, time);
        }
      }
      setting = settings[active];
      if (setting.src && img.src != setting.src) {
        img.src = setting.src;
      }
      if (setting.style && img.style != setting.style) {
        extend(img.style, setting.style);
      }
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