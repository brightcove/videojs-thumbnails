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
    var div, settings, img, player, progressControl, duration;
    settings = extend({}, defaults, options);
    player = this;

    // create the thumbnail
    div = document.createElement('div');
    div.className = 'vjs-thumbnail-holder';
    img = document.createElement('img');
    div.appendChild(img);
    img.src = settings['0'].src;
    img.className = 'vjs-thumbnail';
    extend(img.style, settings['0'].style);

    // center the thumbnail over the cursor if an offset wasn't provided
    if (!img.style.left && !img.style.right) {
      img.onload = function() {
        img.style.left = -(img.naturalWidth / 2) + 'px';
      }
    };

    // keep track of the duration to calculate correct thumbnail to display
    duration = player.duration();
    player.on('durationchange', function(event) {
      duration = player.duration();
    });

    // add the thumbnail to the player
    progressControl = player.controlBar.progressControl;
    progressControl.el().appendChild(div);

    // update the thumbnail while hovering
    progressControl.el().addEventListener('mousemove', function(event) {
      var mouseTime, time, active, left, setting;
      active = 0;

      // find the page offset of the mouse
      left = event.pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
      // subtract the page offset of the progress control
      left -= progressControl.el().getBoundingClientRect().left + window.pageXOffset;
      div.style.left = left + 'px';

      // apply updated styles to the thumbnail if necessary
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
    }, false);
    
    // move the placeholder out of the way when not hovering
    progressControl.el().addEventListener('mouseout', function(event) {
      div.style.left = '-1000px';
    }, false);
  });
})();
