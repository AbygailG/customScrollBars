if(jQuery) {
	(function($) {
		$.fn.customScrollBar = function() {

			var csb = {};
			csb.$node = $(this);
			csb.$wrap = $('<div class="csb-wrap"></div>');
			csb.$track = $('<div class="csb-track"></div>');
			csb.$drag = $('<div class="csb-drag"></div>');
			var scrollbarWidth, scrollableHeight, trackHeight, visibleTrackHeight, draghandleHeight;
			var hideTimeout = null, drag = false;

			csb.getScrollbarWidth = function() {
				if(scrollbarWidth === undefined) {
					var $container = $('<div style="position: absolute; top: -200px; width: 137px; height: 137px; overflow: visible;"></div>');
					$('body').append($container);
					var $ruler = $('<div style="width: 100%;"></div>');
					$container.append($ruler);
					var firstWidth = $ruler.width();
					$ruler.remove();
					$container.css('overflow-y', 'scroll');
					$container.append($ruler);
					var secondWidth = $ruler.width();
					scrollbarWidth = firstWidth - secondWidth;
					$container.remove();
				}
				return scrollbarWidth;
			}();

			/**
			 * Updates the position of the trackbar so it will always show
			 */
			var updatePositioningOfTrack = function() {
				var right = 0;
				var windowWidth =  $(window).width();
				if (csb.$node.offset().left + csb.$node.width() > windowWidth) {
					right = Math.floor(csb.$node.offset().left + csb.$node.width() - windowWidth) + 'px';
				}
				if (csb.$track.css('right') != right) csb.$track.css('right', right);
			}

			/**
			 * Adds the custom scrollbar track element and adds a correctly determines
			 * the size of the draghandle and adds it to the track
			 *
			 * @param updating Boolean indicating if we only need to update our variables
			 *                 and sizes without changing the DOM structure of the track.
			 */
			var addCustomScrollbar = function(updating) {
				if(updating === undefined) updating = false;
				updatePositioningOfTrack();
				if(!updating) csb.$node.append(csb.$track);
				var areaScrollHeight = csb.$wrap.get(0).scrollHeight;
				var percentageVisibleContent = csb.$wrap.outerHeight() / areaScrollHeight;
				draghandleHeight = Math.floor(csb.$track.height() * percentageVisibleContent);
				scrollableHeight = areaScrollHeight - csb.$wrap.outerHeight();
				trackHeight = csb.$track.height();
				visibleTrackHeight = trackHeight - draghandleHeight;

				csb.$drag.height(draghandleHeight);

				if(!updating) csb.$track.append(csb.$drag);
			}

			/**
			 * Updates the draghandle position to match the scrollposition
			 * of the content
			 */
			var updatePosition = function() {
				csb.$drag.addClass('visible');
				var scrollTop = csb.$wrap.get(0).scrollTop;
				if(scrollTop <= 0) {
					csb.$drag.css('top', 0);
				} else if(scrollTop > 0) {
					csb.$drag.css('top', Math.floor((scrollTop / scrollableHeight) * visibleTrackHeight) +'px');
				}
				if(hideTimeout) clearTimeout(hideTimeout);
				hideTimeout = setTimeout(hideScrollbar, 750);
			}

			/**
			 * Returns the scrollbar to it's semi-invisible state
			 */
			var hideScrollbar = function() {
				csb.$drag.removeClass('visible');
			}

			/**
			 * Scrolls up or down a page when the user clicks the track
			 */
			var trackClick = function(e) {
				var overlap = trackHeight * 0.01;
				var dragTop = parseInt(csb.$drag.css('top'),10);
				if(dragTop > e.offsetY) {
					// Scroll up
					var scrollTo = dragTop - draghandleHeight + overlap;
				} else {
					// Scroll down
					var scrollTo = dragTop + draghandleHeight - overlap;
				}
				if (scrollTo < 0) scrollTo = 0;
				if (scrollTo > visibleTrackHeight) scrollTo = visibleTrackHeight;
				csb.$drag.css('top', Math.round( scrollTo )+'px');
				csb.$wrap.get(0).scrollTop = Math.round( (scrollTo / visibleTrackHeight) * scrollableHeight );
			}

			/**
			 * Prevents clicks on the draghandle from bubbling
			 * up to the track
			 */
			var dragClick = function(e) {
				e.stopPropagation();
			}

			/**
			 * Starts dragging of the draghandle. Sets the starting position of
			 * the drag.
			 *
			 * @param e
			 */
			var dragStart = function(e) {
				drag = {
					'startX': e.pageX,
					'startY': e.pageY,
					'scrollTop': csb.$wrap.get(0).scrollTop
				}
				$('body').unbind('mousemove.csb').on('mousemove.csb', dragMove);
				$('body').unbind('mouseup.csb').on('mouseup.csb', dragEnd);
				e.stopPropagation();
				e.preventDefault();
			}

			/**
			 * Updates the scrollposition of the wrap based on the mousemove of the
			 * draghandle.
			 *
			 * @param e
			 */
			var dragMove = function(e) {
				if (drag !== false) {
					var diff = e.pageY - drag.startY;
					if ((diff < 0 && drag.scrollTop <= 0) || (diff > 0 && drag.scrollTop > scrollableHeight)) return;

					var scrollTop = drag.scrollTop;
					var conversion = scrollableHeight / visibleTrackHeight;
					scrollTop += diff * conversion;
					if (scrollTo < 0) scrollTo = 0;
					if (scrollTo > visibleTrackHeight) scrollTo = visibleTrackHeight;

					csb.$wrap.get(0).scrollTop = scrollTop;
				}
				e.stopPropagation();
				e.preventDefault();
			}

			/**
			 * Cancels the dragging event.
			 *
			 * @param e
			 */
			var dragEnd = function(e) {
				drag = false;
				$('body').unbind('mousemove.csb');
				$('body').unbind('mouseup.csb');
				e.stopPropagation();
				e.preventDefault();
			}

			/**
			 * Adds the eventhandlers to update the scrollbar
			 * when a scroll takes place and to handle the showing/hiding
			 * of the scrollbar.
			 *
			 * Also adds the click and drag ahndling for mouse-control
			 */
			var setEventHandlers = function() {
				csb.$wrap.unbind('scroll.csb').on('scroll.csb', updatePosition);
				csb.$track.unbind('mouseover.csb').on('mouseover.csb', function() {
					csb.$drag.addClass('visible');
				});
				csb.$track.unbind('mouseout.csb').on('mouseout.csb', function() {
					csb.$drag.removeClass('visible');
				});
				csb.$track.unbind('click.csb').on('click.csb', trackClick);
				csb.$drag.unbind('click.csb').on('click.csb', dragClick);
				csb.$drag.unbind('mousedown.csb').on('mousedown.csb', dragStart);
			}

			/**
			 * Replaces the scrollbar for the set area.
			 * Moves the scrolling to the first child (should be the 'append-here' div)
			 * and adjusts it's styling to have the scrollbar hidden behind the overflow
			 *
			 * @return self
			 */
			var replaceScrollbar = function() {
				if(!csb.$node.length) throw('Undefined node, can\'t instantiate the scrollbar!');
				if(!scrollbarWidth) return;
				if(csb.$node.hasClass('csb-area')) csb.cleanNode();
				if(csb.$node.hasClass('csb-wrap')) return;

				csb.$node.addClass('csb-area');
				if(csb.$node.css('position') == 'static') csb.$node.css('position','relative');

				csb.$wrap.css({
					'right': '-'+ scrollbarWidth +'px',
					'padding-top': parseInt(csb.$node.css('padding-top'),10) + 'px',
					'padding-right': parseInt(csb.$node.css('padding-right'),10) + 'px',
					'padding-bottom': parseInt(csb.$node.css('padding-bottom'),10) + 'px',
					'padding-left': parseInt(csb.$node.css('padding-left'),10) + 'px'
				});
				csb.$node.wrapInner(csb.$wrap);
				// For some reason, we lost the link to the actual csb.$wrap... reconnect it!
				csb.$wrap = csb.$node.find('> .csb-wrap');

				addCustomScrollbar();

				if(visibleTrackHeight < 3) { return csb.cleanNode(); }

				updatePosition();
				setEventHandlers();

				return csb;
			}

			/**
			 * Calls the 'addCustomScrollbar' to update the sizing and internal
			 * variables. Adds the 'updating' parameter to make sure no actual
			 * DOM changes occur.
			 */
			csb.update = function() {
				addCustomScrollbar(true);
			}

			/**
			 * Cleans the current node. Removes the scrollbar,
			 * and clears the classes and CSS that were created
			 * for the scrolling.
			 *
			 * @return self
			 */
			csb.cleanNode = function() {
				if(!csb.$node.hasClass('csb-area')) return;
				csb.$wrap.css({
					'right': '',
					'padding': '',
				});
				csb.$node.css('position', '');
				csb.$node.removeClass('csb-area');
				csb.$node.append(csb.$node.find('> .csb-wrap > *'));
				csb.$node.find('.csb-wrap').remove();
				csb.$node.find('.csb-track').remove();
			}

			return replaceScrollbar();
		}
	})(jQuery);
}