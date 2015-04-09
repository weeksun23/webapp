/*
	Base:提供一系列帮助函数
*/
define(function(){
	var isWebkit = 'WebkitAppearance' in document.documentElement.style || typeof document.webkitHidden != "undefined";
	var userAgent = navigator.userAgent;
	var Base = {
	    isAndroid : userAgent.indexOf("Android") > 0,
	    isIOS : /iP(ad|hone|od)/.test(userAgent),
		isWebkit : isWebkit,
		eventNames : isWebkit ? 
		['webkitTransitionEnd','webkitAnimationEnd','webkitAnimation','webkitAnimationTimingFunction','webkitAnimationPlayState'] : 
		['transitionend','animationend','animation','animationTimingFunction','animationPlayState'],
	    //121,8 -> 00000121
	    //1,2 -> 01
	    //补0 默认8位
	    paddingZero : function(str,len){
	    	len = len || 8;
	    	str = str + "";
	    	var strLen = str.length;
	    	if(strLen >= len) return str;
	    	return new Array(len - strLen + 1).join('0') + str;
	    },
	    getNumByStr : function(str){
	    	return +str.replace(/[^\d]/g,'');
	    },
	    getScopeData : function(n){
	    	var re = [];
            for(var i=0;i<n;i++){
                re.push({
                    text : Base.paddingZero(i,2),
                    value : i
                });
            }
            return re;
	    },
	    delayAlert : function(mes){
	    	if(typeof mes == 'object'){
	    		mes = JSON.stringify(mes);
	    	}
	    	setTimeout(function(){
	    		alert(mes);
	    	});
	    }
	};
	(function(){
		var inter = 100;
		//长按800ms后触发 longClickFunc
		function getPos(e){
			var touch = e.changedTouches[0];
			return {
				x : touch.pageX,
				y : touch.pageY
			};
		}
		Base.getTouchPos = getPos;
		//简单的绑定移动事件 param:function tap function
		//param:obj {start,end,clickFn,longClickFunc}
		Base.onTap = function(el,param){
			var clickFn,start,end,longClickFunc,activeClassEl,_start,_move,_end;
			if(typeof param == 'function'){
				clickFn = param;
				activeClassEl = el;
			}else{
				clickFn = param.clickFn;
				start = param.start;
				end = param.end;
				_start = param._start;
				_move = param._move;
				_end = param._end;
				longClickFunc = param.longClickFunc;
				activeClassEl = param.activeClassEl || el;
			}
	    	var t = {};
	    	var fastclick = avalon.fastclick;
	    	var interval;
	    	el.addEventListener("touchstart",function(e){
	    		_start && _start.call(this,e);
	    		var time = 0;
	    		var me = this;
	    		t.isTrigger = true;
	    		t.startTime = e.timeStamp;
	    		t.startPos = getPos(e);
	    		avalon(activeClassEl).addClass(fastclick.activeClass);
	    		if(longClickFunc){
	    			interval = setInterval(function(){
						time += inter;
						if(time >= fastclick.clickDuration){
							end && end.call(me,e);
							clearInterval(interval);
							longClickFunc.call(me,e);
						}
					},inter);
	    		}
	    		start && start.call(this,e);
	    	});
	    	el.addEventListener("touchmove",function(e){
	    		_move && _move.call(this,e);
	    		if(!t.isTrigger) return;
	    		var pos = getPos(e);
	    		var startPos = t.startPos;
	    		if (Math.abs(pos.x - startPos.x) > fastclick.dragDistance || 
	    			Math.abs(pos.y - startPos.y) > fastclick.dragDistance) {
					avalon(activeClassEl).removeClass(fastclick.activeClass);
					t.isTrigger = false;
					longClickFunc && clearInterval(interval);
				}
	    	});
	    	el.addEventListener("touchend",function(e){
	    		_end && _end.call(this,e);
	    		if(!t.isTrigger) return;
	    		if(e.timeStamp - t.startTime > fastclick.clickDuration){
	    			t.isTrigger = false;
	    		}else{
	    			clickFn && clickFn.call(this,e);
	    		}
	    		avalon(activeClassEl).removeClass(fastclick.activeClass);
	    		end && end.call(this,e);
	    		longClickFunc && clearInterval(interval);
	    	});
	    	el.addEventListener("touchcancel",function(e){
	    		if(!t.isTrigger) return;
	    		t.isTrigger = false;
	    		avalon(activeClassEl).removeClass(fastclick.activeClass);
	    		longClickFunc && clearInterval(interval);
	    	});
	    };
	})();
	return Base;
});