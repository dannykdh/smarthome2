var SmartHomeUI = (function($) {
	"use strict";

	var win = window, $win = $(win), doc = win.document, $doc = $(doc), body, $body,
		BROWSER_NAMES = {CHROME: 'Chrome', MSIE: 'MSIE', FIREFOX: 'Firefox', SAFARI: 'Safari', OPERA: 'Opera'},
		browser, components, dialog = {}, dialogs = [],
		ZINDEX_LAYER = 1900, ZINDEX_DIALOG = 2000, ZINDEX_GAP = 1000;

	browser = (function() {
		var t,
			u = navigator.userAgent,
			m = u.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

		if (/trident/i.test(m[1])) {
			t = /\brv[ :]+(\d+)/g.exec(u) || [];
			return {name: BROWSER_NAMES.MSIE, version: t[1] || '', NAMES: BROWSER_NAMES};
		}
		if (m[1] === BROWSER_NAMES.CHROME && (t = u.match(/\b(OPR|Edge)\/(\d+)/))) {
			t = t.slice(1);
			return {name: t[0].replace('OPR', BROWSER_NAMES.OPERA), version: t[1], NAMES: BROWSER_NAMES};
		}
		m = m[2] ? [m[1], m[2]] : [navigator.appName, navigator.appVersion, '-?'];

		if (t = u.match(/version\/(\d+)/i)) {
			m.splice(1, 1, t[1]);
		}
		return {name: m[0], version: m[1], NAMES: BROWSER_NAMES};
	})();

	browser.canSupportHtml5Element = function() {
		var v = parseInt(this.version, 10);

		if (isNaN(v)) {
			return true;
		}

		switch (this.name) {
		case BROWSER_NAMES.CHROME:
			return v >= 14;
		case BROWSER_NAMES.MSIE:
			return v >= 9;
		case BROWSER_NAMES.FIREFOX:
			return v >= 7;
		case BROWSER_NAMES.SAFARI:
			return v >= 5;
		case BROWSER_NAMES.OPERA:
			return v >= 11;
		default :
			return true;
		}
	};

	if (!browser.canSupportHtml5Element()) {
		doc.createElement('header');
		doc.createElement('section');
		doc.createElement('footer');
		doc.createElement('nav');
		doc.createElement('aside');
	}

	function isFunction(fn) {
		return typeof fn === 'function';
	}

	function pushDialog(dialog) {
		dialogs.push(dialog);
	}

	function countDialog() {
		return dialogs.length;
	}

	function calcNewZIndexOfLayer(count) {
		return count * ZINDEX_GAP + ZINDEX_LAYER;
	}

	function calcNewZIndexOfDialog(count) {
		return count * ZINDEX_GAP + ZINDEX_DIALOG;
	}

	function getDialog() {
		return dialogs[dialogs.length - 1];
	}

	function popDialog() {
		return dialogs.pop();
	}

	function allowBubbleClickEvent(ev) {
		return  ($.inArray(ev.target.type || '', ['submit', 'image', 'checkbox']) >= 0) ||
			($.inArray(ev.target.tagName.toLowerCase() || '', ['label', 'a']) >= 0);
	}

	function createBlockLayer() {
		var layer = doc.createElement('div');
		layer.className = 'block-layer';

		$(layer).on('wheel', function() {
			return components.length < 1;
		}).on('click', function(ev) {
			return allowBubbleClickEvent(ev);
		});

		return layer;
	}

	function onOpenDefault() {
		// DO NOTHING
	}

	function onCloseDefault(context, finish) {
		finish();
	}

	function isDialogOpened() {
		return countDialog() > 0;
	}

	function createDialog(id) {
		var el, tmpl = doc.getElementById(id);

		if (!tmpl) {
			throw new Error('Not found template matched to ' + id);
		}

		$(el = $($.trim(tmpl.innerText || tmpl.text || tmpl.textContent).replace(/(>\s+<)/g, '><')).get(0)).on('click', function(ev) {
			return allowBubbleClickEvent(ev);
		}).find('.bt-dialog-close').on('click', function() {
			closeDialog();
		});

		return el;
	}

	function setDialog(config) {
		if (countDialog() < 1) {
			$body.addClass('has-dialog');
		}

		pushDialog({
			target: adjustButtonWidth(createDialog(config.templateId)),
			onOpen: config.onOpen || onOpenDefault,
			onClose: config.onClose || onCloseDefault
		});
	}

	function adjustButtonWidth(el) {
		var $buttons = $(el).find('.dialog-control-panel').find('button');

		if ($buttons.length > 1) {
			$buttons.css({width: 130});
		}

		return el;
	}

	function openDialog(config) {
		var layer, dialog, index;

		setDialog(config);
		dialog = getDialog();
		index = countDialog() - 1;
		layer = createBlockLayer();

		$(layer).css({
			zIndex: calcNewZIndexOfLayer(index)
		});
		$(dialog.target).css({
			zIndex: calcNewZIndexOfDialog(index)
		});

		layer.appendChild(dialog.target);
		body.appendChild(layer);

		dialog.onOpen(dialog.target);
		$win.trigger('dialogopen');
		$(layer).fadeIn();
		repositionDialog();
	}

	function replaceDialog(config) {
		var dialog = getDialog();

		dialog.onClose(dialog.target, function() {
			var old = popDialog(), oldEl = old.target, layer = oldEl.parentNode, dialog;
			setDialog(config);
			dialog = getDialog();
			layer.replaceChild(dialog.target, oldEl);
			dialog.onOpen(dialog.target);
			repositionDialog();
		});
	}

	function repositionDialog() {
		if (!isDialogOpened()) {
			return;
		}

		var $el = $(getDialog().target), $parent = $el.parent();

		$el.css({
			top: Math.round(($parent.height() - $el.outerHeight(true)) / 2),
			left: Math.round(($parent.width() - $el.outerWidth(true)) / 2)
		});
	}

	function closeDialog() {
		if (isDialogOpened()) {
			var dialog = getDialog();
			dialog.onClose(dialog.target, removeDialog);
		}
	}

	function removeDialog() {
		if (!isDialogOpened()) {
			return;
		}
		if (countDialog() < 2) {
			$body.removeClass('has-dialog');
		}

		$(popDialog().target.parentNode).fadeOut(function() {
			if (this.parentNode === body) {
				body.removeChild(this);
				dialog = {};	//개발 추가
				$win.trigger('dialogclose');
			}
		});
	}

	function calcFitSizeKeepingAspect(width, height, aspect, zoom) {
		zoom = zoom || 1;

		var newAspect = width / height;

		return aspect < 0 ? {
			width: width,
			height: height
		} : ((newAspect > aspect) ? {
			width: zoom * width,
			height: zoom * width / aspect
		} : {
			width: zoom * height * aspect,
			height: zoom * height
		});
	}

	function asArray(o) {
		return $.isArray(o) ? o : [o];
	}

	function resize() {
		$.each(components, function(i, c) {
			if (c.resize) {
				c.resize();
			}
		});

		repositionDialog();
	}

	function captureEscKeyDownEvent() {
		$(doc).on('keydown', function(ev) {

			// esc : keyCode === 27
			if ((ev || win.event).keyCode === 27) {
				closeDialog();
			}
		});
	}

	function captureWindowResizeEvent() {
		$win.on('resize', resize);
	}

	function scrollToExpandableTitle(hash) {
		if (hash) {
			setTimeout(function() {
				$doc.scrollTop($doc.scrollTop() - $('#gnb-holder').outerHeight(true));
			}, 100);
		}
	}

	function initExpandableIfExist() {
		var i = 0, accordion, $expandable = $('.expandable'), hash = win.location.hash;

		if (!$expandable.length) {
			return;
		}

		while (accordion = $expandable[i++]) {
			(function(accordion) {
				var $items = $(accordion).addClass('accordion').on('click', function(ev) {
					var $target = $(ev.target), $parent = $target.parent(), $item,
						$handle = $target.hasClass('expandable-handle') ? $target : ($parent.hasClass('expandable-handle') ? $parent : []);

					if (!$handle.length) {
						return;
					}

					$item = $handle.parent();

					if ($item.hasClass('expanded')) {
						$item.removeClass('expanded');
					} else {
						$items.removeClass('expanded');
						$item.addClass('expanded');
					}
				}).find('li');

				if (hash) {
					$items.filter(hash).addClass('expanded');
					scrollToExpandableTitle(location.hash);
				}
				$win.on('hashchange', function() {
					$items.removeClass('expanded').filter(location.hash).addClass('expanded');
					scrollToExpandableTitle(location.hash);
				});

			})(accordion);
		}
	}

	function initDynamicGnbIfHeadlineExists() {
		if (!$body.hasClass('has-headline')) {
			return;
		}

		$win.on('scroll', function(ev) {
			var scrollTop = $win.scrollTop();

			if (scrollTop < 1) {
				$body.removeClass('state-1').addClass('state-0');
			} else {
				$body.removeClass('state-0 state-1');
			}
		});
	}

	function validate(valid, $el, msg) {
		$el.parent().find('.err-msg').text(msg || '');

		if (valid) {
			$el.removeClass('invalidate').addClass('validate');
		} else if (!msg) {
			$el.removeClass('invalidate validate');
		} else {
			$el.removeClass('validate').addClass('invalidate');
		}
	}

	//개발 추가 시작 
	function validate_txt(validate, $el, msg) {
		U.invalidate($el);
		// 엘리먼트 생성
		var $errEl = $('.err-Txt');
		var $leng = $errEl.length;

		if ($leng > 0) {
			removeAddTxt($errEl);
		} 
		var $addTxt = $('<P>' + msg + '</P>');

		// 생성 엘리먼트 스타일 정의
		$addTxt
		.css("height", "17px")
		.css("margin-top", "10px")
		.css("line-height", "7px")
		.css("font-size", "11px")
		.css("color", "#f00")
		.css("text-align", "left").addClass('err-Txt');
		// 유효시간 지나고 이전, 다음 버튼 비활성화.
		// $('.bt-prev').prop("disabled", validate);
		// $('.bt-next').prop("disabled", validate);

		// 생성된 엘리먼트 삽입 위치
		$el.after($addTxt);		
	}	//개발 추가 끝

	return {
		$body: function() {
			return $body;
		},
		$doc: function() {
			return $doc;
		},
		$win: function() {
			return $win;
		},
		browser: browser,
		calcFitSizeKeepingAspect: calcFitSizeKeepingAspect,
		dialog: function(overlay, config) {
			if (typeof overlay !== 'boolean') {
				config = overlay;
				overlay = false;
			}

			if (!config) {
				closeDialog();
				return this;
			}

			if (!overlay && isDialogOpened()) {
				replaceDialog(config);
			} else {
				openDialog(config);
			}

			return this;
		},
		getRemainedTimeDisplay: function(context) {
			var $display = $(context || doc).find('.remained-time'),
				$time = $display.find('strong');

			return {
				show: function() {
					$display.show();
					return this;
				},
				hide: function() {
					$display.hide();
					return this;
				},
				setTime: function(mmss) {
					$time.text(mmss);
					return this;
				}
			};
		},
		init: function(comps) {
			body = doc.body;
			$body = $(body);

			captureEscKeyDownEvent();
			captureWindowResizeEvent();
			initExpandableIfExist();
			initDynamicGnbIfHeadlineExists();

			components = comps || [];

			if (!$.isArray(components)) {
				components = [components];
			}

			$.each(components, function(i, c) {
				if (c.init) {
					c.init();
				}
			});

			resize();

			return this;
		},
		invalidate: function(el, msg) {
			validate(false, $(el), msg);
			repositionDialog();
			return this;
		},
		validate: function(el) {
			validate(true, $(el));
			repositionDialog();
		},
		//개발 추가 시작
		invalidate_txt: function(validate, el, msg) {
			validate_txt(validate, $(el), msg);
			repositionDialog();
			return this;
		},		
		closeDialog: function() {
			closeDialog();
		}	//개발 추가 끝
	};

})(jQuery);