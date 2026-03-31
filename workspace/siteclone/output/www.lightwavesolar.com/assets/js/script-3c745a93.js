/** 
 * Droppics
 * 
 * We developed this code with our hearts and passion.
 * We hope you found it useful, easy to understand and to customize.
 * Otherwise, please feel free to contact us at contact@joomunited.com *
 * @package Droppics
 * @copyright Copyright (C) 2013 JoomUnited (http://www.joomunited.com). All rights reserved.
 * @copyright Copyright (C) 2013 Damien Barrère (http://www.crac-design.com). All rights reserved.
 * @license GNU General Public License version 2 or later; http://www.gnu.org/licenses/gpl-2.0.html
 */

var droppicsSriptDefaultLoaded;
var spinner;
var pathname = window.location.pathname;
var spinnerOpts = {
  lines: 11,
  length: 4,
  width: 3, 
  radius: 7,
  corners: 0.4, 
  rotate: 0, 
  direction: 1, 
  color: '#000',
  speed: 1, 
  trail: 30, 
  shadow: false,
  hwaccel: false,
  className: 'droppicsspinner',
  zIndex: 2e9, 
  top: 'auto',
  left: '50%'
};
if(typeof(droppicsAutobrowse)==='undefined'){
    var droppicsAutobrowse = [];
}

