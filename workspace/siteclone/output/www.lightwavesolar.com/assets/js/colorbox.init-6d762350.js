var resizeTimer;
var droppicsSriptImageloadedLoaded;
var w = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

var h = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

jQuery(document).ready(function($) {
    (droppicsColorboxInit = function(){


        droppicsSriptImageloadedLoaded=setInterval(function(){
            if(typeof(window.droppicsHeadLoaded)==='undefined' || 
                (typeof(window.droppicsHeadLoaded)==='boolean' && window.droppicsHeadLoaded===true)){
                    $('.droppicslightboxsingle').colorbox({title:function(){
                                return $(this).data('title');
                        },maxWidth:'90%',maxHeight:'90%',className: 'droppics',iframe:true,width:'100%',height:'100%'});
                    $('.droppicslightbox').each(function(){
                        var id_gallery =  $(this).data('id');
                        $(this).find('.wimg.droppicslightbox a').colorbox({
                            title:function(){
                                return $(this).data('title');
                            },
                            rel: 'droppicgallery'+id_gallery,
                            maxWidth:'90%',maxHeight:'90%',className: 'droppics',
                            onComplete:function(){
                                $('#cboxLoadedContent .cboxPhoto').attr('title',$(this).find('img').attr('title'));
                                $('#cboxLoadedContent .cboxPhoto').attr('alt',$(this).find('img').attr('alt'));
                            }
                        });
                        
                    });
                    $('.droppicsgallery').each(function(){   
                 
                        $(this).find('.wimg.droppicsvideo a').colorbox({  
                           title:function(){                               
                                return $(this).data('title');
                           },
                           iframe:true, innerWidth: 640, innerHeight: 390,
                            maxWidth:'90%',maxHeight:'90%',className: 'droppics',
                            onComplete:function(){
                               
                               $(this).colorbox.resize({innerWidth:$(this).data('vwidth'), innerHeight: $(this).data('vheight')} ); 
                               //fix over the full-screen button
                               $("#cboxNext, #cboxPrevious").css("height","85%")                                
                            }
                        });
                    });
                    
                    $('.droppicssinglevideo').each(function(){   
                          $(this).find('a').colorbox({  
                           title:function(){                               
                                return $(this).data('title');
                           },
                           iframe:true, innerWidth: 640, innerHeight: 390,
                            maxWidth:'90%',maxHeight:'90%',className: 'droppics',
                            onComplete:function(){

                                var rw = Math.min($(this).data('vwidth'), w * 0.9);
                                var rh = $(this).data('vheight') / $(this).data('vwidth') * rw;
                                $(this).colorbox.resize({innerWidth: rw, innerHeight: rh} );
                               //fix over the full-screen button
                               $("#cboxNext, #cboxPrevious").css("height","85%")                                
                            }
                        });
                    })
                    $('.droppicssingleimage').colorbox({title:function(){
                                return $(this).data('title');
                        },maxWidth:'90%',maxHeight:'90%',className: 'droppics'});

                    clearInterval(droppicsSriptImageloadedLoaded);
                }
            },100);    
    })();

    // Mobile swipe
    jQuery(document).bind('cbox_open', function () {
        $("#colorbox.droppics").swipe({
            //Generic swipe handler for all directions
            swipeLeft: function (event, direction, distance, duration, fingerCount) {
                $.colorbox.next();
            },
            swipeRight: function (event, direction, distance, duration, fingerCount) {
                $.colorbox.prev();
            },
            threshold: 75
        });
    });

    const isMobile = window.matchMedia("only screen and (max-width: 600px)").matches;

    // Fix gallery display issue inside a tab content.
    $('.nav-tabs a').on('shown.bs.tab', function(event){
        $(".droppicsgallerymasonry").each(function(){
            var id = $(this).data('id');
            var that = this;
            $(that).imagesLoaded(function() {
                if (isMobile) {
                    $(that).find(".droppicspictures").css('float','left');
                } else {
                    $(that).find(".droppicspictures").masonry({
                        itemSelector: ".wimg",
                        isAnimated: true,
                        animationOptions: {
                            duration: 400
                        },
                        isFitWidth: true
                    });
                }

            });
        });
    });

    // Fix gallery display issue inside a Bootstrap accordion content.
    $('.accordion').on('shown.bs.collapse',function (event) {
        $(event.target).find(".droppicsgallerymasonry").each(function(){
            var that = this;
            $(that).imagesLoaded(function() {
                if (isMobile) {
                    $(that).find(".droppicspictures").css('float','left');
                } else {
                    $(that).find(".droppicspictures").masonry({
                        itemSelector: ".wimg",
                        isAnimated: true,
                        animationOptions: {
                            duration: 400
                        },
                        isFitWidth: true
                    });
                }
            });
        });

        $(event.target).find('.droppicsgalleryheapshot').each(function(){
            options = new Array();
            that = $(this);
            if(that.find('ul').data('overflowparents')==='1'){
                options['overflowparents'] = true;
            }else{
                options['overflowparents'] = false;
            }
            options['rotation'] = 80;
            that.find('ul').heapshot(options);
        });
    });

    // Fix gallery display issue inside a tab content. Regular Labs - Tabs & Accordions
    let tabPanels  = jQuery(".droppicsgallerymasonry").parents("div[data-rlta-element='panel-content']");
    if (tabPanels.length > 0 ) {

        const mutationObserver = new MutationObserver((mutations) => {

            mutations.forEach(function(mutation) {

                const visibility = window
                    .getComputedStyle(mutation.target)
                    .getPropertyValue('opacity')

                console.log(visibility);
                if (visibility === '1') {
                    console.log('[MO]: element is visible')
                    jQuery(mutation.target).find(".droppicsgallerymasonry").each(function () {
                        var that = this;
                        jQuery(that).imagesLoaded(function () {
                            if (isMobile) {
                                $(that).find(".droppicspictures").css('float','left');
                            } else {
                                $(that).find(".droppicspictures").masonry({
                                    itemSelector: ".wimg",
                                    isAnimated: true,
                                    animationOptions: {
                                        duration: 400
                                    },
                                    isFitWidth: true
                                });
                            }
                        });
                    });
                }

            });
        })

        tabPanels.each(function(idx,tabPanel){
            // Respond to visibility changes that are handled via inline CSS
            mutationObserver.observe(tabPanel, {
                attributes: true,
                attributeFilter: ['style']
            })

        })
    }
});
// Fix gallery display issue inside a joomlashack tab content.
// sort tab plugin run before droppics content plugin
if(typeof(window.tabberOptions) !=='undefined') {
    tabberOptions.onTabDisplay = function (argsObj) {
        console.log('render Droppics masonry', argsObj);
        jQuery(".droppicsgallerymasonry").each(function () {
            var that = this;
            jQuery(that).imagesLoaded(function () {
                if (isMobile) {
                    $(that).find(".droppicspictures").css('float','left');
                } else {
                    $(that).find(".droppicspictures").masonry({
                        itemSelector: ".wimg",
                        isAnimated: true,
                        animationOptions: {
                            duration: 400
                        },
                        isFitWidth: true
                    });
                }
            });
        });
    };
}