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

var droppicsSriptMasonryLoaded;
var spinner;
var timeout = 800;
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
    if(typeof(masonry_cat_id_click)==='undefined') {
        masonry_cat_id_click = "";
    }
    if(typeof(hash_category_id)==='undefined') {
        hash_category_id = "";
    }
    if(typeof(initGallery)==='undefined') {
        initGallery = false;
    }

    if(!initGallery && hash_category_id != masonry_cat_id_click) {
        $('.droppicsgallery').each(function (index) {
            listchid = $(this).data('listchid').toString().split(",");
            if ($.inArray(hash_category_id.toString(), listchid) > -1) {
                $(this).empty();
                that_masonry = this;
                initGallery = true;
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: Droppics.ajaxurl + "index.php?option=com_droppics&view=frontgallery&id_gallery=" + hash_category_id
                }).done(function (data) {
                    $.colorbox.remove();
                    unloadStyleId('droppicsgalleryStyle' + $(that_masonry).data('id'));
                    unloadHeadFiles();
                    $(window).scrollTop($(that_masonry).offset().top);
                    $(that_masonry).replaceWith(data);
                });
                return;
            }
        })
    }

    droppicsScriptMasonryLoaded=setInterval(function(){
    if((typeof(window.droppicsHeadLoaded)==='undefined' && typeof($.imageLoaded())!=='undefined') || 
                (typeof(window.droppicsHeadLoaded)==='boolean' && window.droppicsHeadLoaded===true)){            
            $(".droppicsgallerymasonry").each(function(){
                var id = $(this).data('id');
                var that = this;
                $(that).imagesLoaded(function(){
                    //don't run masonry on mobile
                    const isMobile = window.matchMedia("only screen and (max-width: 600px)").matches;
                    if (isMobile) {
                        $(that).find(".droppicspictures").css('float','left');
                    } else {
                        $(that).find(".droppicspictures").masonry({
                            itemSelector : ".wimg",
                            isAnimated : true,
                            animationOptions: {
                                duration: 400
                            },
                            isFitWidth : true
                        });
                    }
                    
                    if($(that).data('useinfinite') && typeof(droppicsAutobrowse)!=='undefined' && typeof(droppicsAutobrowse[id])!=='undefined'){ 
                        var number = $(that).data('infiniteajax');
                        var offset = $(that).data('infinitefirst');
                        var current = 0;
                         $(that).find('.droppicspictures').autobrowse({
                              url: false,
                              template: function (response)
                              {
                                  var markup=[],elems=[];
                                  for (var i=0; i<number && i+current<droppicsAutobrowse[id].length ; i++)
                                  {
                                        el = $(droppicsAutobrowse[id][i+current]);
                                        markup[i]=el;
                                        elems[i]=$(el).get(0);
                                  };
                                  current += number;
                                  $(that).find('.droppicspictures').append(markup);
                                  $(elems).imagesLoaded(function(){
                                     $(that).find('.droppicspictures').masonry( 'appended', $(elems)); 
                                  });

                                  return '';
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
                                          $(that).find('.droppicsgallerymasonry').imagesLoaded(function(){
                                              spinner.stop();
                                              $('.droppicsspinnerwrapper').remove();
                                              droppicsColorboxInit();                                
                                          });
                                      }
                                  }
                              }
                          );
                    }
                });
            });
            clearInterval(droppicsScriptMasonryLoaded);
        }
    },100);

    if(masonry_cat_id_click){
        prependTo_gallery = '#droppicsgallery'+masonry_cat_id_click ;
    }else {
        prependTo_gallery = '.droppicsgallerymasonry';
    }

    $(''+prependTo_gallery+' .droppicscats .wcat').each(function () {
            if(typeof($(this).find('.droppicscatslink').data('catimage')) !== 'undefined' && $(this).find('.droppicscatslink').data('catimage')== '1' ){
                return;
            }
            $(this).find('.droppicscatslink').css('margin-left', ($(this).width() - ($(this).find('.droppicscatslink img').width() + parseInt($(this).find('.droppicscatslink img').css('margin-left')) + parseInt($(this).find('.droppicscatslink img').css('margin-right')))) / 2);
            elem = $(this).find('.droppicscatslink').clone();
            elem.find('span').remove();
            elem.css({
                'position': 'absolute',
                'top': $(this).find('.droppicscatslink').position().top,
                'left': $(this).find('.droppicscatslink').position().left
            });
            if ($(this).parent().hasClass('show')) {
                rot = Math.floor((Math.random() * 10) + 1);
                elem.css({
                    '-webkit-transform': 'rotate(' + rot + 'deg)',
                    '-moz-transform': 'rotate(' + rot + 'deg)',
                    '-ms-transform': 'rotate(' + rot + 'deg)',
                    'transform': 'rotate(' + rot + 'deg)'
                })
                    .prependTo($(this));
                rot = Math.floor((Math.random() * 10) + 1);
                elem.clone().css({
                    '-webkit-transform': 'rotate(-' + rot + 'deg)',
                    '-moz-transform': 'rotate(-' + rot + 'deg)',
                    '-ms-transform': 'rotate(-' + rot + 'deg)',
                    'transform': 'rotate(-' + rot + 'deg)'
                })
                    .prependTo($(this));
            }
        });
    
    $(".droppicsgallerymasonry .droppicscatslink").unbind('click').click(function(e) {
        e.preventDefault();
        that = this;
        categorytitle = $(that).data('categorytitle').toString().replace(/ /g, '-');
        var  urlnewparam = addParameter(categorytitle,$(that).data('id'));
        $.ajax({
            type: "GET",
            dataType: "html",
            url: Droppics.ajaxurl + "index.php?option=com_droppics&view=frontgallery&id_gallery=" + $(that).data('id'),
        }).done(function (data) {
            $.colorbox.remove();
            unloadStyleId('droppicsgalleryStyle' + $(that).closest('.droppicsgallerymasonry').data('id'));
            unloadHeadFiles();
            $(window).scrollTop($(that).closest('.droppicsgallery').offset().top);
            $(that).closest('.droppicsgallery').replaceWith(data);
            window.history.pushState('', document.title,urlnewparam);
        });
    });
});

