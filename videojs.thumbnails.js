(function() {
  var defaults = {
      width:0, height:0, basePath : ""
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
    },
    getComputedStyle = function(el, pseudo) {
      return function(prop) {
        if (window.getComputedStyle) {
          return window.getComputedStyle(el, pseudo)[prop];
        } else {
          return el.currentStyle[prop];
        }
      };
    },
    offsetParent = function(el) {
      if (el.nodeName !== 'HTML' && getComputedStyle(el)('position') === 'static') {
        return offsetParent(el.offsetParent);
      }
      return el;
    },
    getScrollOffset = function() {
      if (window.pageXOffset) {
        return {
          x: window.pageXOffset,
          y: window.pageYOffset
        };
      }
      return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop
      };
    },
    parseImageLink = function(imglocation) {
      var lsrc, clip, hashindex, hashstring;
      hashindex = imglocation.indexOf('#');
      if (hashindex === -1) {
        return {src:imglocation,w:0,h:0,x:0,y:0};
      } 
      lsrc = imglocation.substring(0,hashindex);
      hashstring = imglocation.substring(hashindex+1);
      if (hashstring.substring(0,5) !== 'xywh=') {
        return {src:defaults.basePath + lsrc,w:0,h:0,x:0,y:0};
      } 
      var data = hashstring.substring(5).split(',');
      return {src:defaults.basePath + lsrc,w:parseInt(data[2]),h:parseInt(data[3]),x:parseInt(data[0]),y:parseInt(data[1])};
    };

  /**
   * register the thubmnails plugin
   */
  videojs.plugin('thumbnails', function(options) {
    var div, settings, img, player, progressControl, duration, moveListener, moveCancel, thumbTrack;
    defaults.basePath = options.basePath || defaults.basePath;
    settings = extend({}, defaults, options);
    player = this;
    //detect which track we use. For now we just use the first metadata track
    var numtracks = player.textTracks().length;
    if (numtracks === 0) {
      return;
    }
    i = 0;
    while (i<numtracks) {
      if (player.textTracks()[i].kind==='metadata') {
        thumbTrack = player.textTracks()[i];
        //Chrome needs this
        thumbTrack.mode = 'hidden';
        break;
      }
      i++;
    }
    (function() {
      var progressControl, addFakeActive, removeFakeActive;
      // Android doesn't support :active and :hover on non-anchor and non-button elements
      // so, we need to fake the :active selector for thumbnails to show up.
      if (navigator.userAgent.toLowerCase().indexOf("android") !== -1) {
        progressControl = player.controlBar.progressControl;

        addFakeActive = function() {
          progressControl.addClass('fake-active');
        };
        removeFakeActive = function() {
          progressControl.removeClass('fake-active');
        };

        progressControl.on('touchstart', addFakeActive);
        progressControl.on('touchend', removeFakeActive);
        progressControl.on('touchcancel', removeFakeActive);
      }
    })();

    // create the thumbnail
    div = document.createElement('div');
    div.className = 'vjs-thumbnail-holder';
    img = document.createElement('img');
    div.appendChild(img);
    img.className = 'vjs-thumbnail';

    // keep track of the duration to calculate correct thumbnail to display
    duration = player.duration();
    
    // when the container is MP4
    player.on('durationchange', function(event) {
      duration = player.duration();
    });

    // when the container is HLS
    player.on('loadedmetadata', function(event) {
      duration = player.duration();
    });

    // add the thumbnail to the player
    progressControl = player.controlBar.progressControl;
    progressControl.el().appendChild(div);

    moveListener = function(event) {
      var mouseTime, time, active, left, setting, pageX, right, width, halfWidth, pageXOffset, clientRect;
      active = 0;
      pageXOffset = getScrollOffset().x;
      clientRect = offsetParent(progressControl.el()).getBoundingClientRect();
      right = (clientRect.width || clientRect.right) + pageXOffset;

      pageX = event.pageX;
      if (event.changedTouches) {
        pageX = event.changedTouches[0].pageX;
      }

      // find the page offset of the mouse
      left = pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
      // subtract the page offset of the positioned offset parent
      left -= offsetParent(progressControl.el()).getBoundingClientRect().left + pageXOffset;

      // apply updated styles to the thumbnail if necessary
      // mouseTime is the position of the mouse along the progress control bar
      // `left` applies to the mouse position relative to the player so we need
      // to remove the progress control's left offset to know the mouse position
      // relative to the progress control
      mouseTime = Math.floor((left - progressControl.el().offsetLeft) / progressControl.width() * duration);

      //Now check which of the cues applies
      var cnum = thumbTrack&&thumbTrack.cues.length;
      i = 0;
      while (i<cnum) {
        var ccue = thumbTrack.cues[i];
        if (ccue.startTime <= mouseTime && ccue.endTime >= mouseTime) {
          setting = parseImageLink(ccue.text);
          break;
        }
        i++;
      }
      //None found, so show nothing
      if (typeof setting === 'undefined') {
        return;
      } 

      //Changed image?
      if (setting.src && img.src != setting.src) {
        img.src = setting.src;
      }

      //Fall back to plugin defaults in case no height/width is specified
      if (setting.w === 0) {
        setting.w = settings.width;
      }
      if (setting.h === 0) {
        setting.h = settings.height;
      }

      //Set the container width/height if it changed
      if (div.style.width != setting.w || div.style.height != setting.h) {
        div.style.width = setting.w + 'px';
        div.style.height = setting.h + 'px';
      }
      //Set the image cropping
      img.style.left = -(setting.x) + 'px';
      img.style.top = -(setting.y) + 'px';
      img.style.clip = 'rect('+setting.y+'px,'+(setting.w+setting.x)+'px,'+(setting.y+setting.h)+'px,'+setting.x+'px)';
      
      width = setting.w;
      halfWidth = width / 2;

      // make sure that the thumbnail doesn't fall off the right side of the left side of the player
      if ( (left + halfWidth) > right ) {
        left = right - width;
      } else if (left < halfWidth) {
        left = 0;
      } else {
        left = left - halfWidth;
      }

      div.style.left = left + 'px';
    };

    // update the thumbnail while hovering
    progressControl.on('mousemove', moveListener);
    progressControl.on('touchmove', moveListener);

    moveCancel = function(event) {
      div.style.left = '-1000px';
    };

    // move the placeholder out of the way when not hovering
    progressControl.on('mouseout', moveCancel);
    progressControl.on('touchcancel', moveCancel);
    progressControl.on('touchend', moveCancel);
    player.on('userinactive', moveCancel);
  });
})();
