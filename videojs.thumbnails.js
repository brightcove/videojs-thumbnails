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
    var settings, img, progressControl;
    settings = extend(defaults, options);

    // create the thumbnail image
    img = document.createElement('img');
    img.src = settings['0'].src;
    img.setAttribute('style', settings['0'].style || '');
    img.setAttribute('class', 'vjs-thumbnail');

    // add the thumbnail to the player
    progressControl = this.controlBar.progressControl.el();
    progressControl.appendChild(img);
  });
})();