/*
 *  Project: Long Press
 *  Description: Pops a list of alternate characters when a key is long-pressed
 *  Author: Quentin Thiaucourt, http://toki-woki.net
 *	Licence: MIT License http://opensource.org/licenses/mit-license.php
 */

;(function ($, window, undefined) {
    
    var pluginName = 'longPress',
        document = window.document,
        defaults = {/*
	        propertyName: "value"
        */};

	var moreChars={
		// extended latin (and african latin)
		// upper
		'A':'AĀĂÀÁÂÃÄÅĄⱭ∀Æ',
		'B':'BƁ',
		'C':'CÇĆĈĊČƆ',
		'D':'DÐĎĐḎƊ',
		'E':'EÈÉÊËĒĖĘẸĚƏÆƎƐ€',
		'F':'FƑƩ',
		'G':'GĜĞĠĢƢ',
		'H':'HĤĦ',
		'I':'IÌÍÎÏĪĮỊİIƗĲ',
		'J':'JĴĲ',
		'K':'KĶƘ',
		'L':'LĹĻĽŁΛ',
		'N':'NÑŃŅŇŊƝ₦',
		'O':'OÒÓÔÕÖŌØŐŒƠƟ',
		'P':'PƤ¶',
		'R':'RŔŘɌⱤ',
		'S':'SßſŚŜŞṢŠÞ§',
		'T':'TŢŤṮƬƮ',
		'U':'UÙÚÛÜŪŬŮŰŲɄƯƱ',
		'V':'VƲ',
		'W':'WŴẄΩ',
		'Y':'YÝŶŸƔƳ',
		'Z':'ZŹŻŽƵƷẔ',
		
		// lower
		'a':'aāăàáâãäåąɑæαª',
		'b':'bßβɓ',
		'c':'cçςćĉċč¢ɔ',
		'd':'dðďđɖḏɖɗ',
		'e':'eèéêëēėęẹěəæεɛ€',
		'f':'fƒʃƭ',
		'g':'gĝğġģɠƣ',
		'h':'hĥħɦẖ',
		'i':'iìíîïīįịiiɨĳι',
		'j':'jĵɟĳ',
		'k':'kķƙ',
		'l':'lĺļľłλ',
		'n':'nñńņňŋɲ',
		'o':'oòóôõöōøőœơɵ°',
		'p':'pƥ¶',
		'r':'rŕřɍɽ',
		's':'sßſśŝşṣšþ§',
		't':'tţťṯƭʈ',
		'u':'uùúûüūŭůűųưμυʉʊ',
		'v':'vʋ',
		'w':'wŵẅω',
		'y':'yýŷÿɣyƴ',
		'z':'zźżžƶẕʒƹ',

		// Misc
		'$':'£¥€₩₨₳Ƀ¤',
		'!':'¡‼‽',
		'?':'¿‽',
		'%':'‰',
		'.':'…••',
		'-':'±‐–—',
		'+':'±†‡',
		'\'':'′″‴‘’‚‛',
		'"':'“”„‟',
		'<':'≤‹',
		'>':'≥›',
		'=':'≈≠≡'
		
	};
	var ignoredKeys=[8, 13, 37, 38, 39, 40];

	var selectedCharIndex;
	var lastWhich;
	var timer;
	var activeElement;

	var popup=$('<ul class=long-press-popup />');

	$(window).mousewheel(onWheel);
	$(window).keyup(onKeyUp);

	function onKeyDown(e) {

		// Arrow key with popup visible
		if ($('.long-press-popup').length>0 && (e.which==37 || e.which==39)) {
			if (e.which==37) activePreviousLetter();
			else if (e.which==39) activateNextLetter();

			e.preventDefault();
			return;
		}

		if (ignoredKeys.indexOf(e.which)>-1) return;
		activeElement=e.target;

		if (e.which==lastWhich) {
			e.preventDefault();
			if (!timer) timer=setTimeout(onTimer, 10);
			return;
		}
		lastWhich=e.which;
	}
	function onKeyUp(e) {
		if (ignoredKeys.indexOf(e.which)>-1) return;
		if (activeElement==null) return;

		lastWhich=null;
		clearTimeout(timer);
		timer=null;

		hidePopup();
	}
	function onTimer() {
		var typedChar=$(activeElement).val().split('')[getCaretPosition(activeElement)-1];

		if (moreChars[typedChar]) {
			showPopup((moreChars[typedChar]));
		} else {
			hidePopup();
		}
	}
	function showPopup(chars) {
		popup.empty();
		var letter;
		for (var i=0; i<chars.length; i++) {
			letter=$('<li class=long-press-letter />').text(chars[i]);
			letter.mouseenter(activateLetter);
			popup.append(letter);
		}
		$('body').append(popup);
		selectedCharIndex=-1;
	}
	function activateLetter(e) {
		selectCharIndex($(e.target).index());
	}
	function activateRelativeLetter(i) {
		selectCharIndex(($('.long-press-letter').length+selectedCharIndex+i) % $('.long-press-letter').length);
	}
	function activateNextLetter() {
		activateRelativeLetter(1);
	}
	function activePreviousLetter() {
		activateRelativeLetter(-1);
	}
	function hidePopup() {
		popup.detach();
	}
	function onWheel(e, delta, deltaX, deltaY) {
		if ($('.long-press-popup').length==0) return;
		e.preventDefault();
		delta<0 ? activateNextLetter() : activePreviousLetter();
	}
	function selectCharIndex(i) {
		$('.long-press-letter.selected').removeClass('selected');
		$('.long-press-letter').eq(i).addClass('selected');
		selectedCharIndex=i;
		updateChar();
	}

	function updateChar() {
		var newChar=$('.long-press-letter.selected').text();
		var pos=getCaretPosition(activeElement);
		var arVal=$(activeElement).val().split('');
		arVal[pos-1]=newChar;
		$(activeElement).val(arVal.join(''));
		setCaretPosition(activeElement, pos);
	}

    function LongPress( element, options ) {

        this.element = element;
		this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

	LongPress.prototype = {

		init: function () {
			$(this.element).keydown(onKeyDown);
        }

	};

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new LongPress( this, options ));
            }
        });
    };

}(jQuery, window));
