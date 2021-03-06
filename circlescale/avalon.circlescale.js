/*
*/
define(["avalon","css!./avalon.circlescale.css"],function(avalon){
    var scaleWidth = 8;
    function axa(a){
        return a * a;
    }
    function getXScope(x1,x2){
        return [Math.min(x1,x2),Math.max(x1,x2)];
    }
    var widget = avalon.ui.circlescale = function(element, data, vmodels){
        var options = data.circlescaleOptions;
        var circleData = {};
        function initData(){
            var $element = avalon(element);
            var heartVal = $element.width() / 2;
            //求半径
            circleData.r = heartVal - scaleWidth / 2;
            //求圆心坐标
            var heart = circleData.heart = {
                x : heartVal,
                y : -heartVal
            };
            //环形相对页面的坐标
            circleData.offset = $element.offset();
            //偏移量
            var excursionVal = avalon(circleData.handler).outerWidth() / 2;
            var excursion = circleData.excursion = {x : excursionVal,y : -excursionVal};
            //计量最少最大值
            circleData.min = 40;
            circleData.max = 100;
            //0->30 2πR->90
            circleData.tick = 2 * Math.PI * circleData.r / (circleData.max - circleData.min);
            //初始化4个计量点的坐标
            var point1 = getHandlerPos(circleData.r + circleData.r * 0.6,2 * circleData.r);
            //获得point1中心坐标
            point1.x += excursion.x;
            point1.y += excursion.y;
            var point1CenterX = point1.x;
            var point1CenterY = point1.y;
            var v1 = circleData.r / Math.sqrt(axa((point1CenterX - heart.x) / (point1CenterY - heart.y)) + 1);
            var point2x = v1 + heart.x;
            var point2y = heart.y - (point1CenterX - heart.x) / (point1CenterY - heart.y) * (point2x - heart.x);
            var point3x = 2 * heart.x - point1CenterX;
            var point3y = 2 * heart.y - point1CenterY;
            var point4x = heart.x - v1;
            var point4y = heart.y - (point1CenterX - heart.x) / (point1CenterY - heart.y) * (point4x - heart.x);
            circleData.point1 = point1;
            circleData.point2 = {
                x : point2x,y : point2y
            };
            circleData.point3 = {
                x : point3x,y : point3y
            };
            circleData.point4 = {
                x : point4x,y : point4y
            };
        }
        
        //
        function getHandlerPos(x,y){
            //转换成坐标
            y = -y;
            var heart = circleData.heart;
            if(x >= heart.x){
                if(y >= heart.y){
                    var a = 1;
                    var b = 1;
                }else{
                    a = 1;
                    b = -1;
                }
            }else{
                if(y >= heart.y){
                    a = -1;
                    b = 1;
                }else{
                    b = -1;
                    a = -1;
                }
            }
            var r = circleData.r;
            var x1 = r / (a * Math.sqrt(axa((y-heart.y)/(x-heart.x)) + 1)) 
                + heart.x - circleData.excursion.x;
            var y1 = r / (b * Math.sqrt(axa((x-heart.x)/(y-heart.y)) + 1)) 
                + heart.y - circleData.excursion.y;
            return {
                x : x1,
                y : y1
            };
        }
        function isInScope(x,y,p1,p2){
            var y1 = p1.y;
            var y2 = p2.y;
            var k = (y2 - y1) / (p2.x - p1.x);
            var b = y2 - k * p2.x;
            //求出圆心在直线的哪一边
            var centerY = k * circleData.heart.x + b;
            if(centerY < circleData.heart.y){
                //圆心在直线上面 点在直线下面
                return y < k * x + b;
            }else{
                //圆心在直线下面 点在直线上面
                return y > k * x + b;
            }
        }
        function setHandlerPos(x,y){
            circleData.handler.style.left = x + 'px';
            circleData.handler.style.top = (-y) + 'px';
        }
        function setScale(x,y){
            vmodel.temp = getScale(x,y);
        }
        function getScale(x,y){
            x = x + circleData.excursion.x;
            y = y + circleData.excursion.y;
            var point1 = circleData.point1;
            var heart = circleData.heart;
            var k2 = (point1.y - heart.y)/(point1.x - heart.x);
            if(x === heart.x){
                var k1 = (point1.y - y) / (point1.x - x);
                var angel = Math.atan(Math.abs((k2 - k1)/(1 + k2*k1)));
                if(y > heart.y){
                    angel = Math.PI - 2 * angel;
                }else{
                    angel = 2 * angel;
                }
            }else{
                k1 = (y - heart.y)/(x - heart.x);
                angel = Math.atan(Math.abs((k2 - k1)/(1 + k2*k1)));
                var p2 = circleData.point2;
                var p3 = circleData.point3;
                var p4 = circleData.point4;
                if(isInScope(x,y,point1,p2)){
                    angel = 2 * Math.PI - angel;
                }else if(isInScope(x,y,p2,p3)){
                    angel = Math.PI + angel;
                }else if(isInScope(x,y,p3,p4)){
                    angel = Math.PI - angel;
                }else if(isInScope(x,y,p4,point1)){
                    angel = 1 * angel;
                }
            }
            var len = angel * circleData.r;
            return parseInt(len / circleData.tick) + circleData.min;
        }
        function start(){
            initData();
            element.addEventListener("touchmove",move);
            element.addEventListener("touchend",end);
            element.addEventListener("touchcancel",end);
            circleData.handler.classList.add("circlescale-handler-active");
        }
        function move(e){
            var offset = circleData.offset;
            var touch = e.changedTouches[0];
            //求出点击点相对环形的坐标
            var x = touch.pageX - offset.left;
            var y = touch.pageY - offset.top;
            var p = getHandlerPos(x,y);
            setHandlerPos(p.x,p.y);
            setScale(p.x,p.y);
        }
        function end(){
            element.removeEventListener('touchmove',move);
            element.removeEventListener('touchend',end);
            circleData.handler.classList.remove("circlescale-handler-active");
        }
        function dealTargetTemp(x,y,targetTemp){
            var scale = getHandlerPos(x,-y);
            var temp = getScale(scale.x,scale.y);
            if(temp === targetTemp){
                setHandlerPos(scale.x,scale.y);
                vmodel.temp = temp;
                return true;
            }
            return false;
        }
        var vmodel = avalon.define(data.circlescaleId,function(vm){
            avalon.mix(vm,options);
            vm.$skipArray = ['setPosByXY','setPosByTemp','widgetElement'];
            vm.widgetElement = element;
            vm.$init = function(){
                element.classList.add("circlescale");
                element.setAttribute("ms-css-width",'circleSize');
                element.setAttribute("ms-css-height",'circleSize');
                element.innerHTML = 
                    "<div class='circlescale-handler'>"+
                        "<div ms-css-border-width='handlerBorderWidth' ms-css-height='handlerSize' ms-css-width='handlerSize'></div>" +
                    "</div>"+
                    "<div class='circlescale-value' ms-css-height='valueSize' ms-css-width='valueSize' ms-css-font-size='{{valueSize - 10}}px' "+
                    "ms-css-line-height='{{valueSize}}px'>"+
                        "{{temp}}<div class='unit'></div>"+
                    "</div>";
                circleData.handler = element.querySelector(".circlescale-handler");
                circleData.handler.addEventListener("touchstart",start);
                avalon.scan(element,vmodel);
                initData();
                //初始计量位置和滑块位置
                vmodel.setPosByXY(circleData.r + circleData.r * 0.5,2 * circleData.r);
                vmodel.afterInit(vmodel);
            };
            vm.setPosByXY = function(x,y){
                var scaleStart = getHandlerPos(x,y);
                setHandlerPos(scaleStart.x,scaleStart.y);
                setScale(scaleStart.x,scaleStart.y); 
            };
            vm.setPosByTemp = function(targetTemp){
                var r = circleData.r,
                    x0 = circleData.heart.x,
                    y0 = circleData.heart.y,
                    xmax = x0 + circleData.r,
                    xmin = x0 - circleData.r;
                for(var x = xmin;x <= xmax;x++){
                    var a = axa(r) - axa(x - x0);
                    if(a >= 0){
                        var b = Math.sqrt(a);
                        var y = y0 + b;
                        if(dealTargetTemp(x,y,targetTemp)) return;
                        if(b === 0) continue;
                        y = y0 - b;
                        if(dealTargetTemp(x,y,targetTemp)) return;
                    }
                }
            };
            vm.$noop = avalon.noop;
        });
        return vmodel;
    };
    widget.version = 1.0;
    widget.defaults = {
        temp : null,
        circleSize : 220,
        handlerSize : 28,
        handlerBorderWidth : 2,
        valueSize : 120,
        afterInit : avalon.noop
    };
});