(function () {
////////////////////

const tplBase = document.createElement('template');
tplBase.innerHTML = `
	<style>
	:host {
		all: initial;
		display: inline-block;
		font-family: inherit;
		background: #fff;
		border: 1px inset;
		border-radius: 2px;
		--osd-font-family: inherit;
		--plist-item-background: transparent;
		--plist-item-color: #226;
		--plist-hover-background: #eee;
		--plist-hover-color: #226;
		--plist-current-background: #456;
		--plist-current-color: #fff;
	}
	:host-context(:-webkit-full-screen) {
		border: none;
	}
	:host-context(:fullscreen) {
		border: none;
	}
	:host #elRoot {
		display: flex;
		user-select: none;
		width: 100%;
		height: 100%;
	}
	:host #elRoot > * {
		flex: 1 1 auto;
	}
	:host button {
		background: #0007;
		color: #fff;
		text-shadow: #000 0 1px;
		border: none;
		padding: 0.75em 1.5em;
	}
	:host #elVideoHolder {
		flex: 1 1 70%;
		width: 70%;
		position: relative;
		background: #000;
		color: #fff;
		text-shadow: #000 +1px +1px,
					 #000 -1px +1px,
					 #000 +1px -1px,
					 #000 -1px -1px,
					 #000 +0px +1px,
					 #000 -1px +0px,
					 #000 +1px -0px,
					 #000 -0px -1px,
					 #000 +2px +2px,
					 #000 -2px +2px,
					 #000 +2px -2px,
					 #000 -2px -2px,
					 #000 +0px +2px,
					 #000 -2px +0px,
					 #000 +2px -0px,
					 #000 -0px -2px;
		font-family: var(--osd-font-family);
	}
	
	:host #elPlist {
		display: block;
		flex: 1 1 30%;
		flex-direction: column;
		max-height: 100%;
		overflow: auto;
		box-sizing: border-box;
	}
	:host-context(:-webkit-full-screen) #elPlist {
		display: none;
	}
	:host-context(:fullscreen) #elPlist {
		display: none;
	}
	:host #elPlist > :first-child {
		margin-top: 0.5em;
	}
	:host #elPlist > :last-child {
		margin-bottom: 0.5em;
	}
	:host #elPlist section {
		margin: 0.5em 0;
	}
	:host #elPlist section[data-group]:before {
		content: attr(data-group);
		display: inline-block;
		width: 100%;
		box-sizing: border-box;
		padding: 0 1em;
		line-height: 0em;
		border-bottom: #999 1px dotted;
		margin: 0.75em 0;
		text-shadow: #fff +1px +1px,
					 #fff -1px +1px,
					 #fff +1px -1px,
					 #fff -1px -1px,
					 #fff +0px +1px,
					 #fff -1px +0px,
					 #fff +1px -0px,
					 #fff -0px -1px,
					 #fff +2px +2px,
					 #fff -2px +2px,
					 #fff +2px -2px,
					 #fff -2px -2px,
					 #fff +0px +2px,
					 #fff -2px +0px,
					 #fff +2px -0px,
					 #fff -0px -2px;
		white-space: nowrap;
	}
	:host #elPlist a {
		display: block;
		line-height: 1.5em;
		padding: 0em 1em;
		text-decoration: none;
		white-space: nowrap;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		background: var(--plist-item-background);
		color: var(--plist-item-color);
	}
	:host #elPlist a:hover {
		background: var(--plist-hover-background);
		color: var(--plist-hover-color);
	}
	:host #elPlist a.current {
		background: var(--plist-current-background);
		color: var(--plist-current-color);
	}
	:host #elPlist a:after {
		content: attr(data-comment);
		margin-left: 1em;
	}
	:host #elPlist a[data-duration-text]:before {
		content: attr(data-duration-text);
		float: right;
		color: #789;
	}
	:host #elPlist a[data-error] {
		color: #c33;
	}
	:host #elPlist hr {
		display: block;
		margin: 0.5em 1em;
		border: none;
		border-bottom: #f60 1px dotted;
	}
	
	:host #elVideo {
		display: block;
		width: 100%;
		height: 100%;
	}
	
	:host #elVideoOverlay {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: #000;
		pointer-events: none;
		mix-blend-mode: multiply;
		opacity: 0;
	}
	:host-context(:-webkit-full-screen) #elVideoOverlay {
		font-size: 3vmin;
	}
	:host-context(:fullscreen) #elVideoOverlay {
		font-size: 3vmin;
	}
	
	:host #elControls {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		margin: 0;
		padding: 1rem;
		background: linear-gradient(to bottom, #0000 0%, #000c 100%);
		user-select: none;
		pointer-events: none;
	}
	
	:host #elCaption {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		margin: 0;
		padding: 1rem;
		font-weight: normal;
		font-size: 1.5em;
		white-space: pre-line;
		pointer-events: none;
	}
	:host #elCaption:first-line {
		font-size: 150%;
	}
	
	:host #elOsdIcon {
		pointer-events: none;
		position: absolute;
		left: 1rem;
		right: 1rem;
		top: 50%;
	}
	:host #elOsdIcon > * {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 30%;
		transform: translate(-50%, -50%);
		background: #0007;
		border-radius: 50%;
		--z-index: 2;
		
		opacity: 0;
		transition: all 0.6s ease;
	}
	:host #elOsdIcon > * > svg {
		display: block;
		width: 100%;
	}
	:host #elOsdIcon > * > svg.whiteIcon {
		fill: #fff;
	}
	:host #elOsdIcon > .show {
		transition: none;
		opacity: 1;
		--z-index: 1;
	}
	:host #elOsdIcon > .show ~ * {
		transition: none;
		opacity: 0;
		z-index: 0;
	}
	:host #elOsdIcon > [data-name="spinnerProgress"].show {
		pointer-events: all;
	}
	
	:host #elSpinnerProgress {
		cursor: pointer;
	}
	:host #elSpinnerProgressCircle {
		fill: none;
		stroke: #fff;
		stroke-width: 10;
		r: 42;
		stroke-dasharray: 314 314;
		transform-origin: 50% 50%;
		transform: rotate(-90deg);
	}
	:host #elOsdIcon > .show #elSpinnerProgressCircle {
		animation: elSpinnerProgressAnim 5s linear;
	}
	@keyframes elSpinnerProgressAnim {
		000% { stroke-dashoffset: 314; }
		100% { stroke-dashoffset: 0; }
	}
	
	:host #elInfo {
		position: absolute;
		bottom: 8rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: 2.25em;
		text-align: center;
		pointer-events: none;
	}
	
	:host #elVideoPreview {
		position: absolute;
		display: none;
		z-index: 9;
		bottom: 3em;
		left: 50%;
		width: 15em;
		transform: translateX(-50%);
		border-radius: 2px;
		background: #333;
		box-shadow: #222 0 1px 0 2px;
	}
	:host #elVideoPreview.show {
		display: block;
	}
	
	:host #elProgressBar {
		display: block;
		background: #464027;
		/*background: #fff;*/
		border-radius: 1em;
		padding: 0.25em 0.5em;
		box-shadow: #0007 0 1px 1px;
		position: relative;
		pointer-events: all;
	}
	:host #elProgressBar > * {
		pointer-events: none;
	}
	:host #elProgressBarValue {
		display: block;
		height: 0.5em;
		background: #eaea00;
		border-radius: inherit;
		width: 100%;
		padding: 0 0.25em;
		margin-left: -0.25em;
		position: relative;
	}
	:host #elProgressBarValue:after {
		content: '';
		position: absolute;
		width: 1.5em;
		height: 1.5em;
		background: #ee5233;
		border-radius: 50%;
		top: -0.5em;
		right: -0.5em;
		border: #fff 0.25em solid;
		box-sizing: border-box;
		box-shadow: #0007 0 1px 2px;
		z-index: 2;
		
		transition: opacity 0.2s ease;
		opacity: 0;
	}
	
	:host #elProgressBar:hover #elProgressBarValue:after,
	:host #elProgressBar.cap #elProgressBarValue:after {
		opacity: 1;
	}
	
	:host #elProgressBarRanges {
		position: absolute;
		display: block;
		left: 0.25em;
		top: 0.25em;
		height: 0.5em;
		right: 0.25em;
		border-radius: inherit;
		box-sizing: border-box;
		overflow: hidden;
		left: 0.35em;
		top: 0.35em;
		height: 0.25em;
		right: 0.35em;
	}
	:host #elProgressBarRanges > * {
		position: absolute;
		background: #dedede77;
		background: #fff3;
		height: 100%;
		display: block;
		mix-blend-mode: difference;
	}
	
	:host #elTimeText {
		font-size: 1.5em;
		text-align: right;
		margin-bottom: 1rem;
		pointer-events: none;
	}
	:host #elTimeText #elCurrentTimeText:after {
		content: ' / ';
	}
	
	:host [data-icon]:before {
		content: '';
		display: block;
		padding-top: 100%;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: contain;
	}
	:host [data-icon="volUp"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="volDn"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="skipPrev"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="skipNext"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="seekFwd"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="seekBack"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="play"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="volOff"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="pause"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
	:host [data-icon="error"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'); }
	:host [data-icon="stop"]:before { background-image: url('data:image/svg+xml;utf8,<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h12v12H6z"/></svg>'); }
	
	:host .fading {
		transition: none;
		opacity: 1;
		visibility: visible;
	}
	:host .fadeOut .fading {
		transition: all 1.5s ease;
		opacity: 0;
		visibility: hidden;
	}
	:host .fading.fadeIn {
		transition: none;
		opacity: 1;
		visibility: visible;
	}
	:host .hideCursor {
		cursor: none;
	}
	</style>
	<div id="elRoot">
		<div id="elVideoHolder" class="fadeOut">
			<video id="elVideo" preload="auto"></video>
			<div id="elVideoOverlay"></div>
			<h2 id="elCaption" class="fading"></h2>
			<div id="elOsdIcon">
				<div data-name="spinnerProgress">
					<svg id="elSpinnerProgress" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle id="elSpinnerProgressCircle" cx="50" cy="50" r="50"/></svg>
				</div>
				<div data-name="volUp" data-icon="volUp"></div>
				<div data-name="volDn" data-icon="volDn"></div>
				<div data-name="skipPrev" data-icon="skipPrev"></div>
				<div data-name="skipNext" data-icon="skipNext"></div>
				<div data-name="seekFwd" data-icon="seekFwd"></div>
				<div data-name="seekBack" data-icon="seekBack"></div>
				<div data-name="play" data-icon="play"></div>
				<div data-name="volOff" data-icon="volOff"></div>
				<div data-name="pause" data-icon="pause"></div>
				<div data-name="error" data-icon="error"></div>
				<div data-name="stop" data-icon="stop"></div>
			</div>
			<div id="elInfo" class="fading"></div>
			<div id="elControls" class="fading">
				<div id="elTimeText">
					<span id="elCurrentTimeText">-:--</span>
					<span id="elDurationText">-:--</span>
				</div>
				<div id="elProgressBar">
					<span id="elProgressBarValue"></span>
					<span id="elProgressBarRanges"></span>
				</div>
			</div>
		</div>
		<div id="elPlist"></div>
	</div>
`;

function dispatchEvent(element, eventType, detail) {
	element.dispatchEvent(new CustomEvent(eventType, {
		detail: detail,
		bubbles: true,
	}));
}

function parseUrl(s, origin) {
	var res = new URL(s, origin);
	res.file = (/([^/\\]+)$/.exec(res.pathname) || [])[1] || '';
	var m = /^(.*)(\.[^.]+)?$/.exec(res.file);
	res.filename = m ? m[1] : res.file;
	res.fileext = m && m[2] || '';
	return res;
}

function parseM3uPlaylist(s, plist) {
	var res = [];
	var infoRe = /^(#EXTINF)(?::(-?\d+))?[\s,]+(?:(.*?)(?:\s+-\s+|\s*[\u2013\u2014]\s*))?(.*)$/
	var info = null;
	var lines = s.split(/\s*(?:[\r\n]\s*)+/);
	var prevGroup = null;
	for (var i = 0; i < lines.length; i++) {
		s = lines[i];
		if (!s)
			continue;
		
		if (s[0] == '#') {
			info = infoRe.exec(s);
		}
		else {
			var url = s;
			try {
				var parsed = parseUrl(url, document.location.origin);
			}
			catch (error) {
				console.warn(error);
				continue;
			}
			var filenameInfo = parsed.filename.match(/^(?:(.*?)(?:\s+-\s+|\s*[\u2013\u2014]\s*))?(.*)$/);
			var group = info && (info[3] || '').trim() || (filenameInfo[1] || '').trim() || '';
			var groupDiv = null;
			if (!group)
				groupDiv = null;
			else if (group == prevGroup) {
				groupDiv = plist.children[plist.children.length - 1];
			}
			else if (group != prevGroup) {
				groupDiv = document.createElement('section');
				groupDiv.dataset.group = (info[3] || '').trim();
				plist.appendChild(groupDiv);
			}
			prevGroup = group;
			
			var a = document.createElement('a');
			a.href = url;
			a.textContent = info && info[4] || filenameInfo[2].trim() || parsed.file;
			a.dataset.group = group;
			/*
			for (var k in parsed) {
				a.setAttribute('data-url-' + k, (parsed[k].toString() || '').trim());
			}
			*/
			if (info) {
				a.dataset.infoSign = (info[1] || '').trim();
				a.dataset.infoDuration = (info[2] || '').trim();
				a.dataset.infoGroup = (info[3] || '').trim();
				a.dataset.infoTitle = (info[4] || '').trim();
				var durationSeconds = +info[2];
				if (!isNaN(durationSeconds) && durationSeconds > 0) {
					a.dataset.durationText = formatTime(durationSeconds);
				}
			}
			if (groupDiv)
				groupDiv.appendChild(a);
			else
				plist.appendChild(a);
			
			info = null;
		}
	}
	return res;
}

function formatTime(t) {
	if (isNaN(t))
		return '-:--';
	t = t | 0;
	var h = t / 3600 | 0;
	var m = (t % 3600) / 60 | 0;
	if (h && m < 10)
		m = '0' + m;
	var s = t % 60;
	if (s < 10)
		s = '0' + s;
	return (!h ? '' : h + ':') + (m + ':') + (s);
}

function MouseSequence(context) {
	context = context || document;
	/**
	 * CustomEvent polyfill
	 * @see https://developer.mozilla.org/ru/docs/Web/API/CustomEvent/CustomEvent
	 */
	var CustomEvent = window.CustomEvent;
	if (typeof CustomEvent !== 'function') {
		CustomEvent = function (event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		}
		CustomEvent.prototype = window.Event.prototype;
	}
	
	var _this = this;
	this.disableContextMenu = true;
	this.sequenceDelay = 300;
	var sequenceTimer = null;
	var sequence = [];
	var down = [false, false, false];
	down.any = function () {
		return this[0] || this[1] || this[2] || false;
	};
	
	function onMouseDown(event) {
		down[event.button] = true;
		if (sequenceTimer !== null)
			clearTimeout(sequenceTimer);
		sequenceTimer = setTimeout(sequenceCleanup, _this.sequenceDelay);
		
		event.target.dispatchEvent(new CustomEvent('mousesequence', {
			detail: {
				down: down,
				button: event.button,
				sequence: [],
				wheelY: 0,
			},
			bubbles: true,
			cancelable: false,
		}));
		
		sequence.push(event.button);
		// event.preventDefault();
	}
	
	function onMouseUp(event) {
		down[event.button] = false;
		
		event.target.dispatchEvent(new CustomEvent('mousesequence', {
			detail: {
				down: down,
				button: event.button,
				sequence: sequence,
				wheelY: 0,
			},
			bubbles: true,
			cancelable: false,
		}));
		
		if (sequenceTimer === null) {
			sequence = [];
			// console.log('clean', 'mouseup');
		}
		// event.preventDefault();
	}
	
	function onMouseWheel(event) {
		var mouseSequenceEvent = new CustomEvent('mousesequence', {
			detail: {
				down: down,
				button: -1,
				sequence: [],
				wheelY: event.deltaY,
			},
			bubbles: true,
			cancelable: true,
		});
		event.target.dispatchEvent(mouseSequenceEvent);
		if (mouseSequenceEvent.defaultPrevented) {
			event.preventDefault();
		}
	}
	
	function onContextMenu(event) {
		if (_this.disableContextMenu) {
			if (!_this.disableContextMenu.indexOf) {
				event.preventDefault();
				return false;
			}
			else {
				var el = event.target;
				do {
					if (_this.disableContextMenu.indexOf(el) > -1) {
						event.preventDefault();
						return false;
					}
				} while (el = el.parentElement);
			}
		}
	}
	
	function cancelEvent(event) {
		event.preventDefault();
	}
	
	function sequenceCleanup() {
		clearTimeout(sequenceTimer);
		sequenceTimer = null;
		if (!down.any()) {
			sequence = [];
			// console.log('clean', 'timeout');
		}
	}
	
	context.addEventListener('mousedown', onMouseDown);
	context.addEventListener('mouseup', onMouseUp);
	context.addEventListener('mousewheel', onMouseWheel);
	context.addEventListener('contextmenu', onContextMenu);
	context.addEventListener('click', cancelEvent);
	context.addEventListener('dblclick', cancelEvent);
	
	this.disable = function () {
		context.removeEventListener('mousedown', onMouseDown);
		context.removeEventListener('mouseup', onMouseUp);
		context.removeEventListener('mousewheel', onMouseWheel);
		context.removeEventListener('contextmenu', onContextMenu);
		context.removeEventListener('click', cancelEvent);
		context.removeEventListener('dblclick', cancelEvent);
	};
}

function updateBufferedRanges(video, progressBarRanges) {
	for (var i = 0; i < video.buffered.length; i++) {
		if (!progressBarRanges.children[i]) {
			progressBarRanges.appendChild(document.createElement('span'));
		}
		var rangeItem = progressBarRanges.children[i];
		var start = video.buffered.start(i) / video.duration;
		var end = video.buffered.end(i) / video.duration;
		if (end - start < 0.01) {
			continue;
		}
		rangeItem.style.left = (100 * start) + '%';
		rangeItem.style.width = (100 * (end-start)) + '%';
	}
	while (progressBarRanges.children[i]) {
		progressBarRanges.removeChild(progressBarRanges.children[i]);
	}
}

function getPadding(el, side) {
	return parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-' + side));
}


class HTMLListPlayerElement extends HTMLElement {
	static get observedAttributes() {
		return ['playlist', 'current', 'caption'];
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}
		else if (this.constructor.observedAttributes.indexOf(name) > -1) {
			this[name] = newValue;
		}
	}
	
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(tplBase.content.cloneNode(true));
		
		// TODO: hardcode ided elements
		var els = this.shadowRoot.querySelectorAll('[id]');
		for (var i = els.length - 1; i >= 0; i--) {
			this['$$' + els[i].id] = els[i];
		}
		
		this.$$elVideoHolder = this.shadowRoot.getElementById('elVideoHolder');
		this.$$elVideo = this.shadowRoot.getElementById('elVideo');
		this.$$elPlist = this.shadowRoot.getElementById('elPlist');
		
		////////////////////
		this.$$onPlistClick = this.$$onPlistClick.bind(this);
		this.$$onVideoHolderMouseMove = this.$$onVideoHolderMouseMove.bind(this);
		this.$$onVideoMouseSequence = this.$$onVideoMouseSequence.bind(this);
		this.$$onVideoTimeUpdate = this.$$onVideoTimeUpdate.bind(this);
		this.$$onProgressBarMouseDown = this.$$onProgressBarMouseDown.bind(this);
		this.$$onWindowMouseUp = this.$$onWindowMouseUp.bind(this);
		this.$$onWindowMouseMove = this.$$onWindowMouseMove.bind(this);
		this.$$onVideoDurationChange = this.$$onVideoDurationChange.bind(this);
		this.$$onVideoProgress = this.$$onVideoProgress.bind(this);
		this.$$onVideoEnded = this.$$onVideoEnded.bind(this);
		this.$$onKeyDown = this.$$onKeyDown.bind(this);
		this.$$onSpinnerProgressClick = this.$$onSpinnerProgressClick.bind(this);
		
		this.$$elVideoOverlay.style.opacity = 0;
	}
	
	connectedCallback() {
		this.caption = this.getAttribute('caption') || '';
		var current = parseInt(this.getAttribute('current'));
		this.tabIndex = parseInt(this.getAttribute('tabIndex')) || 0;
		this.playlist = this.getAttribute('playlist') || '';
		this.current = -1;
		this.current = isNaN(current) ? -1 : current;
		this.volume = this.getAttribute('volume') || '1';
		this.currentTime = 0;
		
		this.$$elPlist.addEventListener('click', this.$$onPlistClick);
		
		this.$$elVideoHolder.addEventListener('mousemove', this.$$onVideoHolderMouseMove);
		
		this.$$mouseSequence = new MouseSequence(this.$$elVideo);
		this.$$elVideo.addEventListener('mousesequence', this.$$onVideoMouseSequence);
		
		this.$$elVideo.addEventListener('timeupdate', this.$$onVideoTimeUpdate);
		this.$$elVideo.addEventListener('durationchange', this.$$onVideoDurationChange);
		this.$$elVideo.addEventListener('progress', this.$$onVideoProgress);
		this.$$elVideo.addEventListener('ended', this.$$onVideoEnded);
		
		this.addEventListener('keydown', this.$$onKeyDown);
		this.$$elSpinnerProgress.addEventListener('click', this.$$onSpinnerProgressClick);
		
		this.$$elProgressBar.addEventListener('mousedown', this.$$onProgressBarMouseDown);
		window.addEventListener('mouseup', this.$$onWindowMouseUp);
		window.addEventListener('mousemove', this.$$onWindowMouseMove);
		this.$$showOsdIcon('play');
		
		var elVideoEvents = [
			'volumechange',
			'play',
			'pause',
			'timeupdate',
			'durationchange',
			'progress',
			'ended',
		];
		this.$$proxyEvents = {};
		for (var i = 0; i < elVideoEvents.length; i++) {
			this.$$proxyEvents[elVideoEvents[i]] = dispatchEvent.bind(null, this, elVideoEvents[i]);
			this.$$elVideo.addEventListener(elVideoEvents[i], this.$$proxyEvents[elVideoEvents[i]]);
		}
	}
	disconnectedCallback() {
		this.$$elPlist.removeEventListener('click', this.$$onPlistClick);
		this.$$mouseSequence.disable();
		this.$$mouseSequence = null;
	}
	
	////////////////////
	
	get playlist() {
		return this.getAttribute('playlist');
	}
	set playlist(value) {
		this.$$elPlist.innerHTML = '';
		parseM3uPlaylist(value, this.$$elPlist);
		var currentHref = this.$$elsPlistA && this.$$elsPlistA[this.current];
		this.$$elsPlistA = Array.prototype.slice.call(this.$$elPlist.querySelectorAll('a'), 0);
		this.setAttribute('playlist', value);
		// this.current = -1; // TODO
	}
	
	get length() {
		return this.$$elsPlistA && this.$$elsPlistA.length;
	}
	
	get current() {
		return parseInt(this.getAttribute('current'));
	}
	set current(value) {
		value = typeof value === 'number' ? value | 0 : parseInt(value);
		if (isNaN(value)) {
			value = -1;
		}
		this.setAttribute('current', value);
		for (var i = this.$$elsPlistA.length - 1; i >= 0; i--) {
			this.$$elsPlistA[i].classList.remove('current');
		}
		var a = this.$$elsPlistA[value];
		if (!a) {
			this.$$elVideo.src = '';
			return;
		}
		a.classList.add('current');
		a.scrollIntoViewIfNeeded(false);
		if (this.$$elVideo.src !== a.href) {
			var paused = this.paused;
			this.$$elVideo.src = a.href;
			if (!paused) {
				this.play();
			}
			this.caption = (!a.dataset.group ? "" : a.dataset.group + "\u00a0\u2014 ") + a.textContent
				+ "\n" + (value+1).toString() + "/" + this.length;
		}
	}
	
	get volume() {
		return this.$$elVideo.volume;
	}
	set volume(value) {
		// this.$$elVideo.volume = value = this.$$calcVolumeValue(value, 0);
		this.$$elVideo.volume = Math.max(0, Math.min(value, 1));
		value = this.$$elVideo.volume;
		var icon = "\uD83D\uDD0A";
		if (value === 0)
			icon = "\uD83D\uDD07";
		else if (value < 0.05)
			icon = "\uD83D\uDD08";
		else if (value < 0.50)
			icon = "\uD83D\uDD09";
		var valueText = (value * 100).toFixed(value < 0.1 ? 1 : 0);
		this.$$showTempInfo(icon + " " + valueText);
		if (!value)
			this.$$showOsdIcon('volOff');
		else
			this.$$hideOsdIcon('volOff');
	}
	
	get lightness() {
		return 1 - parseFloat(this.$$elVideoOverlay.style.opacity);
	}
	set lightness(value) {
		value = Math.max(0.1, Math.min(value, 1));
		dispatchEvent(this, 'lightnesschange', {
			oldValue: this.lightness,
			newValue: value,
		});
		this.$$elVideoOverlay.style.opacity = 1 - value;
		var icon = "\uD83D\uDD06";
		if (value < 0.5)
			icon = "\uD83D\uDD05";
		this.$$showTempInfo(icon + " " + (value * 100).toFixed(0));
	}
	
	get caption() {
		return this.$$elCaption.textContent;
	}
	set caption(value) {
		return this.$$elCaption.textContent = value;
	}
	
	get currentTime() {
		return this.$$elVideo.currentTime;
	}
	set currentTime(value) {
		this.$$onVideoTimeUpdate(null);
		return this.$$elVideo.currentTime = value;
	}
	
	get duration() {
		return this.$$elVideo.duration;
	}
	
	get paused() {
		return this.$$elVideo.paused;
	}
	
	get scrollWidth() {
		return this.$$elPlist.scrollWidth;
	}
	get scrollHeight() {
		return this.$$elPlist.scrollHeight;
	}
	
	get scrollLeft() {
		return this.$$elPlist.scrollLeft;
	}
	set scrollLeft(value) {
		return this.$$elPlist.scrollLeft = value;
	}
	
	get scrollTop() {
		return this.$$elPlist.scrollTop;
	}
	set scrollTop(value) {
		return this.$$elPlist.scrollTop = value;
	}
	
	get onscroll() {
		return this.$$elPlist.onscroll;
	}
	set onscroll(value) {
		return this.$$elPlist.onscroll = value;
	}
	
	scrollTo() {
		return this.$$elPlist.scrollTo.apply(this.$$elPlist, Array.prototype.slice.call(arguments, 0));
	}
	scrollBy() {
		return this.$$elPlist.scrollBy.apply(this.$$elPlist, Array.prototype.slice.call(arguments, 0));
	}
	scroll() {
		return this.$$elPlist.scroll.apply(this.$$elPlist, Array.prototype.slice.call(arguments, 0));
	}
	
	////////////////////
	
	exportPlaylist() {
		var res = '#EXTM3U\n\n';
		var reFileName = /([^/]*)(?:\.[^.]*)$/;
		for (var i = 0; i < this.$$elsPlistA.length; i++) {
			var a = this.$$elsPlistA[i];
			var durationSeconds = -1;
			var fullTitle = '';
			if (a.dataset.metaDuration > 0)
				durationSeconds = Math.round(a.dataset.metaDuration);
			else if (a.dataset.infoDuration > 0)
				durationSeconds = Math.round(a.dataset.infoDuration);
			fullTitle = a.dataset.infoGroup;
			if (a.dataset.infoTitle) {
				fullTitle += (fullTitle ? "\u00a0\u2014 " : "") + a.dataset.infoTitle;
			}
			if (!fullTitle) {
				fullTitle = (reFileName.exec(a.href) || ['', a.href])[1];
			}
			res += "#EXTINF:" + durationSeconds + " " + fullTitle + "\n" + a.href + "\n";
		}
		return res;
	}
	
	changeLightness(direction) {
		var d = 0;
		if (direction) {
			d = direction > 0 ? +0.05 : -0.05;
		}
		this.lightness += d;
	}
	
	changeVolume(direction) {
		this.volume = this.$$calcVolumeValue(this.volume, direction);
		if (direction > 0 && this.volume < 1)
			this.$$blinkOsdIcon('volUp');
		else if (direction < 0 && this.volume > 0)
			this.$$blinkOsdIcon('volDn');
	}
	
	play() {
		this.$$cancelPlayNextDelayed();
		if (this.current < 0) {
			this.current = 0;
		}
		var a = this.$$elsPlistA[this.current];
		var $$this = this;
		// this.$$hideOsdIcon('pause');
		return this.$$elVideo.play()
			.then(function (result) {
				if (a) {
					delete a.dataset.error;
				}
				updateBufferedRanges($$this.$$elVideo, $$this.$$elProgressBarRanges);
				$$this.$$blinkOsdIcon('play');
				return result;
			})
			.catch(function (error) {
				if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
					console.error(error);
					if (a) {
						a.dataset.error = (error || '').toString();
					}
					$$this.$$blinkOsdIcon('error');
					$$this.$$playNextDelayed(1000);
				}
				return Promise.reject(error);
			})
		;
	}
	pause() {
		this.$$cancelPlayNextDelayed();
		this.$$showOsdIcon('play');
		this.$$elVideo.pause();
	}
	playPause() {
		if (this.$$elVideo.paused)
			this.play();
		else
			this.pause();
	}
	stop() {
		this.$$blinkOsdIcon('stop');
		this.pause();
		this.currentTime = 0;
	}
	
	playPrev() {
		if (this.current <= 0) {
			return false;
		}
		this.$$blinkOsdIcon('skipPrev');
		this.current--;
		this.play();
		return true;
	}
	playNext() {
		if (this.current >= this.length - 1) {
			return false;
		}
		this.$$blinkOsdIcon('skipNext');
		this.current++;
		this.play();
		return true;
	}
	
	showShorthand() {
		// TODO
	}
	hideShorthand() {
		// TODO
	}
	
	seek(direction, fast) {
		if (direction < 0 && this.currentTime > 0)
			this.$$blinkOsdIcon('seekBack');
		else if (direction > 0 && this.currentTime < this.duration)
			this.$$blinkOsdIcon('seekFwd');
		this.currentTime += (direction > 0 ? 2 : -2) * (fast ? 2 : 1);
	}
	
	toggleFullScreen() {
		if (!document.webkitFullscreenElement)
			this.webkitRequestFullScreen();
		else if (document.webkitFullscreenElement === this)
			document.webkitCancelFullScreen();
	}
	
	////////////////////
	
	$$showTempInfo(s, timeout) {
		clearTimeout(this.$$showTempInfo.tmr);
		if (this.$$elInfo.dataset.persistentText === undefined) {
			this.$$elInfo.dataset.persistentText = this.$$elInfo.textContent;
		}
		this.$$elInfo.textContent = s;
		this.$$elInfo.classList.add('fadeIn');
		this.$$showTempInfo.tmr = setTimeout(this.$$showTempInfoTimeout.bind(this), timeout || 2000);
	}
	$$showTempInfoTimeout() {
		clearTimeout(this.$$showTempInfo.tmr);
		this.$$showTempInfo.tmr = null;
		this.$$elInfo.textContent = this.$$elInfo.dataset.persistentText || '';
		delete this.$$elInfo.dataset.persistentText;
		this.$$elInfo.classList.remove('fadeIn');
	}
	
	$$showOsdIcon(iconName) {
		for (var i = this.$$elOsdIcon.children.length - 1; i >= 0; i--) {
			var el = this.$$elOsdIcon.children[i];
			if (el.dataset.name === iconName) {
				void el.offsetWidth;
				el.classList.add('show');
			}
		}
	}
	$$hideOsdIcon(iconName) {
		for (var i = this.$$elOsdIcon.children.length - 1; i >= 0; i--) {
			var el = this.$$elOsdIcon.children[i];
			if (iconName === '*' || el.dataset.name === iconName) {
				void el.offsetWidth;
				el.classList.remove('show');
			}
		}
	}
	$$blinkOsdIcon(iconName) {
		this.$$showOsdIcon(iconName);
		this.$$hideOsdIcon(iconName);
	}
	
	$$playNextDelayed(delay) {
		delay = delay || 5000;
		this.$$cancelPlayNextDelayed();
		if (this.current >= this.length - 1) {
			return false;
		}
		this.$$hideOsdIcon('*');
		this.$$elSpinnerProgressCircle.style.animationDuration = delay + 'ms';
		this.$$showOsdIcon('spinnerProgress');
		this.$$playNextDelayed.tmr = setTimeout(this.$$playNextDelayedInvoke.bind(this), delay);
		return true;
	}
	$$cancelPlayNextDelayed() {
		if (this.$$playNextDelayed.tmr && this.currentTime >= this.duration) {
			this.currentTime = this.duration * 0.95;
		}
		clearTimeout(this.$$playNextDelayed.tmr);
		this.$$playNextDelayed.tmr = null;
		this.$$hideOsdIcon('spinnerProgress');
		this.$$showOsdIcon('play');
	}
	$$playNextDelayedInvoke() {
		if (this.$$playNextDelayed.tmr) {
			this.playNext();
		}
		this.$$cancelPlayNextDelayed();
	}
	
	$$calcVolumeValue(value, direction) {
		value = +value;
		direction = direction || 0;
		if (direction) {
			direction = direction > 0 ? +1 : -1;
		}
		var cents = Math.round(value * 10000) / 100;
		var k = 1;
		if (cents < 5 || cents === 5 && direction < 0)
			k = 0.1;
		else if (cents < 10 || cents === 10 && direction < 0)
			k = 0.5;
		else if (cents < 20 || cents === 20 && direction < 0)
			k = 1.0;
		else if (cents < 50 || cents === 50 && direction < 0)
			k = 2.0;
		else
			k = 5.0;
		k /= 100;
		value += direction * k;
		if (value % k) {
			// value = Math.round(value / k * 100) * k / 100;
			value += (value % k > k / 2
				? +(k - value % k)
				: -(value % k)
			);
		}
		return Math.max(0, Math.min(value, 1));
	}
	
	////////////////////
	
	$$onKeyDown(event) {
		// console.log('$$onKeyDown', event.keyCode);
		if (event.keyCode === 37) {
			this.seek(-1, event.ctrlKey);
		}
		else if (event.keyCode === 39) {
			this.seek(+1, event.ctrlKey);
		}
		else if (event.keyCode === 40) {
			this.changeVolume(-1);
		}
		else if (event.keyCode === 38) {
			this.changeVolume(+1);
		}
		else if (event.keyCode === 32) {
			this.playPause();
		}
		else if (event.keyCode === 13 && event.altKey) {
			this.toggleFullScreen();
		}
	}
	
	$$onPlistClick(event) {
		if (event.target.tagName !== 'A') {
			return;
		}
		event.preventDefault();
		this.current = this.$$elsPlistA.indexOf(event.target);
		this.play();
	}
	
	$$onVideoHolderMouseMove(_) {
		clearTimeout(this.$$onVideoHolderMouseMove.tmr);
		this.$$elVideoHolder.classList.remove('hideCursor');
		this.$$elVideoHolder.classList.remove('fadeOut');
		this.$$onVideoHolderMouseMove.tmr = setTimeout(this.$$onVideoHolderMouseMoveTimeout.bind(this), 2000);
	}
	$$onVideoHolderMouseMoveTimeout() {
		this.$$elVideoHolder.classList.add('hideCursor');
		this.$$elVideoHolder.classList.add('fadeOut');
		clearTimeout(this.$$onVideoHolderMouseMove.tmr);
		this.$$onVideoHolderMouseMove.tmr = null;
	}
	
	$$onVideoMouseSequence(event) {
		// console.log(event.detail.button, event.detail.down, event.detail.sequence, event.detail.wheelY);
		// this.$$onVideoHolderMouseMove(event);
		if (event.detail.wheelY != 0) {
			if (event.detail.down[2])
				this.changeLightness(-event.detail.wheelY);
			else if (!event.detail.down.any())
				this.changeVolume(-event.detail.wheelY);
			event.preventDefault();
		}
		else if (this.$$elProgressBar.cap) {
			this.$$onProgressBarMouseDown(null);
		}
		else if (event.detail.button > -1) {
			var seqStr = event.detail.sequence.join(',');
			
			if (!event.detail.down.any()) {
				if (seqStr == '0' || seqStr == '0,0') {
					if (this.paused && this.$$playNextDelayed.tmr) {
						this.$$cancelPlayNextDelayed();
					}
					else {
						this.playPause();
						if (seqStr == '0,0') { // dblclick
							this.toggleFullScreen();
						}
					}
				}
				else if (seqStr == '1') {
					this.showShorthand();
				}
			}
			else if (event.detail.button == 0 && event.detail.down[2] && event.detail.down[0]) {
				this.seek(-1, seqStr == '0,0');
			}
			else if (event.detail.button == 2 && event.detail.down[0] && event.detail.down[2]) {
				this.seek(+1, seqStr == '0,0');
			}
		}
	}
	
	$$onVideoTimeUpdate(_) {
		if (!this.$$elProgressBar.cap) {
			this.$$elProgressBarValue.style.width = (!this.duration ? 0 : this.currentTime / this.duration) * 100 + '%';
		}
		this.$$elCurrentTimeText.textContent = formatTime(this.currentTime);
		// showOsdValue(formatTime(video.currentTime) + ' / ' + formatTime(video.duration), true);
	}
	
	$$onVideoDurationChange(event) {
		var s = formatTime(this.duration);
		this.$$elDurationText.textContent = s;
		var a = this.$$elsPlistA[this.current];
		if (a) {
			a.dataset.metaDuration = this.duration;
			a.dataset.durationText = s;
		}
	}
	
	$$onVideoProgress(event) {
		updateBufferedRanges(this.$$elVideo, this.$$elProgressBarRanges);
	}
	
	$$onVideoEnded(event) {
		if (this.$$elVideo.seeking || this.$$elProgressBar.cap)
			return;
		this.$$showOsdIcon('play');
		if (!this.$$playNextDelayed())
			this.stop();
	}
	$$onSpinnerProgressClick(event) {
		this.$$playNextDelayedInvoke();
	}
	
	$$onProgressBarMouseDown(event) {
		if (!event || this.$$elProgressBar.cap) {
			this.currentTime = this.$$elProgressBar.cap.time;
			this.$$elProgressBar.cap = null;
			return;
		}
		if (!this.duration || event.button !== 0)
			return;
		var paddingL = getPadding(this.$$elProgressBar, 'left');
		var paddingR = getPadding(this.$$elProgressBar, 'right');
		this.$$elProgressBar.cap = {
			time: this.currentTime,
			event: event,
			paused: this.paused,
			downX: event.offsetX - paddingL,
			width: this.$$elProgressBar.clientWidth - (paddingL + paddingR),
		};
		this.$$elProgressBar.classList.add('cap');
		event.stopPropagation();
		// console.log(this.$$elProgressBar.cap.downX, this.$$elProgressBar.cap.width, event.offsetX, event.clientX);
		this.$$onWindowMouseMove(event);
	}
	$$onWindowMouseUp(event) {
		if (this.$$elProgressBar.cap) {
			this.$$elProgressBar.cap = null;
			this.$$elProgressBar.classList.remove('cap');
			if (this.currentTime >= this.duration) {
				this.$$onVideoEnded(null);
			}
		}
	}
	$$onWindowMouseMove(event) {
		if (!this.$$elProgressBar.cap)
			return;
		var x = (this.$$elProgressBar.cap.downX) + event.pageX - this.$$elProgressBar.cap.event.pageX;
		var progress = Math.max(0, Math.min(x, this.$$elProgressBar.cap.width)) / this.$$elProgressBar.cap.width;
		// console.log(x, progress, event.pageX);
		this.currentTime = this.duration * progress;
		this.$$elProgressBarValue.style.width = this.currentTime / this.duration * 100 + '%';
	}
}

////////////////////

window.HTMLListPlayerElement = HTMLListPlayerElement;
window.customElements.define('list-player', HTMLListPlayerElement);

////////////////////
})();
