(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var activeSlideIndex,
      activeBulletIndex,

      bullets = deck.slides.map(function(slide) {
        return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
      }),

      next = function() {
        var nextSlideIndex = activeSlideIndex + 1;

        if (activeSlideHasBulletByOffset(1)) {
          activateBullet(activeSlideIndex, activeBulletIndex + 1);
          return false;
        } else if (bullets[nextSlideIndex]) {
          activateBullet(nextSlideIndex, 0);
        }
      },

      prev = function() {
        var prevSlideIndex = activeSlideIndex - 1;

        if (activeSlideHasBulletByOffset(-1)) {
          activateBullet(activeSlideIndex, activeBulletIndex - 1);
          return false;
        } else if (bullets[prevSlideIndex]) {
          activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
        }
      },

      activateBullet = function(slideIndex, bulletIndex) {
        activeSlideIndex = slideIndex;
        activeBulletIndex = bulletIndex;

        bullets.forEach(function(slide, s) {
          slide.forEach(function(bullet, b) {
            bullet.classList.add('bespoke-bullet');

            if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
              bullet.classList.add('bespoke-bullet-active');
              bullet.classList.remove('bespoke-bullet-inactive');
            } else {
              bullet.classList.add('bespoke-bullet-inactive');
              bullet.classList.remove('bespoke-bullet-active');
            }

            if (s === slideIndex && b === bulletIndex) {
              bullet.classList.add('bespoke-bullet-current');
            } else {
              bullet.classList.remove('bespoke-bullet-current');
            }
          });
        });
      },

      activeSlideHasBulletByOffset = function(offset) {
        return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
      };

    deck.on('next', next);
    deck.on('prev', prev);

    deck.on('slide', function(e) {
      activateBullet(e.index, 0);
    });

    activateBullet(0, 0);
  };
};

},{}],2:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var addClass = function(el, cls) {
        el.classList.add('bespoke-' + cls);
      },

      removeClass = function(el, cls) {
        el.className = el.className
          .replace(new RegExp('bespoke-' + cls +'(\\s|$)', 'g'), ' ')
          .trim();
      },

      deactivate = function(el, index) {
        var activeSlide = deck.slides[deck.slide()],
          offset = index - deck.slide(),
          offsetClass = offset > 0 ? 'after' : 'before';

        ['before(-\\d+)?', 'after(-\\d+)?', 'active', 'inactive'].map(removeClass.bind(null, el));

        if (el !== activeSlide) {
          ['inactive', offsetClass, offsetClass + '-' + Math.abs(offset)].map(addClass.bind(null, el));
        }
      };

    addClass(deck.parent, 'parent');
    deck.slides.map(function(el) { addClass(el, 'slide'); });

    deck.on('activate', function(e) {
      deck.slides.map(deactivate);
      addClass(e.slide, 'active');
      removeClass(e.slide, 'inactive');
    });
  };
};

},{}],3:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var KEY_F = 70, KEY_F11 = 122, EVT_KEYDOWN = 'keydown',
      toggleFullscreen = function() {
        var el, func;
        if (document.fullscreenElement || document.webkitFullscreenElement ||
            document.mozFullScreenElement || document.msFullscreenElement) {
          func = (el = document).exitFullscreen ||
              el.webkitExitFullscreen || el.mozCancelFullScreen || el.msExitFullscreen;
        }
        else {
          func = (el = document.documentElement).requestFullscreen ||
              el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        }
        func.apply(el);
      },
      isModifierPressed = function(e) {
        return !!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey);
      },
      onKeydown = function(e) {
        var key = e.which;
        if ((key === KEY_F || key === KEY_F11) && !isModifierPressed(e)) {
          toggleFullscreen();
          if (key === KEY_F11) e.preventDefault();
        }
      };
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled || document.msFullscreenEnabled) {
      deck.on('destroy', function() { document.removeEventListener(EVT_KEYDOWN, onKeydown); });
      deck.on('fullscreen.toggle', toggleFullscreen);
      document.addEventListener(EVT_KEYDOWN, onKeydown);
    }
  };
};

},{}],4:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var activateSlide = function(index) {
      var indexToActivate = -1 < index && index < deck.slides.length ? index : 0;
      if (indexToActivate !== deck.slide()) {
        deck.slide(indexToActivate);
      }
    };

    var parseHash = function() {
      var hash = window.location.hash.slice(1),
        slideNumberOrName = parseInt(hash, 10);

      if (hash) {
        if (slideNumberOrName) {
          activateSlide(slideNumberOrName - 1);
        } else {
          deck.slides.forEach(function(slide, i) {
            if (slide.getAttribute('data-bespoke-hash') === hash || slide.id === hash) {
              activateSlide(i);
            }
          });
        }
      }
    };

    setTimeout(function() {
      parseHash();

      deck.on('activate', function(e) {
        var slideName = e.slide.getAttribute('data-bespoke-hash') || e.slide.id;
        window.location.hash = slideName || e.index + 1;
      });

      window.addEventListener('hashchange', parseHash);
    }, 0);
  };
};

},{}],5:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var KEY_SP = 32, KEY_PGUP = 33, KEY_PGDN = 34, KEY_END = 35, KEY_HME = 36,
        KEY_LT = 37, KEY_RT = 39, KEY_H = 72, KEY_L = 76, KD = 'keydown',
      modified = function(e, k) {
        return e.ctrlKey || (e.shiftKey && (k === KEY_HME || k === KEY_END)) || e.altKey || e.metaKey;
      },
      onKey = function(e) {
        if (!modified(e, e.which)) {
          switch(e.which) {
            case KEY_SP: return (e.shiftKey ? deck.prev : deck.next)();
            case KEY_RT: case KEY_PGDN: case KEY_L: return deck.next();
            case KEY_LT: case KEY_PGUP: case KEY_H: return deck.prev();
            case KEY_HME: return deck.slide(0);
            case KEY_END: return deck.slide(deck.slides.length - 1);
          }
        }
      };
    deck.on('destroy', function() { document.removeEventListener(KD, onKey); });
    document.addEventListener(KD, onKey);
  };
};

},{}],6:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var opts = (options || {}), TS = 'touchstart', TM = 'touchmove', ADD = 'addEventListener', RM = 'removeEventListener',
      src = deck.parent, start = null, delta = null, axis = 'page' + (opts.axis === 'y' ? 'Y' : 'X'),
      gap = typeof opts.threshold === 'number' ? opts.threshold : 50 / window.devicePixelRatio,
      onStart = function(e) { start = e.touches.length === 1 ? e.touches[0][axis] : null; },
      onMove = function(e) {
        if (start === null) return; // not ours
        if (start === undefined) return e.preventDefault(); // action already taken
        if (Math.abs(delta = e.touches[0][axis] - start) > gap) {
          (delta > 0 ? deck.prev : deck.next)();
          start = e.preventDefault(); // mark action taken
        }
      };
    deck.on('destroy', function() { src[RM](TS, onStart); src[RM](TM, onMove); });
    src[ADD](TS, onStart); src[ADD](TM, onMove);
  };
};

},{}],7:[function(require,module,exports){
module.exports = function(opts) {
  opts = opts || {};
  var kbd = require('bespoke-nav-kbd')(opts.kbd);
  var touch = require('bespoke-nav-touch')(opts.touch);
  return function(deck) {
    kbd(deck);
    touch(deck);
  };
};

},{"bespoke-nav-kbd":5,"bespoke-nav-touch":6}],8:[function(require,module,exports){
var cssInserted = 0;
module.exports = function(opts) {
  if (cssInserted++ === 0) (function(head, style) {
    (style = document.createElement('style')).textContent = '.bespoke-parent.bespoke-overview{pointer-events:auto}\n' +
        '.bespoke-overview *{pointer-events:none}\n' +
        '.bespoke-overview img{-moz-user-select:none}\n' +
        '.bespoke-overview .bespoke-slide{opacity:1;visibility:visible;cursor:pointer;overflow:hidden;pointer-events:auto}\n' +
        '.bespoke-overview .bespoke-active{outline:6px solid #cfd8dc;outline-offset:-3px;-moz-outline-radius:3px}\n' +
        '.bespoke-overview .bespoke-bullet{opacity:1;visibility:visible}\n' +
        '.bespoke-overview-counter{counter-reset:overview}\n' +
        '.bespoke-overview-counter .bespoke-slide::after{counter-increment:overview;content:counter(overview);position:absolute;right:.75em;bottom:.5em;font-size:1.25rem;line-height:1.25}\n' +
        '.bespoke-title{visibility:hidden;position:absolute;top:0;left:0;width:100%;pointer-events:auto}\n' +
        '.bespoke-title h1{margin:0;font-size:1.6em;line-height:1.2;text-align:center}\n' +
        '.bespoke-overview:not(.bespoke-overview-to) .bespoke-title{visibility:visible}\n' +
        '.bespoke-overview-to .bespoke-active,.bespoke-overview-from .bespoke-active{z-index:1}';
    head.insertBefore(style, head.firstChild);
  })(document.head);
  return function(deck) {
    opts = typeof opts === 'object' ? opts : {};
    var KEY_O = 79, KEY_ENT = 13, KEY_UP = 38, KEY_DN = 40,
      RE_CSV = /, */, RE_NONE = /^none(?:, ?none)*$/, RE_TRANS = /^translate\((.+?)px, ?(.+?)px\) scale\((.+?)\)$/, RE_MODE = /(^\?|&)overview(?=$|&)/,
      TRANSITIONEND = !('transition' in document.body.style) && ('webkitTransition' in document.body.style) ? 'webkitTransitionEnd' : 'transitionend',
      VENDOR = ['webkit', 'Moz'],
      columns = typeof opts.columns === 'number' ? parseInt(opts.columns) : 3,
      margin = typeof opts.margin === 'number' ? parseFloat(opts.margin) : 15,
      overviewActive = null,
      afterTransition,
      getStyleProperty = function(element, name) {
        if (!(name in element.style)) {
          var properName = name.charAt(0).toUpperCase() + name.substr(1);
          for (var i = 0, len = VENDOR.length; i < len; i++) {
            if (VENDOR[i] + properName in element.style) return VENDOR[i] + properName;
          }
        }
        return name;
      },
      getTransformScaleFactor = function(element, transformProp) {
        return parseFloat(element.style[transformProp].slice(6, -1));
      },
      getZoomFactor = function(element) {
        if ('zoom' in element.style) return parseFloat(element.style.zoom) || undefined;
      },
      getTransitionProperties = function(element) {
        var result = [],
          style = getComputedStyle(element),
          transitionProperty = style[getStyleProperty(element, 'transitionProperty')];
        if (!transitionProperty || RE_NONE.test(transitionProperty)) return result;
        // NOTE assume computed style returns compliant values beyond this point
        transitionProperty = transitionProperty.split(RE_CSV);
        var transitionDuration = style[getStyleProperty(element, 'transitionDuration')].split(RE_CSV),
          transitionDelay = style[getStyleProperty(element, 'transitionDelay')].split(RE_CSV);
        transitionProperty.forEach(function(property, i) {
          if (transitionDuration[i] !== '0s' || transitionDelay[i] !== '0s') result.push(property);
        });
        return result;
      },
      flushStyle = function(element, property, from, to) {
        if (property) element.style[property] = from;
        var _ = element.offsetHeight; // jshint ignore:line
        if (property) element.style[property] = to;
      },
      onReady = function() {
        deck.on('activate', onReady)(); // unregisters listener
        deck.parent.scrollLeft = deck.parent.scrollTop = 0;
        if (!!opts.autostart || RE_MODE.test(location.search)) setTimeout(openOverview, 100); // timeout allows transitions to prepare
      },
      onSlideClick = function() {
        closeOverview(deck.slides.indexOf(this));
      },
      onNavigate = function(offset, e) {
        var targetIndex = e.index + offset;
        // IMPORTANT must use deck.slide to navigate and return false in order to circumvent bespoke-bullets behavior
        if (targetIndex >= 0 && targetIndex < deck.slides.length) deck.slide(targetIndex, { preview: true });
        return false;
      },
      onActivate = function(e) {
        if (e.scrollIntoView !== false) scrollSlideIntoView(e.slide, e.index, getZoomFactor(e.slide));
      },
      updateLocation = function(state) {
        var s = location.search.replace(RE_MODE, '').replace(/^[^?]/, '?$&');
        if (state) {
          history.replaceState(null, null, location.pathname + (s.length > 0 ? s + '&' : '?') + 'overview' + location.hash);
        }
        else {
          history.replaceState(null, null, location.pathname + s + location.hash);
        }
      },
      scrollSlideIntoView = function(slide, index, zoomFactor) {
        deck.parent.scrollTop = index < columns ? 0 : deck.parent.scrollTop + slide.getBoundingClientRect().top * (zoomFactor || 1);
      },
      removeAfterTransition = function(direction, parentClasses, slide, slideAlt) {
        slide.removeEventListener(TRANSITIONEND, afterTransition, false);
        if (slideAlt && slideAlt !== slide) slideAlt.removeEventListener(TRANSITIONEND, afterTransition, false);
        afterTransition = undefined;
        parentClasses.remove('bespoke-overview-' + direction);
      },
      getOrCreateTitle = function(parent) {
        var first = parent.firstElementChild;
        if (first.classList.contains('bespoke-title')) {
          first.style.width = '';
          return first;
        }
        var header = document.createElement('header');
        header.className = 'bespoke-title';
        header.style[getStyleProperty(header, 'transformOrigin')] = '0 0';
        var h1 = document.createElement('h1');
        h1.appendChild(document.createTextNode(parent.getAttribute('data-title') || document.title));
        header.appendChild(h1);
        flushStyle(parent.insertBefore(header, first));
        return header;
      },
      openOverview = function() {
        var slides = deck.slides,
          parent = deck.parent,
          parentClasses = parent.classList,
          lastSlideIndex = slides.length - 1,
          activeSlideIndex = deck.slide(),
          sampleSlide = activeSlideIndex > 0 ? slides[0] : slides[lastSlideIndex],
          transformProp = getStyleProperty(sampleSlide, 'transform'),
          scaleParent = parent.querySelector('.bespoke-scale-parent'),
          baseScale = 1,
          zoomFactor,
          title,
          numTransitions = 0,
          resize = overviewActive,
          isWebKit = 'webkitAppearance' in parent.style;
        if (scaleParent) {
          baseScale = getTransformScaleFactor(scaleParent, transformProp);
        }
        else if ((zoomFactor = getZoomFactor(sampleSlide))) {
          baseScale = zoomFactor;
        }
        if (afterTransition) removeAfterTransition('from', parentClasses, slides[0], slides[lastSlideIndex]);
        if (!!opts.title) title = getOrCreateTitle(parent);
        if (!resize) {
          deck.slide(activeSlideIndex, { preview: true });
          parentClasses.add('bespoke-overview');
          addEventListener('resize', openOverview, false);
          overviewActive = [deck.on('activate', onActivate), deck.on('prev', onNavigate.bind(null, -1)), deck.on('next', onNavigate.bind(null, 1))];
          if (!!opts.counter) parentClasses.add('bespoke-overview-counter');
          if (!!opts.location) updateLocation(true);
          parentClasses.add('bespoke-overview-to');
          numTransitions = lastSlideIndex > 0 ? getTransitionProperties(sampleSlide).length :
              (getTransitionProperties(sampleSlide).join(' ').indexOf('transform') < 0 ? 0 : 1);
          parent.style.overflowY = 'scroll'; // gives us fine-grained control
          parent.style.scrollBehavior = 'smooth'; // not supported by all browsers
          if (isWebKit) slides.forEach(function(slide) { flushStyle(slide, 'marginBottom', '0%', ''); });
        }
        var deckWidth = parent.clientWidth / baseScale,
          deckHeight = parent.clientHeight / baseScale,
          scrollbarWidth = (scaleParent || parent).offsetWidth - parent.clientWidth,
          scrollbarOffset = scaleParent ? scrollbarWidth / 2 / baseScale : 0,
          slideWidth = sampleSlide.offsetWidth,
          slideHeight = sampleSlide.offsetHeight,
          scale = deckWidth / (columns * slideWidth + (columns + 1) * margin),
          totalScale = baseScale * scale,
          scaledSlideWidth = slideWidth * scale,
          scaledSlideHeight = slideHeight * scale,
          // NOTE x & y offset calculation based on transform origin at center of slide
          slideX = (deckWidth - scaledSlideWidth) / 2,
          slideY = (deckHeight - scaledSlideHeight) / 2,
          scaledMargin = margin * scale,
          scaledTitleHeight = 0,
          row = 0, col = 0;
        if (title) {
          if (opts.scaleTitle !== false) {
            title.style[zoomFactor ? 'zoom' : transformProp] = zoomFactor ? totalScale : 'scale(' + totalScale + ')';
            title.style.width = (parent.clientWidth / totalScale) + 'px';
            scaledTitleHeight = title.offsetHeight * scale;
          }
          else {
            if (scrollbarWidth > 0) title.style.width = parent.clientWidth + 'px';
            scaledTitleHeight = title.offsetHeight / baseScale;
          }
        }
        slides.forEach(function(slide) {
          var x = col * scaledSlideWidth + (col + 1) * scaledMargin - scrollbarOffset - slideX,
            y = row * scaledSlideHeight + (row + 1) * scaledMargin + scaledTitleHeight - slideY;
          // NOTE drop scientific notation for numbers near 0 as it confuses WebKit
          slide.style[transformProp] = 'translate(' + (x.toString().indexOf('e-') < 0 ? x : 0) + 'px, ' +
              (y.toString().indexOf('e-') < 0 ? y : 0) + 'px) scale(' + scale + ')';
          // NOTE add margin to last slide to leave gap below last row; only honored by WebKit
          if (row * columns + col === lastSlideIndex) slide.style.marginBottom = margin + 'px';
          slide.addEventListener('click', onSlideClick, false);
          if (col === (columns - 1)) {
            row += 1;
            col = 0;
          }
          else {
            col += 1;
          }
        });
        if (resize) {
          scrollSlideIntoView(slides[activeSlideIndex], activeSlideIndex, zoomFactor);
        }
        else if (numTransitions > 0) {
          sampleSlide.addEventListener(TRANSITIONEND, (afterTransition = function(e) {
            if (e.target === this && (numTransitions -= 1) === 0) {
              removeAfterTransition('to', parentClasses, this);
              if (isWebKit && parent.scrollHeight > parent.clientHeight) {
                flushStyle(parent, 'overflowY', 'auto', 'scroll'); // awakens scrollbar from zombie state
              }
              scrollSlideIntoView(slides[activeSlideIndex], activeSlideIndex, zoomFactor);
            }
          }), false);
        }
        else {
          slides.forEach(function(slide) { flushStyle(slide); }); // bypass transition, if any
          parentClasses.remove('bespoke-overview-to');
          scrollSlideIntoView(slides[activeSlideIndex], activeSlideIndex, zoomFactor);
        }
      },
      // NOTE the order of operation in this method is critical; heavily impacts behavior & transition smoothness
      closeOverview = function(selection) {
        // IMPORTANT intentionally reselect active slide to reactivate behavior
        deck.slide(typeof selection === 'number' ? selection : deck.slide(), { scrollIntoView: false });
        var slides = deck.slides,
          parent = deck.parent,
          parentClasses = parent.classList,
          lastSlideIndex = slides.length - 1,
          sampleSlide = deck.slide() > 0 ? slides[0] : slides[lastSlideIndex],
          transformProp = getStyleProperty(sampleSlide, 'transform'),
          transitionProp = getStyleProperty(sampleSlide, 'transition'),
          scaleParent = parent.querySelector('.bespoke-scale-parent'),
          baseScale,
          isWebKit = 'webkitAppearance' in parent.style;
        if (scaleParent) {
          baseScale = getTransformScaleFactor(scaleParent, transformProp);
        }
        else if (!(baseScale = getZoomFactor(sampleSlide))) {
          baseScale = 1;
        }
        if (afterTransition) removeAfterTransition('to', parentClasses, slides[0], slides[lastSlideIndex]);
        var yShift = parent.scrollTop / baseScale,
          // xShift accounts for horizontal shift when scrollbar is removed
          xShift = (parent.offsetWidth - (scaleParent || parent).clientWidth) / 2 / baseScale;
        parent.style.scrollBehavior = parent.style.overflowY = '';
        slides.forEach(function(slide) {
          if (isWebKit) flushStyle(slide, 'marginBottom', '0%', '');
          slide.removeEventListener('click', onSlideClick, false);
        });
        if (yShift || xShift) {
          slides.forEach(function(slide) {
            var m = slide.style[transformProp].match(RE_TRANS);
            slide.style[transformProp] = 'translate(' + (parseFloat(m[1]) - xShift) + 'px, ' + (parseFloat(m[2]) - yShift) + 'px) scale(' + m[3] + ')';
            flushStyle(slide, transitionProp, 'none', ''); // bypass transition, if any
          });
        }
        parent.scrollTop = 0;
        parentClasses.remove('bespoke-overview');
        removeEventListener('resize', openOverview, false);
        (overviewActive || []).forEach(function(unbindEvent) { unbindEvent(); });
        overviewActive = null;
        if (!!opts.counter) parentClasses.remove('bespoke-overview-counter');
        if (!!opts.location) updateLocation(false);
        parentClasses.add('bespoke-overview-from');
        var numTransitions = lastSlideIndex > 0 ? getTransitionProperties(sampleSlide).length :
            (getTransitionProperties(sampleSlide).join(' ').indexOf('transform') < 0 ? 0 : 1);
        slides.forEach(function(slide) { slide.style[transformProp] = ''; });
        if (numTransitions > 0) {
          sampleSlide.addEventListener(TRANSITIONEND, (afterTransition = function(e) {
            if (e.target === this && (numTransitions -= 1) === 0) removeAfterTransition('from', parentClasses, this);
          }), false);
        }
        else {
          slides.forEach(function(slide) { flushStyle(slide); }); // bypass transition, if any
          parentClasses.remove('bespoke-overview-from');
        }
      },
      toggleOverview = function() {
        (overviewActive ? closeOverview : openOverview)();
      },
      onKeydown = function(e) {
        if (e.which === KEY_O) {
          if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) toggleOverview();
        }
        else if (overviewActive) {
          switch (e.which) {
            case KEY_ENT:
              if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) closeOverview();
              break;
            case KEY_UP:
              return onNavigate(-columns, { index: deck.slide() });
            case KEY_DN:
              return onNavigate(columns, { index: deck.slide() });
          }
        }
      };
    deck.on('activate', onReady);
    deck.on('destroy', function() {
      removeEventListener('resize', openOverview, false);
      document.removeEventListener('keydown', onKeydown, false);
    });
    deck.on('overview', toggleOverview);
    document.addEventListener('keydown', onKeydown, false);
  };
};

},{}],9:[function(require,module,exports){
/*! bespoke-prism v1.0.1 © 2016 Hubert SABLONNIÈRE, MIT License */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n=n.bespoke||(n.bespoke={}),n=n.plugins||(n.plugins={}),n.prism=e()}}(function(){return function e(n,t,a){function r(o,s){if(!t[o]){if(!n[o]){var l="function"==typeof require&&require;if(!s&&l)return l(o,!0);if(i)return i(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var u=t[o]={exports:{}};n[o][0].call(u.exports,function(e){var t=n[o][1][e];return r(t?t:e)},u,u.exports,e,n,t,a)}return t[o].exports}for(var i="function"==typeof require&&require,o=0;o<a.length;o++)r(a[o]);return r}({1:[function(e,n,t){var a=e("insert-css"),r=e("prism-themes/themes/prism-ghcolors.css");n.exports=function(){var n=e("prismjs");return e("prismjs/plugins/unescaped-markup/prism-unescaped-markup"),e("prismjs/plugins/normalize-whitespace/prism-normalize-whitespace"),a(r,{prepend:!0}),function(){n.highlightAll()}}},{"insert-css":2,"prism-themes/themes/prism-ghcolors.css":3,prismjs:6,"prismjs/plugins/normalize-whitespace/prism-normalize-whitespace":4,"prismjs/plugins/unescaped-markup/prism-unescaped-markup":5}],2:[function(e,n,t){var a={};n.exports=function(e,n){if(!a[e]){a[e]=!0;var t=document.createElement("style");t.setAttribute("type","text/css"),"textContent"in t?t.textContent=e:t.styleSheet.cssText=e;var r=document.getElementsByTagName("head")[0];n&&n.prepend?r.insertBefore(t,r.childNodes[0]):r.appendChild(t)}}},{}],3:[function(e,n,t){n.exports='/**\n * GHColors theme by Avi Aryan (http://aviaryan.in)\n * Inspired by Github syntax coloring\n */\n\ncode[class*="language-"],\npre[class*="language-"] {\n    color: #393A34;\n    font-family: "Consolas", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;\n    direction: ltr;\n    text-align: left;\n    white-space: pre;\n    word-spacing: normal;\n    word-break: normal;\n    font-size: 0.95em;\n    line-height: 1.2em;\n\n    -moz-tab-size: 4;\n    -o-tab-size: 4;\n    tab-size: 4;\n\n    -webkit-hyphens: none;\n    -moz-hyphens: none;\n    -ms-hyphens: none;\n    hyphens: none;\n}\n\npre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,\ncode[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {\n    background: #b3d4fc;\n}\n\npre[class*="language-"]::selection, pre[class*="language-"] ::selection,\ncode[class*="language-"]::selection, code[class*="language-"] ::selection {\n    background: #b3d4fc;\n}\n\n/* Code blocks */\npre[class*="language-"] {\n    padding: 1em;\n    margin: .5em 0;\n    overflow: auto;\n    border: 1px solid #dddddd;\n    background-color: white;\n}\n\n:not(pre) > code[class*="language-"],\npre[class*="language-"] {\n}\n\n/* Inline code */\n:not(pre) > code[class*="language-"] {\n    padding: .2em;\n    padding-top: 1px; padding-bottom: 1px;\n    background: #f8f8f8;\n    border: 1px solid #dddddd;\n}\n\n.token.comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n    color: #999988; font-style: italic;\n}\n\n.token.namespace {\n    opacity: .7;\n}\n\n.token.string,\n.token.attr-value {\n    color: #e3116c;\n}\n.token.punctuation,\n.token.operator {\n    color: #393A34; /* no highlight */\n}\n\n.token.entity,\n.token.url,\n.token.symbol,\n.token.number,\n.token.boolean,\n.token.variable,\n.token.constant,\n.token.property,\n.token.regex,\n.token.inserted {\n    color: #36acaa;\n}\n\n.token.atrule,\n.token.keyword,\n.token.attr-name,\n.language-autohotkey .token.selector {\n    color: #00a4db;\n}\n\n.token.function,\n.token.deleted,\n.language-autohotkey .token.tag {\n    color: #9a050f;\n}\n\n.token.tag,\n.token.selector,\n.language-autohotkey .token.keyword {\n    color: #00009f;\n}\n\n.token.important,\n.token.function,\n.token.bold {\n    font-weight: bold;\n}\n\n.token.italic {\n    font-style: italic;\n}'},{}],4:[function(e,n,t){!function(){function e(e){this.defaults=a({},e)}function n(e){return e.replace(/-(\w)/g,function(e,n){return n.toUpperCase()})}function t(e){for(var n=0,t=0;t<e.length;++t)e.charCodeAt(t)=="\t".charCodeAt(0)&&(n+=3);return e.length+n}if("undefined"!=typeof self&&self.Prism&&self.document){var a=Object.assign||function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);return e};e.prototype={setDefaults:function(e){this.defaults=a(this.defaults,e)},normalize:function(e,t){t=a(this.defaults,t);for(var r in t){var i=n(r);"normalize"!==r&&"setDefaults"!==i&&t[r]&&this[i]&&(e=this[i].call(this,e,t[r]))}return e},leftTrim:function(e){return e.replace(/^\s+/,"")},rightTrim:function(e){return e.replace(/\s+$/,"")},tabsToSpaces:function(e,n){return n=0|n||4,e.replace(/\t/g,new Array((++n)).join(" "))},spacesToTabs:function(e,n){return n=0|n||4,e.replace(new RegExp(" {"+n+"}","g"),"\t")},removeTrailing:function(e){return e.replace(/\s*?$/gm,"")},removeInitialLineFeed:function(e){return e.replace(/^(?:\r?\n|\r)/,"")},removeIndent:function(e){var n=e.match(/^[^\S\n\r]*(?=\S)/gm);return n&&n[0].length?(n.sort(function(e,n){return e.length-n.length}),n[0].length?e.replace(new RegExp("^"+n[0],"gm"),""):e):e},indent:function(e,n){return e.replace(/^[^\S\n\r]*(?=\S)/gm,new Array((++n)).join("\t")+"$&")},breakLines:function(e,n){n=n===!0?80:0|n||80;for(var a=e.split("\n"),r=0;r<a.length;++r)if(!(t(a[r])<=n)){for(var i=a[r].split(/(\s+)/g),o=0,s=0;s<i.length;++s){var l=t(i[s]);o+=l,o>n&&(i[s]="\n"+i[s],o=l)}a[r]=i.join("")}return a.join("\n")}},Prism.plugins.NormalizeWhitespace=new e({"remove-trailing":!0,"remove-indent":!0,"left-trim":!0,"right-trim":!0}),Prism.hooks.add("before-highlight",function(e){var n=e.element.parentNode,t=/\bno-whitespace-normalization\b/;if(!(!e.code||!n||"pre"!==n.nodeName.toLowerCase()||e.settings&&e.settings["whitespace-normalization"]===!1||t.test(n.className)||t.test(e.element.className))){for(var a=n.childNodes,r="",i="",o=!1,s=Prism.plugins.NormalizeWhitespace,l=0;l<a.length;++l){var c=a[l];c==e.element?o=!0:"#text"===c.nodeName&&(o?i+=c.nodeValue:r+=c.nodeValue,n.removeChild(c),--l)}if(e.element.children.length&&Prism.plugins.KeepMarkup){var u=r+e.element.innerHTML+i;e.element.innerHTML=s.normalize(u,e.settings),e.code=e.element.textContent}else e.code=r+e.code+i,e.code=s.normalize(e.code,e.settings)}})}}()},{}],5:[function(e,n,t){!function(){"undefined"!=typeof self&&self.Prism&&self.document&&Prism.languages.markup&&(Prism.plugins.UnescapedMarkup=!0,Prism.hooks.add("before-highlightall",function(e){e.selector+=", .lang-markup script[type='text/plain'], .language-markup script[type='text/plain'], script[type='text/plain'].lang-markup, script[type='text/plain'].language-markup"}),Prism.hooks.add("before-sanity-check",function(e){if("markup"==e.language){if(e.element.matches("script[type='text/plain']")){var n=document.createElement("code"),t=document.createElement("pre");return t.className=n.className=e.element.className,e.code=e.code.replace(/&lt;\/script(>|&gt;)/gi,"</script>"),n.textContent=e.code,t.appendChild(n),e.element.parentNode.replaceChild(t,e.element),void(e.element=n)}var t=e.element.parentNode;!e.code&&t&&"pre"==t.nodeName.toLowerCase()&&e.element.childNodes.length&&"#comment"==e.element.childNodes[0].nodeName&&(e.element.textContent=e.code=e.element.childNodes[0].textContent)}}))}()},{}],6:[function(e,n,t){(function(e){var t="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},a=function(){var e=/\blang(?:uage)?-(\w+)\b/i,n=0,a=t.Prism={util:{encode:function(e){return e instanceof r?new r(e.type,a.util.encode(e.content),e.alias):"Array"===a.util.type(e)?e.map(a.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function(e){var n=a.util.type(e);switch(n){case"Object":var t={};for(var r in e)e.hasOwnProperty(r)&&(t[r]=a.util.clone(e[r]));return t;case"Array":return e.map&&e.map(function(e){return a.util.clone(e)})}return e}},languages:{extend:function(e,n){var t=a.util.clone(a.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(e,n,t,r){r=r||a.languages;var i=r[e];if(2==arguments.length){t=arguments[1];for(var o in t)t.hasOwnProperty(o)&&(i[o]=t[o]);return i}var s={};for(var l in i)if(i.hasOwnProperty(l)){if(l==n)for(var o in t)t.hasOwnProperty(o)&&(s[o]=t[o]);s[l]=i[l]}return a.languages.DFS(a.languages,function(n,t){t===r[e]&&n!=e&&(this[n]=s)}),r[e]=s},DFS:function(e,n,t,r){r=r||{};for(var i in e)e.hasOwnProperty(i)&&(n.call(e,i,e[i],t||i),"Object"!==a.util.type(e[i])||r[a.util.objId(e[i])]?"Array"!==a.util.type(e[i])||r[a.util.objId(e[i])]||(r[a.util.objId(e[i])]=!0,a.languages.DFS(e[i],n,i,r)):(r[a.util.objId(e[i])]=!0,a.languages.DFS(e[i],n,null,r)))}},plugins:{},highlightAll:function(e,n){var t={callback:n,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};a.hooks.run("before-highlightall",t);for(var r,i=t.elements||document.querySelectorAll(t.selector),o=0;r=i[o++];)a.highlightElement(r,e===!0,t.callback)},highlightElement:function(n,r,i){for(var o,s,l=n;l&&!e.test(l.className);)l=l.parentNode;l&&(o=(l.className.match(e)||[,""])[1].toLowerCase(),s=a.languages[o]),n.className=n.className.replace(e,"").replace(/\s+/g," ")+" language-"+o,l=n.parentNode,/pre/i.test(l.nodeName)&&(l.className=l.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var c=n.textContent,u={element:n,language:o,grammar:s,code:c};if(a.hooks.run("before-sanity-check",u),!u.code||!u.grammar)return void a.hooks.run("complete",u);if(a.hooks.run("before-highlight",u),r&&t.Worker){var g=new Worker(a.filename);g.onmessage=function(e){u.highlightedCode=e.data,a.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(u.element),a.hooks.run("after-highlight",u),a.hooks.run("complete",u)},g.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=a.highlight(u.code,u.grammar,u.language),a.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(n),a.hooks.run("after-highlight",u),a.hooks.run("complete",u)},highlight:function(e,n,t){var i=a.tokenize(e,n);return r.stringify(a.util.encode(i),t)},tokenize:function(e,n,t){var r=a.Token,i=[e],o=n.rest;if(o){for(var s in o)n[s]=o[s];delete n.rest}e:for(var s in n)if(n.hasOwnProperty(s)&&n[s]){var l=n[s];l="Array"===a.util.type(l)?l:[l];for(var c=0;c<l.length;++c){var u=l[c],g=u.inside,p=!!u.lookbehind,d=!!u.greedy,f=0,m=u.alias;u=u.pattern||u;for(var h=0;h<i.length;h++){var y=i[h];if(i.length>e.length)break e;if(!(y instanceof r)){u.lastIndex=0;var k=u.exec(y),v=1;if(!k&&d&&h!=i.length-1){var b=i[h+1].matchedStr||i[h+1],w=y+b;if(h<i.length-2&&(w+=i[h+2].matchedStr||i[h+2]),u.lastIndex=0,k=u.exec(w),!k)continue;var x=k.index+(p?k[1].length:0);if(x>=y.length)continue;var N=k.index+k[0].length,C=y.length+b.length;if(v=3,N<=C){if(i[h+1].greedy)continue;v=2,w=w.slice(0,C)}y=w}if(k){p&&(f=k[1].length);var x=k.index+f,k=k[0].slice(f),N=x+k.length,A=y.slice(0,x),j=y.slice(N),z=[h,v];A&&z.push(A);var P=new r(s,g?a.tokenize(k,g):k,m,k,d);z.push(P),j&&z.push(j),Array.prototype.splice.apply(i,z)}}}}}return i},hooks:{all:{},add:function(e,n){var t=a.hooks.all;t[e]=t[e]||[],t[e].push(n)},run:function(e,n){var t=a.hooks.all[e];if(t&&t.length)for(var r,i=0;r=t[i++];)r(n)}}},r=a.Token=function(e,n,t,a,r){this.type=e,this.content=n,this.alias=t,this.matchedStr=a||null,this.greedy=!!r};if(r.stringify=function(e,n,t){if("string"==typeof e)return e;if("Array"===a.util.type(e))return e.map(function(t){return r.stringify(t,n,e)}).join("");var i={type:e.type,content:r.stringify(e.content,n,t),tag:"span",classes:["token",e.type],attributes:{},language:n,parent:t};if("comment"==i.type&&(i.attributes.spellcheck="true"),e.alias){var o="Array"===a.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(i.classes,o)}a.hooks.run("wrap",i);var s="";for(var l in i.attributes)s+=(s?" ":"")+l+'="'+(i.attributes[l]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+s+">"+i.content+"</"+i.tag+">"},!t.document)return t.addEventListener?(t.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code,o=n.immediateClose;t.postMessage(a.highlight(i,a.languages[r],r)),o&&t.close()},!1),t.Prism):t.Prism;var i=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return i&&(a.filename=i.src,document.addEventListener&&!i.hasAttribute("data-manual")&&("loading"!==document.readyState?requestAnimationFrame(a.highlightAll,0):document.addEventListener("DOMContentLoaded",a.highlightAll))),t.Prism}();"undefined"!=typeof n&&n.exports&&(n.exports=a),"undefined"!=typeof e&&(e.Prism=a),a.languages.markup={comment:/<!--[\w\W]*?-->/,prolog:/<\?[\w\W]+?\?>/,doctype:/<!DOCTYPE[\w\W]+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,inside:{tag:{pattern:/^<\/?[^\s>\/]+/i,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,inside:{punctuation:/[=>"']/}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:/&#?[\da-z]{1,8};/i},a.hooks.add("wrap",function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))}),a.languages.xml=a.languages.markup,a.languages.html=a.languages.markup,a.languages.mathml=a.languages.markup,a.languages.svg=a.languages.markup,a.languages.css={comment:/\/\*[\w\W]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^\{\}\s][^\{\};]*?(?=\s*\{)/,string:/("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,property:/(\b|\B)[\w-]+(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},a.languages.css.atrule.inside.rest=a.util.clone(a.languages.css),a.languages.markup&&(a.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,lookbehind:!0,inside:a.languages.css,alias:"language-css"}}),a.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').*?\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:a.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:a.languages.css}},alias:"language-css"}},a.languages.markup.tag)),a.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:{pattern:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/},a.languages.javascript=a.languages.extend("clike",{keyword:/\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i}),a.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0,greedy:!0}}),a.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\\\|\\?[^\\])*?`/,greedy:!0,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:a.languages.javascript}},string:/[\s\S]+/}}}),a.languages.markup&&a.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:a.languages.javascript,alias:"language-javascript"}}),a.languages.js=a.languages.javascript,function(){"undefined"!=typeof self&&self.Prism&&self.document&&document.querySelector&&(self.Prism.fileHighlight=function(){var e={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"};Array.prototype.forEach&&Array.prototype.slice.call(document.querySelectorAll("pre[data-src]")).forEach(function(n){for(var t,r=n.getAttribute("data-src"),i=n,o=/\blang(?:uage)?-(?!\*)(\w+)\b/i;i&&!o.test(i.className);)i=i.parentNode;if(i&&(t=(n.className.match(o)||[,""])[1]),!t){var s=(r.match(/\.(\w+)$/)||[,""])[1];t=e[s]||s}var l=document.createElement("code");l.className="language-"+t,n.textContent="",l.textContent="Loading…",n.appendChild(l);var c=new XMLHttpRequest;c.open("GET",r,!0),c.onreadystatechange=function(){4==c.readyState&&(c.status<400&&c.responseText?(l.textContent=c.responseText,a.highlightElement(l)):c.status>=400?l.textContent="✖ Error "+c.status+" while fetching file: "+c.statusText:l.textContent="✖ Error: File does not exist or is empty")},c.send(null)})},document.addEventListener("DOMContentLoaded",self.Prism.fileHighlight))}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});
},{}],10:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var parent = deck.parent,
      firstSlide = deck.slides[0],
      slideHeight = firstSlide.offsetHeight,
      slideWidth = firstSlide.offsetWidth,
      useZoom = options === 'zoom' || ('zoom' in parent.style && options !== 'transform'),

      wrap = function(element) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bespoke-scale-parent';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        return wrapper;
      },

      elements = useZoom ? deck.slides : deck.slides.map(wrap),

      transformProperty = (function(property) {
        var prefixes = 'Moz Webkit O ms'.split(' ');
        return prefixes.reduce(function(currentProperty, prefix) {
            return prefix + property in parent.style ? prefix + property : currentProperty;
          }, property.toLowerCase());
      }('Transform')),

      scale = useZoom ?
        function(ratio, element) {
          element.style.zoom = ratio;
        } :
        function(ratio, element) {
          element.style[transformProperty] = 'scale(' + ratio + ')';
        },

      scaleAll = function() {
        var xScale = parent.offsetWidth / slideWidth,
          yScale = parent.offsetHeight / slideHeight;

        elements.forEach(scale.bind(null, Math.min(xScale, yScale)));
      };

    window.addEventListener('resize', scaleAll);
    scaleAll();
  };

};

},{}],11:[function(require,module,exports){
var from = function(opts, plugins) {
  var parent = (opts.parent || opts).nodeType === 1 ? (opts.parent || opts) : document.querySelector(opts.parent || opts),
    slides = [].filter.call(typeof opts.slides === 'string' ? parent.querySelectorAll(opts.slides) : (opts.slides || parent.children), function(el) { return el.nodeName !== 'SCRIPT'; }),
    activeSlide = slides[0],
    listeners = {},

    activate = function(index, customData) {
      if (!slides[index]) {
        return;
      }

      fire('deactivate', createEventData(activeSlide, customData));
      activeSlide = slides[index];
      fire('activate', createEventData(activeSlide, customData));
    },

    slide = function(index, customData) {
      if (arguments.length) {
        fire('slide', createEventData(slides[index], customData)) && activate(index, customData);
      } else {
        return slides.indexOf(activeSlide);
      }
    },

    step = function(offset, customData) {
      var slideIndex = slides.indexOf(activeSlide) + offset;

      fire(offset > 0 ? 'next' : 'prev', createEventData(activeSlide, customData)) && activate(slideIndex, customData);
    },

    on = function(eventName, callback) {
      (listeners[eventName] || (listeners[eventName] = [])).push(callback);
      return off.bind(null, eventName, callback);
    },

    off = function(eventName, callback) {
      listeners[eventName] = (listeners[eventName] || []).filter(function(listener) { return listener !== callback; });
    },

    fire = function(eventName, eventData) {
      return (listeners[eventName] || [])
        .reduce(function(notCancelled, callback) {
          return notCancelled && callback(eventData) !== false;
        }, true);
    },

    createEventData = function(el, eventData) {
      eventData = eventData || {};
      eventData.index = slides.indexOf(el);
      eventData.slide = el;
      return eventData;
    },

    deck = {
      on: on,
      off: off,
      fire: fire,
      slide: slide,
      next: step.bind(null, 1),
      prev: step.bind(null, -1),
      parent: parent,
      slides: slides
    };

  (plugins || []).forEach(function(plugin) {
    plugin(deck);
  });

  activate(0);

  return deck;
};

module.exports = {
  from: from
};

},{}],12:[function(require,module,exports){
var isWebKit = 'webkitAppearance' in document.documentElement.style,
  // zoom-based scaling causes font sizes and line heights to be calculated differently
  // on the other hand, zoom-based scaling correctly anti-aliases fonts during transforms (no need for layer creation hack)
  scaleMethod = isWebKit ? 'zoom' : 'transform',
  bespoke = require('bespoke'),
  bullets = require('bespoke-bullets'),
  classes = require('bespoke-classes'),
  fullscreen = require('bespoke-fullscreen'),
  hash = require('bespoke-hash'),
  nav = require('bespoke-nav'),
  overview = require('bespoke-overview'),
  prism = require('bespoke-prism'),
  scale = require('bespoke-scale');

bespoke.from({ parent: 'article.deck', slides: 'section' }, [
  classes(),
  nav(),
  fullscreen(),
  (scaleMethod ? scale(scaleMethod) : function(deck) {}),
  overview({ columns: 4 }),
  bullets('.build, .build-items > *:not(.build-items)'),
  hash(),
  prism()
]);

},{"bespoke":11,"bespoke-bullets":1,"bespoke-classes":2,"bespoke-fullscreen":3,"bespoke-hash":4,"bespoke-nav":7,"bespoke-overview":8,"bespoke-prism":9,"bespoke-scale":10}]},{},[12]);
