jQuery(document).ready(function(){

	/* Custom sticky header*/
	var header = jQuery("#sp-logo-and-main-menu");
	var headerHeight = header.outerHeight();
	var lastScrollTop = 0;
	var isSticky = false;
	var isAnimating = false;
	var headerPlaceholder;
	var hideThreshold = 5; 
	var scrollDownAmount = 0; 
	var currentHeaderPosition = 0;
	var targetHeaderPosition = 0;
	var animationFrame;

	function createPlaceholder() {
		if (!headerPlaceholder) {
			headerPlaceholder = jQuery('<div class="header-placeholder"></div>');
			headerPlaceholder.css({
				'height': headerHeight + 'px',
				'visibility': 'hidden',
				'display': 'none'
			});
			header.after(headerPlaceholder);
		}
	}

	function animateHeader() {
		if (Math.abs(currentHeaderPosition - targetHeaderPosition) > 0.1) {
			currentHeaderPosition += (targetHeaderPosition - currentHeaderPosition) * 0.1;
			header.css('transform', 'translateY(' + currentHeaderPosition + '%)');
			animationFrame = requestAnimationFrame(animateHeader);
		} else {
			currentHeaderPosition = targetHeaderPosition;
			header.css('transform', 'translateY(' + currentHeaderPosition + '%)');
			isAnimating = false;
			
			if (currentHeaderPosition <= -99) {
				headerPlaceholder.hide();
				header.removeClass("header-sticky");
				header.css('transform', '');
				isSticky = false;
				scrollDownAmount = 0;
				currentHeaderPosition = 0;
				targetHeaderPosition = 0;
			}
		}
	}

	function startAnimation() {
		if (!isAnimating) {
			isAnimating = true;
			animateHeader();
		}
	}

	createPlaceholder();

	jQuery(window).scroll(function () {
		var currentScroll = jQuery(this).scrollTop();
		var scrollDirection = currentScroll > lastScrollTop ? 'down' : 'up';
		var scrollDistance = Math.abs(currentScroll - lastScrollTop);
		
		if (scrollDirection === 'down' && isSticky) {
			scrollDownAmount += scrollDistance;
		} else {
			scrollDownAmount = 0; 
		}
		
		if (scrollDirection === 'up' && currentScroll > 0) {
			scrollDownAmount = 0; 
			
			if (!isSticky) {
				headerPlaceholder.show();
				header.addClass("header-sticky");
				header.css('transform', 'translateY(-100%)');
				isSticky = true;
				currentHeaderPosition = -100;
				targetHeaderPosition = 0;
				startAnimation();
			} else {
				targetHeaderPosition = 0;
				startAnimation();
			}
		} else if (scrollDirection === 'down' && isSticky) {
			if (scrollDownAmount > hideThreshold) {
				targetHeaderPosition = -100;
				startAnimation();
			}
		}
		
		if (currentScroll <= 0) {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
			
			headerPlaceholder.hide();
			header.removeClass("header-sticky");
			header.css('transform', '');
			isSticky = false;
			isAnimating = false;
			scrollDownAmount = 0;
			currentHeaderPosition = 0;
			targetHeaderPosition = 0;
		}
		
		lastScrollTop = currentScroll;
		
		var newHeight = header.outerHeight();
		if (newHeight !== headerHeight) {
			headerHeight = newHeight;
			headerPlaceholder.css('height', headerHeight + 'px');
		}
	});



	/* Add class to opened menu */
	jQuery(".sp-menu-item.sp-has-child").hover(
		function() {
		  jQuery(this).addClass("submenu-open");
		},
		function() {
		  jQuery(this).removeClass("submenu-open");
		}
	);

  

	/* Allows opening the submenu not only from the right arrow, but also from the parent menu item name */
	jQuery('.offcanvas-menu li.menu-parent > a').on('click', function (e) {
		const $parent = jQuery(this).closest('li.menu-parent');

		if ($parent.children('.menu-child').length > 0) {
			e.preventDefault();
			e.stopImmediatePropagation(); 

			$parent.toggleClass('menu-parent-open');
			$parent.children('.menu-child').stop(true, true).slideToggle(300);
		}
	});
	
	

	/* Move slider nav arrows to top of the slide title */
	setTimeout(function() {
		jQuery('.mk-slideshow .owl-nav').detach().insertBefore('.mk-slideshow-title');
	}, 200);

});

