define(function(){
    'use strict';
	var transformName = 'transform' in document.documentElement.style ? 'transform' : 'webkitTransform';
    var numReg = /\-?[0-9]+\.?[0-9]*/g;
    function getTranslateX(el){
        var transform = el.style[transformName];
        var match = transform.match(numReg);
        return +match[0];
    }
    function setTranslateX(el,x){
        el.style[transformName] = 'translateX('+x+'px)';
    }
    function dealTranslateEnd(el,x){
        if(x === 0){
            el.querySelector(".list-item-del").classList.add('hide');
            if(this.curDelEl === el){
                this.curDelEl = null;
            }
        }else{
            this.curDelEl = el;
        }
    }
	/*
	*/
	function SlideDelete(options){
		this.options = options || {};
		this.curDelEl = null;
	}
    SlideDelete.prototype.setTranslateXAnimate = function(el,x,start,func){
        var me = this;
        if(start === undefined){
            start = getTranslateX(el);
        }
        if(x === start) {
            dealTranslateEnd.call(this,el,x);
            return;
        }
        if(x > start){
            var d = 2;
        }else{
            d = -2;
        }
        el.$animating = true;
        var interval = setInterval(function(){
            start += d;
            if(d > 0){
                if(start > x){
                    start = x;
                }
            }else{
                if(start < x){
                    start = x;
                }
            }
            setTranslateX(el,start);
            if(start === x){
                clearInterval(interval);
                el.$animating = false;
                dealTranslateEnd.call(me,el,x);
                func && func.call(el,x);
            }
        });
    };
	SlideDelete.prototype.getEventObj = function(Base,el){
		var me = this;
		var data = {};
		return {
			_start : function(e){
                if(el.$animating) return;
                if(me.curDelEl && me.curDelEl !== el){
                    me.setTranslateXAnimate(me.curDelEl,0);
                }
            	data.touchstart = Base.getTouchPos(e);
            	data.posstart = getTranslateX(el);
                var del = el.querySelector(".list-item-del");
            	del.classList.remove('hide');
                data.delWidth = avalon(del.querySelector("div")).width();
            },
            _move : function(e){
                if(el.$animating) return;
            	var touch = Base.getTouchPos(e);
            	var moved = touch.x - data.touchstart.x;
            	var curPos = data.posstart + moved;
            	if(curPos < -data.delWidth){
            		curPos = -data.delWidth;
            	}else if(curPos > 0){
            		curPos = 0;
            	}
            	setTranslateX(el,curPos);
            },
            _end : function(){
                if(el.$animating) return;
                var x = getTranslateX(el);
                if(Math.abs(x) > data.delWidth / 2){
                    var target = -data.delWidth;
                }else{
                    target = 0;
                }
                me.setTranslateXAnimate(el,target,x);
            }
		};
	};
	return SlideDelete;
});