jQuery(document).ready(function($) {
    if(typeof(default_cat_id_click)==='undefined') {
        default_cat_id_click = "";
    }
    if(typeof(hash_category_id)==='undefined') {
        hash_category_id = "";
    }
    if(typeof(initGallery)==='undefined') {
        initGallery = false;
    }
    if(!initGallery && hash_category_id != default_cat_id_click) {
        $('.droppicsgallery').each(function (index) {
            listchid = $(this).data('listchid').split(",");
            if ($.inArray(hash_category_id.toString(), listchid) > -1) {
                $(this).empty();
                that_default = this;
                initGallery = true;
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: Droppics.ajaxurl + "index.php?option=com_droppics&view=frontgallery&id_gallery=" + hash_category_id
                }).done(function (data) {
                    $.colorbox.remove();
                    unloadStyleId('droppicsgalleryStyle' + $(that_default).data('id'));
                    unloadHeadFiles();
                    $(window).scrollTop($(that_default).offset().top);
                    $(that_default).replaceWith(data);
                });
                return;
            }
        })
    }
    if(default_cat_id_click){
        appendTo_gallery = '#droppicsgallery'+default_cat_id_click ;
    }else {
        appendTo_gallery = '.droppicsgallerydefault';
    }

    droppicsScriptDefaultLoaded=setInterval(function(){
        if((typeof(window.droppicsHeadLoaded)==='undefined' && typeof($.imageLoaded())!=='undefined') || 
                (typeof(window.droppicsHeadLoaded)==='boolean' && window.droppicsHeadLoaded===true)){
            $(''+appendTo_gallery+'').imagesLoaded( function(){
                (centerImages= function() {
                    $(''+appendTo_gallery+' img').each(function(index,value) {
                        var ph = jQuery(value).parents('.wimg').height();
                        var ah = (jQuery(value).prop('naturalHeight') < ph)? jQuery(value).prop('naturalHeight') : ph ;
                        var mh = Math.ceil((ph-ah) / 2);
                        $(value).css('margin-top', mh);
                        $(value).next('i.video').css('top', mh);
                    });

                    $(''+appendTo_gallery+' .droppicscats .wcat').each(function () {
                        if(typeof($(this).find('.droppicscatslink').data('catimage')) !== 'undefined' && $(this).find('.droppicscatslink').data('catimage')== '1' ){
                            return;
                        }
                        var pw = $(this).width();
                        var aw = ($(this).find('.droppicscatslink img').prop('naturalWidth') < pw) ? $(this).find('.droppicscatslink img').prop('naturalWidth') : pw;
                        $(this).find('.droppicscatslink').css('margin-left', (pw - (aw + parseInt($(this).find('.droppicscatslink img').css('margin-left')) + parseInt($(this).find('.droppicscatslink img').css('margin-right')))) / 2);
                        elem = $(this).find('.droppicscatslink').clone();
                        elem.find('span').remove();
                        elem.css({
                            'position': 'absolute',
                            'top': $(this).find('.droppicscatslink').position().top,
                            'left': $(this).find('.droppicscatslink').position().left
                        });
                        if ($(this).parent().hasClass('show')) {
                            rot = 8 ; // Math.floor((Math.random() * 10) + 1);
                            elem.css({
                                '-webkit-transform': 'rotate(' + rot + 'deg)',
                                '-moz-transform': 'rotate(' + rot + 'deg)',
                                '-ms-transform': 'rotate(' + rot + 'deg)',
                                'transform': 'rotate(' + rot + 'deg)'
                            })
                                .prependTo($(this));
                            rot = 8 ;// Math.floor((Math.random() * 10) + 1);
                            elem.clone().css({
                                '-webkit-transform': 'rotate(-' + rot + 'deg)',
                                '-moz-transform': 'rotate(-' + rot + 'deg)',
                                '-ms-transform': 'rotate(-' + rot + 'deg)',
                                'transform': 'rotate(-' + rot + 'deg)'
                            })
                                .prependTo($(this));
                        }
                    });

                })();

                $(''+appendTo_gallery+'').each(function(){
                   var id=$(this).data('id');
                   var current = 0;
                   var that = this;
                   if($(that).data('useinfinite') && typeof(droppicsAutobrowse)!=='undefined' && typeof(droppicsAutobrowse[id])!=='undefined'){
                       var number = $(that).data('infiniteajax');
                       var offset = $(that).data('infinitefirst');
                        $(that).find('.droppicspictures').autobrowse({
                             url: false,
                             template: function (response)
                             {
                                 var markup='';
                                 for (var i=0; i<number && i+current<droppicsAutobrowse[id].length ; i++)
                                 {
                                     markup += droppicsAutobrowse[id][i+current];
                                 };
                                 current += number;
                                 $(that).find(".droppicspictures").find("div.clr").remove();
                                 return markup+'<div class="clr"></div>';
                             },
                             itemsReturned: function (response) {
                                 if(current>=droppicsAutobrowse[id].length){
                                     return 0;
                                 }
                                 return number;
                             },
                             offset: offset,
                             loader: {
                                 append : function(){
                                         div = document.createElement('div');
                                         div.className = "droppicsspinnerwrapper";
                                         spinner = new OwnSpinner(spinnerOpts).spin(div);
                                         $(that).find('.droppicspictures').after(div);
                                         return '';
                                     },
                                     remove : function(){
                                         $(that).imagesLoaded(function(){
                                             spinner.stop();
                                             $(that).find('.droppicsspinnerwrapper').remove();
                                             centerImages();
                                             droppicsColorboxInit();
                                         });
                                     }
                                 }
                             }
                         );
                    }
                });

            });
            clearInterval(droppicsScriptDefaultLoaded);
        }
    },100);


    
    $(".droppicsgallerydefault .droppicscatslink").unbind('click').click(function(e) {
        e.preventDefault();
        that = this;
        categorytitle = $(that).data('categorytitle').toString().replace(/ /g, '-');
        var  urlnewparam = addParameter(categorytitle,$(that).data('id'));
        $.ajax({
            type: "GET",
            dataType: "html",
            url: Droppics.ajaxurl + "index.php?option=com_droppics&view=frontgallery&id_gallery=" + $(that).data('id')
        }).done(function (data) {
            window.history.pushState('', document.title,urlnewparam);
            $.colorbox.remove();
            unloadStyleId('droppicsgalleryStyle' + $(that).closest('.droppicsgallerydefault').data('id'));
            unloadHeadFiles();
            $(window).scrollTop($(that).closest('.droppicsgallery').offset().top);
            $(that).closest('.droppicsgallery').replaceWith(data);
        });
    });
});
