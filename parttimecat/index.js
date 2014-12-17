(function(){
	new IScroll("#indexList");
	Mobilebone.callback = function(pageInto, pageOut) {
		if(pageInto == pageOut) return;
		var inIsWindow = pageInto.getAttribute("data-window") !== null;
		var nav = document.querySelector("body>.nav");
		if(pageOut){
			var outIsWindow = pageOut.getAttribute("data-window") !== null;
			if(!outIsWindow || !inIsWindow){
				if(outIsWindow && !inIsWindow){
					nav.className = "footer nav slide reverse in";
				}else if(!outIsWindow && inIsWindow){
					nav.className = "footer nav slide out";
				}
			}
		}
		if(!inIsWindow){
			var linkIn = nav.querySelector("a[href$="+ pageInto.id +"]");
			linkIn.classList.add("active");
			if(pageOut){
				if(!outIsWindow){
					var linkOut = nav.querySelector("a[href$="+ pageOut.id +"]");
					linkOut.classList.remove("active");
				}
			}else{
				nav.className = "footer nav in";
			}
		}
	};
})();
