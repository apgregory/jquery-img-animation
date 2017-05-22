;
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';
    var Flipbook = window.Flipbook || {};

    Flipbook = (function() {

        function Flipbook(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                frames: 1,
                frameRate: 500,
                fadeRate: 200,
                initialDelay: 0,
                lastFrameHold: 0,
                firstFrameHold: 0,
                infinite: true,
                cycles: 1,
                imgPre: null,
                imgPost: null,
                imgDelimiter: '?'
            };

            _.initiated = new Date();
            _.$initialFrame = $(element);
            _.$flipper = null;

            dataSettings = $(element).data('flipbook') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.init();
        }

        return Flipbook;
    }());

    Flipbook.prototype.init = function() {
        var _ = this;

        if (!_.$flipper && _.$initialFrame.is('img') && _.$initialFrame.attr('src')) {
            _.nest();
            _.animate();
        }

    };



    Flipbook.prototype.nest = function() {
        var _ = this;

        _.$initialFrame.addClass('img-animation__initial-frame');
        _.$initialFrame.wrap('<span class="img-animation__wrapper"></span>');
        _.$flipper = _.$initialFrame.parent();
    };



    Flipbook.prototype.animate = function() {
        var _ = this;

        var imageSources = _.getImageSources();
        _.preload(imageSources, function() {
            for (var i = 0; i < imageSources.length; i++) {
                _.$flipper.append('<img class="img-animation__frame" src="' + imageSources[i] + '">');
            }
            _.calculateTiming();
            window.setTimeout(function() { _.flip(_); }, _.options.initialDelay);
        });
    };

    Flipbook.prototype.calculateTiming = function() {
        var _ = this;

        if (_.options.fadeRate > _.options.frameRate) _.options.fadeRate = _.options.frameRate;
        _.options.frameRate -= _.options.fadeRate;
        _.options.initialDelay += _.options.frameRate;

        var now = new Date();
        var elapsed = now - _.initiated;
        if (elapsed < _.options.initialDelay) {
            _.options.initialDelay -= elapsed;
        } else {
            _.options.initialDelay = 0;
        }
    };

    Flipbook.prototype.getImageSources = function(pre, post) {
        var _ = this;

        var splitRegExp = new RegExp('(?=\\' + _.options.imgDelimiter + ')', 'g');
        var initialFrameSource = _.$initialFrame.attr('src').split(splitRegExp);
        var imgPre = _.options.imgPre || initialFrameSource[0];
        if (imgPre.slice(-2) === '-0') imgPre = imgPre.slice(0, -1);
        var imgPost = _.options.imgPost || initialFrameSource[1] || '';

        var imageSources = [];
        for (var i = 1; i < _.options.frames; i++) {
            imageSources.push(imgPre + i + imgPost);
        }
        return imageSources;
    };

    Flipbook.prototype.preload = function(images, callback) {
        var _ = this;
        if (!(images instanceof Array)) images = [images];
        var loaded = [];
        var addToLoaded = function() {
            loaded.push(this);
            if (loaded.length === images.length) callback();
        };
        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.onload = addToLoaded;
            img.src = images[i];
        }
    };

    Flipbook.prototype.flip = function(context) {
        var _ = context;

        var $activeFrame = _.$flipper.find('.img-animation__initial-frame, .active-frame').eq(-1);
        var $followingImage = $activeFrame.next();
        if ($followingImage.length) {
            $followingImage.fadeIn(_.options.fadeRate, function() {
                $followingImage.addClass('active-frame');
                window.setTimeout(function() { _.flip(_); }, (_.options.frameRate));
            });
        } else {
            if (_.options.infinite || _.options.cycles > 1) {
                _.options.cycles--;
                _.$flipper.find('.active-frame').not($activeFrame).removeClass('active-frame').hide();
                window.setTimeout(function() {
                    $activeFrame.fadeOut(_.options.fadeRate, function() {
                        $activeFrame.removeClass('active-frame');
                        window.setTimeout(function() {
                            window.setTimeout(function() {
                                _.flip(_);
                            }, (_.options.firstFrameHold));
                        }, (_.options.frameRate));
                    });
                }, (_.options.lastFrameHold));
            }
        }
    };
    
    $.fn.flipbook = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].flipbook = new Flipbook(_[i], opt);
            else
                ret = _[i].flipbook[opt].apply(_[i].flipbook, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };
}));
