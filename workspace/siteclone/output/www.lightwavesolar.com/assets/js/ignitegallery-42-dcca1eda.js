window.lazySizesConfig = window.lazySizesConfig || {};
lazySizesConfig.expand = 1000;

jQuery(document).ready(function($)
{
    $('.ig-main-scope-wrapper').each(function(index,el)
    {
        var lastVisible = $(el).is(':visible');
        if(!lastVisible)
        {
            $(el).css('visibility','hidden');
        }

        function checkIfVisibleChanged()
        {
            var visibleNow = $(el).is(':visible');

            if(visibleNow != lastVisible)
            {
                if(visibleNow)
                {
                    $(el).resize();
                    iguiUIkit.update($(el));
                    setTimeout(function(){$(el).css('visibility','visible');$(el).find('.ig-thumbs-grid').css('visibility','visible');}, 70);
                }
                else
                {
                    $(el).css('visibility','hidden');
                    $(el).find('.ig-thumbs-grid').css('visibility','hidden');
                }

                lastVisible = visibleNow;
            }
        }

        setInterval(checkIfVisibleChanged, 50);

    });

    //menu grid
    $('.ig-menu-grid').each(function(index,el)
    {
        var menuGrid = $(el);
        menuGrid.data('init',0);
        var menuGridType = menuGrid.attr('data-ig-menugridtype');
        var maxColumnWidth = parseInt(menuGrid.attr('data-ig-maxmenuwidth'));
        var maxColumnHeight = parseInt(menuGrid.attr('data-ig-maxmenuheight'));
        var menuGridPadding = parseInt(menuGrid.attr('data-ig-menugridmargin'));

        //masonry grid
        function masonryGrid()
        {
            var containerWidth = parseInt(menuGrid.parent().width());
            var columns = Math.ceil(containerWidth/(maxColumnWidth + (menuGridPadding * 2)));

            var gutterTotalSpace = menuGridPadding * (columns -1);
            var columnsTotalSpace = containerWidth - (gutterTotalSpace);
            var oneColumnSpace = columnsTotalSpace/columns;

            menuGrid.find('.ig-menu-grid-item').each(function(index,el)
            {
                $(el).css('width',oneColumnSpace+'px');
                $(el).css('margin-bottom',(menuGridPadding -1)+'px');

                if($(el).find('img').length)
                {
                    var imgWidth = $(el).find('img').attr('width');
                    var imgHeight = $(el).find('img').attr('height');

                    var newHeight = Math.ceil(((oneColumnSpace/imgWidth) * imgHeight)) + 1;
                    if(newHeight > imgHeight)
                    {
                        newHeight = imgHeight;
                    }

                    if($(el).find('.ig-menu-grid-text').length && $(el).find('.ig-menu-grid-text').hasClass('igui-overlay') == false)
                    {
                        newHeight = parseInt(newHeight) + parseInt($(el).find('.ig-menu-grid-text').outerHeight()) + 10;
                    }

                    $(el).css('height',newHeight+'px');
                }
            });

            menuGrid.isotopeIG({
                layoutMode: 'masonry',
                itemSelector: '.ig-menu-grid-item',
                masonry: {
                    columnWidth: oneColumnSpace,
                    gutter: menuGridPadding,
                    resize: false,
                    fitWidth: true,
                    transitionDuration: 0
                }
            });


            if(menuGrid.data('init') == 0)
            {
                document.addEventListener('lazyloaded', function(e)
                {
                    menuGrid.isotopeIG('layout');
                });
            }
            menuGrid.data('init',1);
        }

        if(menuGridType == 'by_columns')
        {
            masonryGrid();
            setTimeout(function(){masonryGrid();}, 200);
            setTimeout(function(){masonryGrid();}, 500);

            $(window).resize(function()
            {
                if(menuGrid.data('resizing') == 0)
                {
                    masonryGrid();
                    setTimeout(function(){masonryGrid();}, 100);
                    setTimeout(function(){masonryGrid();}, 200);
                    setTimeout(function(){masonryGrid();}, 500);
                    menuGrid.data('resizing',1);
                }
                setTimeout(function(){menuGrid.data('resizing',0);}, 50);
            });
        }

        function metroMenuGrid()
        {
            var containerWidth = parseInt(menuGrid.parent().width());

            var columns = Math.ceil(containerWidth/(maxColumnWidth + (menuGridPadding * 1.5)));
            var gutterTotalSpace = menuGridPadding * (columns -1);
            var columnsTotalSpace = containerWidth - (gutterTotalSpace);
            var oneColumnSpace = columnsTotalSpace/columns;
            var twoColumnSpace = (oneColumnSpace*2) + menuGridPadding;


            var lastContainerWidth = menuGrid.data('last-grid-width');
            if(typeof lastContainerWidth === 'undefined'){lastContainerWidth = 0}

            if(containerWidth != lastContainerWidth)
            {
                menuGrid.find('.ig-menu-grid-item').each(function(index,el)
                {
                    if( $(el).attr('data-widthdouble') == 1 )
                    {
                        $(el).css('width',twoColumnSpace+'px');
                    }
                    else
                    {
                        $(el).css('width',oneColumnSpace+'px');
                    }

                    if( $(el).attr('data-heightdouble') == 1 )
                    {
                        $(el).css('height',twoColumnSpace+'px');
                    }
                    else
                    {
                        $(el).css('height',oneColumnSpace+'px');
                    }

                });

                menuGrid.isotopeIG({
                    layoutMode: 'packery',
                    itemSelector: '.ig-menu-grid-item',
                    packery: {
                        gutter: menuGridPadding,
                        resize: false,
                        rowHeight: oneColumnSpace
                    }
                });
            }

            menuGrid.data('last-grid-width',containerWidth);

            if(menuGrid.data('init') == 0)
            {
                document.addEventListener('lazyloaded', function(e)
                {
                    menuGrid.isotopeIG('layout')
                });
            }
            menuGrid.data('init',1);
        }

        if(menuGridType == 'metro')
        {
            metroMenuGrid();
            setTimeout(function(){metroMenuGrid();}, 200);
            setTimeout(function(){metroMenuGrid();}, 500);

            $(window).resize(function()
            {
                if(menuGrid.data('resizing') == 0)
                {
                    metroMenuGrid();
                    setTimeout(function(){metroMenuGrid();}, 100);
                    setTimeout(function(){metroMenuGrid();}, 200);
                    setTimeout(function(){metroMenuGrid();}, 500);
                    menuGrid.data('resizing',1);
                }

                setTimeout(function(){menuGrid.data('resizing',0);}, 50);
            });
        }

        //rows grid
        function rowsGrid()
        {
            var containerWidth = parseInt(menuGrid.parent().width());
            var columns = Math.ceil(containerWidth/(maxColumnWidth + (menuGridPadding * 2)));

            var gutterTotalSpace = menuGridPadding * (columns -1);
            var columnsTotalSpace = containerWidth - (gutterTotalSpace);
            var oneColumnSpace = columnsTotalSpace/columns;

            menuGrid.find('.ig-menu-grid-item').each(function(index,el)
            {
                $(el).css('width',oneColumnSpace+'px');
                $(el).css('margin-bottom',(menuGridPadding -1)+'px');

                if($(el).find('img').length)
                {
                    var imgWidth = $(el).find('img').attr('width');
                    var imgHeight = $(el).find('img').attr('height');

                    var newHeight = Math.ceil(((oneColumnSpace/imgWidth) * imgHeight)) + 1;
                    if(newHeight > imgHeight)
                    {
                        newHeight = imgHeight;
                    }

                    if($(el).find('.ig-menu-grid-text').length && $(el).find('.ig-menu-grid-text').hasClass('igui-overlay') == false)
                    {
                        newHeight = parseInt(newHeight) + parseInt($(el).find('.ig-menu-grid-text').outerHeight()) + 10;
                    }

                    $(el).css('height',newHeight+'px');
                }
            });

            menuGrid.isotopeIG({
                layoutMode: 'fitRows',
                itemSelector: '.ig-menu-grid-item',
                fitRows: {
                    gutter: (menuGridPadding -1),
                }
            });


            if(menuGrid.data('init') == 0)
            {
                document.addEventListener('lazyloaded', function(e)
                {
                    menuGrid.isotopeIG('layout');
                });
            }
            menuGrid.data('init',1);
        }

        if(menuGridType == 'by_rows')
        {
            rowsGrid();
            setTimeout(function(){rowsGrid();}, 200);
            setTimeout(function(){rowsGrid();}, 500);

            $(window).resize(function()
            {
                if(menuGrid.data('resizing') == 0)
                {
                    rowsGrid();
                    setTimeout(function(){rowsGrid();}, 100);
                    setTimeout(function(){rowsGrid();}, 200);
                    setTimeout(function(){rowsGrid();}, 500);
                    menuGrid.data('resizing',1);
                }
                setTimeout(function(){menuGrid.data('resizing',0);}, 50);
            });
        }

        //justified grid
        var thumbSizes = [];
        var largestHeight = 0;
        var sumHeights = 0;
        var smallestHeight = 5000;
        var spacing = parseInt(menuGrid.attr('data-ig-menugridmargin'));
        menuGrid.find('.ig-menu-grid-item').each(function(index,el)
        {
            if($(el).find('.ig-menu-grid-image').length)
            {
                var width = $(el).find('.ig-menu-grid-image').attr('width');
                var height = $(el).find('.ig-menu-grid-image').attr('height');
                if( !$(el).find('.ig-menu-grid-text').hasClass('igui-overlay') )
                {
                    height = parseInt(height) + (parseInt($(el).find('.ig-menu-grid-text').height()) * 1.2);
                }
            }
            else
            {
                width = maxColumnWidth;
                height = maxColumnHeight;
            }

            thumbSizes.push({width: width,height: height});
            largestHeight = height > largestHeight ? height : largestHeight;
            sumHeights = sumHeights + parseInt(height);
            smallestHeight = height < smallestHeight ? height : smallestHeight;
        });

        var averageHeight = Math.round(sumHeights/(menuGrid.find('.ig-menu-grid-item').length));
        var targetHeight = $(window).width() > 1000 ? smallestHeight*0.8 : smallestHeight*0.6;

        function menuJustifiedGrid()
        {
            if(menuGrid.width() < 300)
            {
                menuGrid.css('height','auto');
                menuGrid.find('.ig-menu-grid-item').css({'width':'auto', 'height':'auto', 'top':'auto', 'left':'auto','position':'static'});
                rowsGrid();
            }
            else
            {
                menuGrid.removeClass('igui-child-width-1-1 igui-child-width-1-2 igui-child-width-1-3 igui-child-width-1-4 igui-child-width-1-5 igui-child-width-1-6 igui-child-width-1-7 igui-child-width-1-8 igui-child-width-1-9 igui-child-width-1-10  igui-child-width-1-11 igui-child-width-1-12 igui-child-width-1-13 igui-child-width-1-14 igui-child-width-1-15 igui-grid-small igui-grid-medium igui-grid-collapse');

                var justifiedData = require('justified-layout')(thumbSizes,
                {
                    containerWidth:menuGrid.width(),
                    targetRowHeight: targetHeight,
                    boxSpacing:spacing,
                    targetRowHeightTolerance: 0.15
                });

                $.each(justifiedData.boxes,function(index,box)
                {
                    menuGrid.find('.ig-menu-grid-item').eq(index).css({'width':box.width, 'height':box.height, 'top':box.top, 'left':box.left,'position':'absolute'});
                });
                menuGrid.css('height',justifiedData.containerHeight+'px');

                if(menuGrid.data('init') == 0)
                {
                    document.addEventListener('lazyloaded', function(e)
                    {
                        menuJustifiedGrid();
                    });
                }
                menuGrid.data('init',1);
            }
        }

        if(menuGridType == 'justified')
        {
            menuJustifiedGrid();

            $(window).resize(function()
            {
                menuJustifiedGrid();
            });
        }


        $('.ig-menu-grid-link').each(function(index,el)
        {
            $(el).imagesLoaded( function()
            {
                $(el).find('.ig-menu-grid-text').css('display','block');
            });
        });

        setTimeout(function(){menuGrid.css('visibility','visible');}, 700);

        if(menuGrid.attr('data-ig-menuclick') == 'lightbox')
        {
            $('.ig-menu-grid-link').on('click', function(e)
            {
                e.preventDefault();
                $('body, html').css('overflow','hidden');
                var galleryId = $(this).attr('data-gallery-id');
                var htmlId = 'ig-menu-to-lbox-'+galleryId;
                var link = menuGrid.attr('data-ig-basehref') + '/index.php?option=com_igallery&view=category&tmpl=component&lboxview=1&igid=' + galleryId + '&shareurl=' + encodeURIComponent(window.location.href);
                var iframe = $('<iframe src=' + link + ' style="display:none; width:100vw; height:100vh; height:100dvh; background-color:#000; position:fixed; top:0px; left:0px; z-index:10000000000;" id="' + htmlId + '" class="ig-menu-to-lbox" frameborder="0" scrolling="no"></iframe>');

                $(document.body).append(iframe);
                $('#'+htmlId).css('display','block');

                if(menuGrid.attr('data-ig-lightbox-fullscreen') == 'open-fullscreen')
                {
                    $('#'+htmlId).fullScreen(true);
                }


                window.igCloseModal = function()
                {
                    if($(document).fullScreen())
                    {
                        $(document).fullScreen(false);
                    }
                    $('.ig-menu-to-lbox').remove();
                    $('body, html').css('overflow','auto');
                };

            });
        }

    });



    $('.ig-gallery-wrapper').each(function(index,el)
    {
        var panel = null;
        var panelIds = Array();
        var isIOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
        var isAndroid = (navigator.userAgent.toLowerCase().indexOf("android") > -1);

        var galleryWrapper = $(el);
        var lboxWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid') );
        galleryWrapper.data('hits-pause',0);
        galleryWrapper.data('swipe-active',0);
        galleryWrapper.data('firstShown', false);
        galleryWrapper.data('lboxPlaying', false);
        galleryWrapper.data('lboxRecaptchaInit',0);

        var imgsToPreload = [];

        galleryWrapper.find(".ig-description-overlay a").click(function(e)
        {
            e.stopPropagation();
        });

        if(window.location.href.search('thumb_limitstart') != -1 && getUrlParamater('i') == 'unset')
        {
            //window.location.hash = 'ig-gallery-wrapper-' + galleryWrapper.attr('data-ig-uniqueid');
        }

        if(galleryWrapper.attr('data-ig-disable-rightclick') == 1)
        {
            galleryWrapper.find('.ig-slideshow-image, .ig-thumbs-grid-image, .ig-thumbs-grid-hover').on('contextmenu',function(){
                alert(galleryWrapper.attr('data-ig-rightclick-msg'));
                return false;
            });

            galleryWrapper.find('.ig-thumbs-grid-image').on('dragstart', function(event){
                event.preventDefault();
            });
        }

        //slideshow
        if(galleryWrapper.attr('data-ig-show-main-image') == 1)
        {
            var imgHash = getUrlParamater('i');

            var slideShowInitIndex = 0;
            if(imgHash.length > 0)
            {
                var elementToFind = galleryWrapper.find(".ig-slideshow-item[data-ig-imagehash='" + imgHash + "']");
                if (elementToFind.length)
                {
                    slideShowInitIndex = elementToFind.index();
                    loadImageNow(slideShowInitIndex);
                    addToPreload(slideShowInitIndex + 1);
                    addToPreload(slideShowInitIndex + 2);
                    addToPreload(slideShowInitIndex + 3);
                    addToPreload(slideShowInitIndex + 4);
                    addToPreload(slideShowInitIndex + 5);
                    addToPreload(slideShowInitIndex + 6);
                    addToPreload(slideShowInitIndex - 1);
                    addToPreload(slideShowInitIndex - 2);
                }
            }

            if (slideShowInitIndex == 0)
            {
                for (var i = 0; i < 20; i++) {
                    addToPreload(i);
                }
            }

            var velocity = parseFloat( galleryWrapper.find('.ig-slideshow').attr('data-ig-transition-duration') );
            velocity = velocity == 0 ? 200 : velocity;

            var autoplay = Boolean(Number(galleryWrapper.find('.ig-slideshow').attr('data-ig-autoplay')));
            var finite = galleryWrapper.find('.ig-slideshow').attr('data-ig-infinite') == 1 ? false : true;

            var slideshow = iguiUIkit.slideshow(galleryWrapper.find('.ig-slideshow'),
            {
                animation: galleryWrapper.find('.ig-slideshow').attr('data-ig-fade'),
                index: slideShowInitIndex,
                finite: finite,
                velocity: (400/velocity),
                ratio: galleryWrapper.find('.ig-slideshow').attr('data-ig-ratio'),
                autoplay: autoplay,
                autoplayInterval: parseInt(galleryWrapper.find('.ig-slideshow').attr('data-ig-interval')),
                maxHeight: parseInt(galleryWrapper.find('.ig-slideshow').attr('data-ig-max-height'))
            });

            //allow creation of custom links that load a slideshow image
            $('.ig-slideshow-custom-link').on('click', function(e)
            {
                e.preventDefault();
                var galleryId = $(this).attr('data-gallery-id');
                var imageIndex = $(this).attr('data-image-index') > 0 ? $(this).attr('data-image-index') -1 : 0;
                if(galleryId == galleryWrapper.attr('data-ig-uniqueid'))
                {
                    slideshow.show(imageIndex);
                }
            });

            galleryWrapper.find('.ig-slideshow').find('iframe').each(function (index, el)
            {
                iguiUIkit.video(el, {automute: false,autoplay:false});
            });

            if(galleryWrapper.find('.ig-slideshow .ig-description-overlay').length && galleryWrapper.find('.ig-slideshow .ig-dotnav').length )
            {
                galleryWrapper.find('.ig-slideshow .ig-dotnav').css('margin-bottom','8px');
                galleryWrapper.find('.ig-slideshow .ig-description-overlay').css('padding-bottom','28px');
            }

            galleryWrapper.find('.ig-slideshow-notlazy').parent().each(function (index, el)
            {
                $(el).imagesLoaded( function()
                {
                    $(el).find('.ig-description-overlay').css('visibility','visible');
                });
            });

            galleryWrapper.find('.ig-slideshow-image').on('load', function()
            {
                $(this).parent().find('.ig-description-overlay').css('visibility','visible');
            });

            if(galleryWrapper.find('.ig-play-icon').length)
            {
                if(autoplay)
                {
                    galleryWrapper.find('.ig-pause-icon').css('display','inline-block');
                    galleryWrapper.find('.ig-play-icon').css('display','none');
                }

                galleryWrapper.find('.ig-play-icon').on('click', function(event)
                {
                    slideshow.autoplay = true;
                    slideshow.startAutoplay();
                    galleryWrapper.find('.ig-play-icon').css('display','none');
                    galleryWrapper.find('.ig-pause-icon').css('display','inline-block');
                    galleryWrapper.data('lboxPlaying', true);
                });

                galleryWrapper.find('.ig-pause-icon').on('click', function(event)
                {
                    slideshow.stopAutoplay();
                    slideshow.autoplay = false;
                    galleryWrapper.find('.ig-pause-icon').css('display','none');
                    galleryWrapper.find('.ig-play-icon').css('display','inline-block');
                    galleryWrapper.data('lboxPlaying', false);
                });

                galleryWrapper.find('.ig-slideshow-button, .ig-slideshow-image').on('click', function(event)
                {
                    galleryWrapper.find('.ig-pause-icon').css('display','none');
                    galleryWrapper.find('.ig-play-icon').css('display','inline-block');
                });
            }

            galleryWrapper.find('.ig-slideshow').on('beforeitemshow', function ()
            {
                loadImageNow(slideshow.index);
                addToPreload(slideshow.index + 1);
                addToPreload(slideshow.index + 2);
                addToPreload(slideshow.index + 3);
                addToPreload(slideshow.index + 4);
                addToPreload(slideshow.index - 1);
                addToPreload(slideshow.index - 2);

                setTimeout(checkImageHeight, 20);
                setTimeout(checkImageHeight, 50);
                setTimeout(checkImageHeight, 80);
                setTimeout(checkImageHeight, 100)
                setTimeout(checkImageHeight, 150);

                iframeWidth();
                setTimeout(iframeWidth, 100);
                setTimeout(iframeWidth, 400);


            });

            if(galleryWrapper.find('.ig-gdpr-slideshow-submit').length)
            {
                var gdprAlready = localStorage.getItem('ig-gdpr') == '1' ? true : false;
                if(gdprAlready)
                {
                    galleryWrapper.find('.ig-gdpr-slideshow').css('display','none');
                    galleryWrapper.find('.ig-gdpr-preview').css('display','none');
                }
                else
                {
                    galleryWrapper.find('.ig-gdpr-slideshow-submit').each(function(index,el)
                    {
                        $(el).on('click', function(e)
                        {
                            localStorage.setItem('ig-gdpr','1');
                            var elIndex = $(el).parent().attr('data-index');
                            loadImageNow(slideshow.index);
                            galleryWrapper.find('.ig-gdpr-slideshow').css('display','none');
                            galleryWrapper.find('.ig-gdpr-preview').css('display','none');

                            galleryWrapper.find('.ig-slideshow-item').each(function(index,el)
                            {
                                var iframeObj = $(el).find('iframe');

                                if(iframeObj.length)
                                {
                                    var dataSrc = iframeObj.attr('data-ig-lazy-src');
                                    if(typeof dataSrc !== 'undefined')
                                    {
                                        if (dataSrc.indexOf('youtu') !== -1 || dataSrc.indexOf('vimeo') !== -1)
                                        {
                                            addToPreload(index);
                                        }
                                    }

                                }
                            });
                        });

                    });
                }
            }

            function iframeWidth()
            {
                var iframe = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('iframe');
                if(iframe.length == 0){return;}

                var ssWidth = galleryWrapper.find('.ig-slideshow').width();
                var ssHeight = galleryWrapper.find('.ig-slideshow').height();
                var ssRatio = ssWidth/ssHeight;

                var ifrWidth = $(iframe).width();
                var ifrHeight = $(iframe).height();
                var iframeRatio = ifrWidth/ifrHeight;

                if(ifrWidth < 50 || ifrHeight < 50 || ssWidth < 50 || ssHeight < 50){return;}

                if(iframeRatio >= ssRatio)
                {
                    var newWidth = ssWidth;
                    var newHeight = Math.round( (newWidth/ifrWidth) * ifrHeight );
                }
                else
                {
                    var newHeight = ssHeight;
                    var newWidth = Math.round( (newHeight/ifrHeight) * ifrWidth );
                }

                $(iframe).css('width',newWidth+'px');
                $(iframe).css('height',newHeight+'px');
            }

            function checkImageHeight()
            {
                var wrapperHeight = galleryWrapper.find('.igui-slideshow-items').height();

                if(wrapperHeight > 100)
                {
                    var currentImg = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-slideshow-image');
                    var imageHeight = currentImg.height();

                    if(imageHeight > wrapperHeight)
                    {
                        galleryWrapper.find('.ig-slideshow-item.igui-active .ig-slideshow-item-inner-lboxon, .ig-slideshow-item.igui-active ig-slideshow-item-inner').css('height',wrapperHeight+'px');
                    }

                    if(wrapperHeight > (imageHeight + 10))
                    {
                        var naturalImgHeight = parseInt( currentImg.prop('naturalHeight') );
                        if(naturalImgHeight > (wrapperHeight + 3))
                        {
                            galleryWrapper.find('.ig-slideshow-item.igui-active .ig-slideshow-item-inner-lboxon').css('height','auto');
                        }
                    }
                }
            }

            setInterval(checkImageHeight, 300);
        }

        function addToPreload(index)
        {
            if(galleryWrapper.attr('data-ig-show-main-image') == 0 || galleryWrapper.find('.ig-slideshow').attr('data-ig-preload-main') == 0)
            {
                return;
            }

            var gdprConsent = parseInt(galleryWrapper.attr('data-ig-gdpr'));
            var gdprAlready = localStorage.getItem('ig-gdpr') == '1' ? true : false;
            var isGdprVid = false;
            var iframeObj = galleryWrapper.find('.ig-slideshow-item').eq(index).find('iframe');

            if(iframeObj.length)
            {
                var dataSrc = iframeObj.attr('data-ig-lazy-src');
                if(typeof dataSrc !== 'undefined')
                {
                    if( dataSrc.indexOf('youtu') !== -1 || dataSrc.indexOf('vimeo') !== -1)
                    {
                        isGdprVid = true;
                    }
                }
            }

            if(gdprConsent == 1 && !gdprAlready && isGdprVid)
            {
                return;
            }

            if(index < galleryWrapper.find('.ig-slideshow-item').length && index >= 0)
            {
                if( imgsToPreload.indexOf(index) == -1 )
                {
                    imgsToPreload.push(index);
                }
            }
        }

        function preloadImage()
        {
            if(imgsToPreload.length)
            {
                index = imgsToPreload.shift();
                imgObj = galleryWrapper.find('.ig-slideshow-item').eq(index).find('img.ig-slideshow-image');

                if(imgObj.length)
                {
                    if(imgObj.data('preloaded') != 1)
                    {
                        var lazySrc = imgObj.attr('data-ig-lazy-src');
                        if(typeof lazySrc === 'undefined'){lazySrc = imgObj.attr('data-ig-lazy-data-src');}
                        if(typeof lazySrc !== 'undefined')
                        {
                            imgObj.attr('src',lazySrc);
                            imgObj.data('preloaded',1);
                        }
                    }
                }

                iframeObj = galleryWrapper.find('.ig-slideshow-item').eq(index).find('iframe, video');
                if(iframeObj.length)
                {
                    if(iframeObj.data('preloaded') != 1)
                    {
                        iframeObj.attr('src',iframeObj.attr('data-ig-lazy-src'));
                        iframeObj.data('preloaded',1);
                    }
                }

            }
        }

        function loadImageNow(index)
        {
            var imgObj = galleryWrapper.find('.ig-slideshow-item').eq(index).find('img.ig-slideshow-image');
            if(imgObj.length)
            {

                if(imgObj.data('preloaded') != 1)
                {
                    var lazySrc = imgObj.attr('data-ig-lazy-src');
                    if(typeof lazySrc !== 'undefined')
                    {
                        imgObj.attr('src',lazySrc);
                        imgObj.data('preloaded',1);
                    }
                }
            }

            iframeObj = galleryWrapper.find('.ig-slideshow-item').eq(index).find('iframe, video');
            if(iframeObj.length)
            {
                if(iframeObj.data('preloaded') != 1)
                {
                    var gdprConsent = parseInt(galleryWrapper.attr('data-ig-gdpr'));
                    var gdprAlready = localStorage.getItem('ig-gdpr') == '1' ? true : false;
                    var isGdprVid = false;
                    var dataSrc = iframeObj.attr('data-ig-lazy-src');
                    if(typeof dataSrc !== 'undefined')
                    {
                        if( dataSrc.indexOf('youtu') !== -1 || dataSrc.indexOf('vimeo') !== -1)
                        {
                            isGdprVid = true;
                        }
                    }

                    if(gdprConsent == 1 && !gdprAlready && isGdprVid)
                    {
                        return;
                    }

                    var lazySrc = iframeObj.attr('data-ig-lazy-src');
                    if(typeof lazySrc !== 'undefined')
                    {
                        iframeObj.attr('src',iframeObj.attr('data-ig-lazy-src'));
                        iframeObj.data('preloaded',1);
                    }

                }
            }
        }

        if(galleryWrapper.attr('data-ig-show-main-image') == 1)
        {
            setInterval(preloadImage ,750);
        }

        var lastItemshowIndex = -1;

        galleryWrapper.find('.ig-slideshow').on('itemshow', function()
        {
            if(lastItemshowIndex == slideshow.index)
            {
                return;
            }

            loadImageNow(slideshow.index);

            //swap descriptions
            galleryWrapper.find('.ig-image-description').css('display','none');
            galleryWrapper.find('.ig-image-description').eq(slideshow.index).css('display','block');

            //swap active thumb
            galleryWrapper.find('.ig-scroller-img-wrapper').removeClass('ig-active-thumb');
            galleryWrapper.find('.ig-scroller-img-wrapper').eq(slideshow.index).addClass('ig-active-thumb');

            //swap comments
            if(galleryWrapper.find('.ig-comments').length)
            {
                var commentContent = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-comments-content').html();
                galleryWrapper.find('.ig-comments').find('.ig-comments-list').html(commentContent);
                galleryWrapper.find('.ig-comment-count').html(galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-comments-content .ig-comment').length);

                galleryWrapper.find('.ig-comments-textarea-wrapper').css('display','none');
            }

            //swap rating
            if(galleryWrapper.find('.ig-rating').length)
            {
                var rating = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-rating').toString();
                var ratingWidth = rating.length < 2 ? 23 : 28;
                var ratingWidth = rating.length > 2 ? 33 : ratingWidth;
                galleryWrapper.find('.ig-rating').css('width',ratingWidth+'px');
                galleryWrapper.find('.ig-rating-number').html(rating);
            }


            //add hit
            if(galleryWrapper.attr('data-ig-collecthits') == 1)
            {
                if(galleryWrapper.data('hits-pause') == 0)
                {
                    var imageid = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-imageid');
                    var hitUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addHit&format=raw&id=' + imageid;
                    $.ajax({url: hitUrl, success: function(result){}});

                    galleryWrapper.data('hits-pause',1);
                    setTimeout(function(){galleryWrapper.data('hits-pause',0)}, 500);
                }
            }

            //swap hit
            var hitCount = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-hits');
            galleryWrapper.find('.ig-hits-number').html(hitCount);

            //swap image number
            galleryWrapper.find('.ig-image-number').html(slideshow.index + 1);

            //swap hash
            if(galleryWrapper.attr('data-ig-showhash') == 'hash' && $(this).data('firstShown') == true && !lboxWrapper.hasClass('igui-open') && galleryWrapper.attr('data-ig-show-main-image') == 1)
            {
                imageUrl(slideshow.index,true);
            }

            $(this).data('firstShown', true);
            lastItemshowIndex = slideshow.index;

            //check thumb position
            var currentThumb = galleryWrapper.find('.ig-scroller-img-wrapper').eq(slideshow.index);

            if(galleryWrapper.find('.ig-thumb-scroller-horizontal').length)
            {
                var thumbPosition = currentThumb.position().left;
                var containerWidth = galleryWrapper.find('.ig-thumb-scroller').width();

                if(slideshow.index == 0)
                {
                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(0,400);
                }
                else if(thumbPosition > (containerWidth + galleryWrapper.find('.ig-thumb-scroller-inner').scrollLeft()))
                {
                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(currentThumb,400);
                }
                else if(thumbPosition < galleryWrapper.find('.ig-thumb-scroller-inner').scrollLeft() )
                {
                    var position = thumbPosition - (containerWidth - currentThumb.width());
                    var position = position < 0 ? 0 : position;
                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(position,400);
                }

            }
            else if(galleryWrapper.find('.ig-thumb-scroller-vertical').length)
            {
                var thumbPosition = currentThumb.position().top;
                var containerHeight = galleryWrapper.find('.ig-thumb-scroller').height();

                if(slideshow.index == 0)
                {
                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(0,400);
                }
                else if(thumbPosition > (containerHeight + galleryWrapper.find('.ig-thumb-scroller-inner').scrollTop()))
                {
                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(currentThumb,400);
                }
                else if(thumbPosition < galleryWrapper.find('.ig-thumb-scroller-inner').scrollTop() )
                {
                    var position = thumbPosition - (containerHeight - currentThumb.height());
                    var position = position < 0 ? 0 : position;

                    galleryWrapper.find('.ig-thumb-scroller-inner').scrollTo(position,400);
                }
            }
        });

        galleryWrapper.find('.ig-slideshow-matchheight').matchHeightx({byRow: false,target: galleryWrapper.find('.igui-slideshow-items')});
        setTimeout(function(){galleryWrapper.find('.ig-slideshow-matchheight').matchHeightx({byRow: false,target: galleryWrapper.find('.igui-slideshow-items')});}, 300);

        //thumbnail scroller main
        var thumbScrollerWrapper = galleryWrapper.find('.ig-thumb-scroller-main');
        var vertical = thumbScrollerWrapper.hasClass('ig-thumb-scroller-vertical');
        var hoverRightThumbArrow = false;
        var hoverLeftThumbArrow = false;
        var hoverDownThumbArrow = false;
        var hoverUpThumbArrow = false;

        galleryWrapper.find('.ig-thumb-scroller-down').on('click', function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() + 350;
            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 500,{easing:'linear',onAfter: function()
                {
                    if(hoverDownThumbArrow)
                    {
                        thumbScrollerWrapper.find('.ig-thumb-scroller-down').trigger('mouseenter');
                    }
                }});
        });

        galleryWrapper.find('.ig-thumb-scroller-up').on('click', function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() - 350;

            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 500,{easing:'linear',onAfter: function()
                {
                    if(hoverUpThumbArrow)
                    {
                        thumbScrollerWrapper.find('.ig-thumb-scroller-up').trigger('mouseenter');
                    }
                }});
        });

        thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('click', function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
            var scrollPx = $(window).width() < 600 ? $(window).width()-50 : 600;
            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() - scrollPx;

            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 700,{easing:'linear',onAfter: function()
                {
                    if(hoverLeftThumbArrow)
                    {
                        thumbScrollerWrapper.find('.igui-slidenav-previous').trigger('mouseenter');
                    }
                }});
        });

        thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('click', function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
            var scrollPx = $(window).width() < 600 ? $(window).width()-50 : 600;
            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() + scrollPx;

            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 700,{easing:'linear',onAfter: function()
                {
                    if(hoverRightThumbArrow)
                    {
                        thumbScrollerWrapper.find('.igui-slidenav-next').trigger('mouseenter');
                    }
                }});
        });

        setTimeout(function()
        {
            if(thumbScrollerWrapper.find('.ig-slider-items').height() < galleryWrapper.height() && vertical)
            {
                galleryWrapper.find('.ig-thumb-scroller-down').css('visibility','hidden');
                galleryWrapper.find('.ig-thumb-scroller-up').css('visibility','hidden');
            }

            if(thumbScrollerWrapper.width() < galleryWrapper.width() && !vertical)
            {
                thumbScrollerWrapper.find('.igui-slidenav-previous').css('visibility','hidden');
                thumbScrollerWrapper.find('.igui-slidenav-next').css('visibility','hidden');
            }

        }, 300);

        if( getComputedStyle(document.documentElement).direction != 'rtl' && !isIOS && !isAndroid)
        {

            //right arrow hover
            thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('mouseenter', function()
            {
                hoverRightThumbArrow = true;
                var duration = (thumbScrollerWrapper.find('.ig-slider-items')[0].scrollWidth  - (thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() + thumbScrollerWrapper.width())) * 3;
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo('max', duration, {easing: 'linear'});
            });

            thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('mouseleave', function()
            {
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                hoverRightThumbArrow = false;
            });

            //left arrow hover
            thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('mouseenter', function()
            {
                hoverLeftThumbArrow = true;
                var duration = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() * 3;
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(0, duration,{easing:'linear'});
            });

            thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('mouseleave', function()
            {
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                hoverLeftThumbArrow = false;
            });

            //down arrow hover
            thumbScrollerWrapper.find('.ig-thumb-scroller-down').on('mouseenter', function()
            {
                hoverDownThumbArrow = true;
                var duration = (thumbScrollerWrapper.find('.ig-slider-items')[0].scrollHeight  - (thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() + thumbScrollerWrapper.height())) * 3;
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo('max', duration, {easing: 'linear'});
            });

            thumbScrollerWrapper.find('.ig-thumb-scroller-down').on('mouseleave', function()
            {
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                hoverDownThumbArrow = false;
            });

            //up arrow hover
            thumbScrollerWrapper.find('.ig-thumb-scroller-up').on('mouseenter', function()
            {
                hoverUpThumbArrow = true;
                var duration = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() * 3;
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(0, duration,{easing:'linear'});
            });

            thumbScrollerWrapper.find('.ig-thumb-scroller-up').on('mouseleave', function()
            {
                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                hoverUpThumbArrow = false;
            });
        }

        //overlay buttons
        galleryWrapper.find('.ig-slideshow-overlay').find('.ig-download-button').on('click', function(event)
        {
            var imageid = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-imageid');
            window.location.href = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.download&format=raw&type=main&id=' + imageid;
        });

        galleryWrapper.find('.ig-slideshow-overlay').find('.ig-facebook-share').on('click', function(event)
        {
            var urlToShare = 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent( imageUrl(slideshow.index,false) );
            window.open(urlToShare, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();
        });

        galleryWrapper.find('.ig-slideshow-overlay').find('.ig-twitter-share').on('click', function(event)
        {
            var urlToShare = 'http://twitter.com/share?url=' + encodeURIComponent( imageUrl(slideshow.index,false) );
            window.open(urlToShare, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();

        });

        galleryWrapper.find('.ig-slideshow-overlay').find('.ig-pinterest-share').on('click', function(event)
        {
            var imagePathLong = galleryWrapper.find('.ig-slideshow-image').eq(slideshow.index).attr('src');
            var imgPathShort = imagePathLong.slice(imagePathLong.indexOf('images/igallery'));
            var imgUrl = galleryWrapper.attr('data-ig-basehref-long') + imgPathShort;

            var description  = galleryWrapper.find('.ig-image-description').eq(slideshow.index).text();
            description = description.length > 0 ? description : galleryWrapper.find('.ig-slideshow-image').eq(slideshow.index).attr('alt');

            var href = 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent( imageUrl(slideshow.index,false) ) + '&media=' + encodeURIComponent(imgUrl) + '&description=' + description;
            window.open(href, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();
        });

        galleryWrapper.find('.ig-slideshow-overlay').find('.ig-rating').on('click', function(event)
        {
            var imageid = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-imageid');
            var ratingUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addRating&format=raw&rating=5&imageid=' + imageid;

            $.ajax
            ({
                url: ratingUrl,
                error: function(response){console.log(response);},
                success: function(response)
                {
                    console.log(response);
                    responseObj = $.parseJSON(response);

                    if(responseObj.success == 1)
                    {
                        var currentRating = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-rating');
                        galleryWrapper.find('.ig-rating-number').html(parseInt(currentRating) + 1);
                        galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-rating',(parseInt(currentRating) + 1));
                    }

                }
            });
        });

        galleryWrapper.find('.ig-add-comment-text').click(function(event)
        {
            galleryWrapper.find('.ig-comments-textarea-wrapper').css('display','block');
            if(typeof slideshow != 'undefined')
            {
                slideshow.stopAutoplay();
                slideshow.autoplay = false;
                galleryWrapper.data('lboxPlaying', false);
                galleryWrapper.find('.ig-pause-icon').css('display','none');
                galleryWrapper.find('.ig-play-icon').css('display','inline-block');
            }
        });

        if(typeof slideshow == 'undefined' && galleryWrapper.find('.ig-comments').length)
        {
            var slideshow = {index:0};
            var commentContent = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-comments-content').html();
            galleryWrapper.find('.ig-comments').find('.ig-comments-list').html(commentContent);
            galleryWrapper.find('.ig-comment-count').html(galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-comments-content .ig-comment').length);
        }

        galleryWrapper.find('.ig-comments-form').submit(function(event)
        {
            event.preventDefault();
            var imageid = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).attr('data-ig-imageid');
            var commentUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addComment&format=raw&imageid=' + imageid;
            var postData = galleryWrapper.find('.ig-comments-form').serialize();
            var commentText = galleryWrapper.find('.igui-textarea').val();

            if(galleryWrapper.find('.ig-comments-form').find('#dynamic_recaptcha_1').length)
            {
                //postData = postData +'&g-recaptcha-response='+grecaptcha.getResponse();
            }

            $.ajax
            ({
                type: "POST",
                url: commentUrl,
                data: postData,
                error: function(response){console.log(response);},
                success: function(response)
                {
                    console.log(response);
                    responseObj = $.parseJSON(response);

                    if(responseObj.success == 1)
                    {
                        var commentsContentWrapper = galleryWrapper.find('.ig-slideshow-item').eq(slideshow.index).find('.ig-comments-content');
                        var usersName = galleryWrapper.find('.ig-comments-text-summary').attr('data-ig-current-user-name');
                        commentsContentWrapper.append('<div class="ig-comment-data">'+usersName+'</div><div>'+commentText+'</div>');
                        galleryWrapper.find('.ig-comments-list').html(commentsContentWrapper.html());
                        galleryWrapper.find('.igui-textarea').val('');
                    }

                }
            });
        });

        //thumbs grid functions
        var thumbGridWrapper = galleryWrapper.find('.ig-thumbs-grid');
        var thumbGridType = thumbGridWrapper.attr('data-ig-grid-type');
        thumbGridWrapper.data('resizing',0);

        if(thumbGridWrapper.length)
        {
            thumbGridWrapper.data('init',0);

            function justifiedGrid()
            {
                var thumbSizes = [];
                var largestHeight = 0;
                var smallestHeight = 5000;
                var sumHeights = 0;
                var spacing = parseInt(galleryWrapper.find('.ig-thumbs-grid').attr('data-ig-thumb-spacing'));

                galleryWrapper.find('.ig-thumbs-grid').find('.ig-thumbs-grid-image:visible').each(function(index,el)
                {
                    thumbSizes.push({width: $(el).attr('width'),height: $(el).attr('height')});
                    largestHeight = $(el).attr('height') > largestHeight ? $(el).attr('height') : largestHeight;
                    smallestHeight = $(el).attr('height') < smallestHeight ? $(el).attr('height') : smallestHeight;
                    sumHeights = sumHeights + parseInt($(el).attr('height'));
                });

                var averageHeight = Math.round(sumHeights/(galleryWrapper.find('.ig-thumbs-grid-image').length));
                var targetHeight = $(window).width() > 1000 ? smallestHeight*0.8 : smallestHeight*0.6;

                if(thumbGridWrapper.width() < 300)
                {
                    thumbGridWrapper.css('height','auto');
                    thumbGridWrapper.find('.ig-thumbs-grid-block').css({'width':'auto', 'height':'auto', 'top':'auto', 'left':'auto','position':'static'});
                    thumbRowsGrid();
                }
                else
                {
                    var justifiedData = require('justified-layout')(thumbSizes,
                        {
                            containerWidth:galleryWrapper.find('.ig-thumbs-grid').width(),
                            targetRowHeight:targetHeight,
                            boxSpacing:spacing,
                            targetRowHeightTolerance: 0.15
                        });

                    $.each(justifiedData.boxes,function(index,box)
                    {
                        galleryWrapper.find('.ig-thumbs-grid-block:visible').eq(index).css({'width':box.width, 'height':box.height, 'top':box.top, 'left':box.left,'position':'absolute'});
                    });

                    galleryWrapper.find('.ig-thumbs-grid').css('height',justifiedData.containerHeight+'px');

                    if(thumbGridWrapper.data('init') == 0)
                    {
                        document.addEventListener('lazyloaded', function(e)
                        {
                            justifiedGrid();
                        });
                    }
                    thumbGridWrapper.data('init',1);
                }
            }


            if(thumbGridType == 'justified')
            {
                justifiedGrid();
                $(window).resize(function()
                {
                    justifiedGrid();
                });
            }

            if(galleryWrapper.find('.ig-tags-button-wrapper').length && thumbGridType == 'justified')
            {
                $('.ig-tags-button').on('click', function(event)
                {
                    var filterValue = $(this).attr('data-filter');
                    thumbGridWrapper.find('.ig-thumbs-grid-block').css({'width':'auto', 'height':'auto', 'top':'auto', 'left':'auto','position':'static'});
                    thumbGridWrapper.find('.ig-thumbs-grid-block:not('+filterValue+')').css('display','none');
                    thumbGridWrapper.find(filterValue).css('display','block');
                    justifiedGrid();

                    galleryWrapper.find('.ig-tags-button').removeClass('ig-tags-button-active');
                    $(this).addClass('ig-tags-button-active');

                    var panelWrapper = $('#ig-lightbox-'+galleryWrapper.attr('data-ig-uniqueid'));
                    $(document).off('show shown beforeitemshow itemshown beforehide hidden', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                    panelWrapper.remove();
                    galleryWrapper.data('lightboxInit',0);

                    panel = createPanel(filterValue);
                    galleryWrapper.data('tag-filter',filterValue);

                    var panelWrapper = $('#ig-lightbox-'+galleryWrapper.attr('data-ig-uniqueid'));
                });

                if(galleryWrapper.find('.ig-tags-button-wrapper').attr('data-show-all') == 0)
                {
                    setTimeout(function(){galleryWrapper.find('.ig-tags-button').eq(0).click();}, 200);
                }
            }

            function masonryThumbsGrid()
            {
                var maxColumnWidth = parseInt(thumbGridWrapper.attr('data-ig-max-width'));
                var gridPadding = parseInt(thumbGridWrapper.attr('data-ig-thumb-spacing'));
                var containerWidth = parseInt(galleryWrapper.width());

                var columns = Math.ceil(containerWidth/(maxColumnWidth + (gridPadding * 1.5)));
                var gutterTotalSpace = gridPadding * (columns -1);
                var columnsTotalSpace = containerWidth - (gutterTotalSpace);
                var oneColumnSpace = columnsTotalSpace/columns;

                var lastContainerWidth = thumbGridWrapper.data('last-grid-width');
                if(typeof lastContainerWidth === 'undefined'){lastContainerWidth = 0}

                if(containerWidth != lastContainerWidth)
                {
                    thumbGridWrapper.find('.ig-thumbs-grid-block').each(function(index,el)
                    {
                        $(el).css('width',oneColumnSpace+'px');
                        $(el).css('margin-bottom',gridPadding+'px');

                        var imgWidth = $(el).find('img').attr('width');
                        var imgHeight = $(el).find('img').attr('height');

                        var newHeight = Math.ceil(((oneColumnSpace/imgWidth) * imgHeight)) + 1;
                        if(newHeight > imgHeight)
                        {
                            newHeight = imgHeight;
                        }

                        if($(el).find('.ig-thumb-text_below').length > 0)
                        {
                            newHeight = parseInt(newHeight) + parseInt($(el).find('.ig-thumb-text_below').outerHeight());
                        }

                        $(el).css('height',newHeight+'px');
                    });

                    thumbGridWrapper.isotopeIG({
                        layoutMode: 'masonry',
                        itemSelector: '.ig-thumbs-grid-block',
                        masonry: {
                            columnWidth: oneColumnSpace,
                            gutter: gridPadding,
                            resize: false,
                            fitWidth: true,
                            transitionDuration: 0
                        }
                    });
                }

                thumbGridWrapper.data('last-grid-width',containerWidth);

                if(thumbGridWrapper.data('init') == 0)
                {
                    document.addEventListener('lazyloaded', function(e)
                    {
                        thumbGridWrapper.isotopeIG('layout');
                    });
                }
                thumbGridWrapper.data('init',1);

            }


            if(thumbGridType == 'by_columns')
            {
                masonryThumbsGrid();
                setTimeout(function(){masonryThumbsGrid();}, 250);
                setTimeout(function(){masonryThumbsGrid();}, 500);
                setTimeout(function(){masonryThumbsGrid();}, 700);
                setTimeout(function(){masonryThumbsGrid();}, 1000);
                setTimeout(function(){masonryThumbsGrid();}, 1600);

                $(window).resize(function()
                {
                    if(thumbGridWrapper.data('resizing') == 0)
                    {
                        masonryThumbsGrid();
                        thumbGridWrapper.data('resizing',1);
                        setTimeout(function(){masonryThumbsGrid();}, 100);
                        setTimeout(function(){masonryThumbsGrid();}, 250);
                        setTimeout(function(){masonryThumbsGrid();}, 500);
                    }

                    setTimeout(function(){thumbGridWrapper.data('resizing',0);}, 50);

                });
            }

            function metroThumbsGrid()
            {
                var maxColumnWidth = parseInt(thumbGridWrapper.attr('data-ig-max-width'));
                var gridPadding = parseInt(thumbGridWrapper.attr('data-ig-thumb-spacing'));
                var containerWidth = parseInt(galleryWrapper.width());

                var columns = Math.ceil(containerWidth/(maxColumnWidth + (gridPadding * 1.5)));
                var gutterTotalSpace = gridPadding * (columns -1);
                var columnsTotalSpace = containerWidth - (gutterTotalSpace);
                var oneColumnSpace = columnsTotalSpace/columns;
                var twoColumnSpace = (oneColumnSpace*2) + gridPadding;

                if(columns == 1)
                {
                    thumbRowsGrid();
                    return;
                }

                var lastContainerWidth = thumbGridWrapper.data('last-grid-width');
                if(typeof lastContainerWidth === 'undefined'){lastContainerWidth = 0}

                if(containerWidth != lastContainerWidth)
                {
                    thumbGridWrapper.find('.ig-thumbs-grid-block').each(function(index,el)
                    {
                        if( $(el).attr('data-widthdouble') == 1 )
                        {
                            $(el).css('width',twoColumnSpace+'px');
                        }
                        else
                        {
                            $(el).css('width',oneColumnSpace+'px');
                        }

                        if( $(el).attr('data-heightdouble') == 1 )
                        {
                            $(el).css('height',twoColumnSpace+'px');
                        }
                        else
                        {
                            $(el).css('height',oneColumnSpace+'px');
                        }

                    });

                    thumbGridWrapper.isotopeIG({
                        layoutMode: 'packery',
                        itemSelector: '.ig-thumbs-grid-block',
                        packery: {
                            gutter: gridPadding,
                            resize: false,
                            rowHeight: oneColumnSpace
                        }
                    });
                }

                thumbGridWrapper.data('last-grid-width',containerWidth);

                if(thumbGridWrapper.data('init') == 0)
                {
                    document.addEventListener('lazyloaded', function(e)
                    {
                        thumbGridWrapper.isotopeIG('layout')
                    });
                }
                thumbGridWrapper.data('init',1);
            }

            if(thumbGridType == 'metro')
            {
                metroThumbsGrid();
                setTimeout(function(){metroThumbsGrid();}, 200);
                setTimeout(function(){metroThumbsGrid();}, 500);

                $(window).resize(function()
                {
                    if(thumbGridWrapper.data('resizing') == 0)
                    {
                        metroThumbsGrid();
                        setTimeout(function(){metroThumbsGrid();}, 100);
                        setTimeout(function(){metroThumbsGrid();}, 200);
                        setTimeout(function(){metroThumbsGrid();}, 500);
                        thumbGridWrapper.data('resizing',1);
                    }

                    setTimeout(function(){thumbGridWrapper.data('resizing',0);}, 50);
                });
            }

            function thumbRowsGrid()
            {
                var maxColumnWidth = parseInt(thumbGridWrapper.attr('data-ig-max-width'));
                var gridPadding = parseInt(thumbGridWrapper.attr('data-ig-thumb-spacing'));
                var containerWidth = parseInt(galleryWrapper.width());

                var columns = Math.ceil(containerWidth/(maxColumnWidth + (gridPadding * 1.5)));
                var gutterTotalSpace = gridPadding * (columns -1);
                var columnsTotalSpace = containerWidth - (gutterTotalSpace);
                var oneColumnSpace = columnsTotalSpace/columns;

                var lastContainerWidth = thumbGridWrapper.data('last-grid-width');
                if(typeof lastContainerWidth === 'undefined'){lastContainerWidth = 0}

                if(containerWidth != lastContainerWidth)
                {
                    thumbGridWrapper.find('.ig-thumbs-grid-block').each(function(index,el)
                    {
                        $(el).css('width',oneColumnSpace+'px');
                        $(el).css('margin-bottom',gridPadding+'px');

                        var imgWidth = $(el).find('img').attr('width');
                        var imgHeight = $(el).find('img').attr('height');

                        var newHeight = Math.ceil(((oneColumnSpace/imgWidth) * imgHeight)) + 1;
                        if(newHeight > imgHeight)
                        {
                            newHeight = imgHeight;
                        }

                        if($(el).find('.ig-thumb-text_below').length > 0)
                        {
                            newHeight = parseInt(newHeight) + parseInt($(el).find('.ig-thumb-text_below').outerHeight());
                        }

                        $(el).css('height',newHeight+'px');

                    });

                    thumbGridWrapper.isotopeIG({
                        layoutMode: 'fitRows',
                        itemSelector: '.ig-thumbs-grid-block',
                        fitRows: {
                            gutter: (gridPadding-1),
                        }
                    });
                }

                thumbGridWrapper.data('last-grid-width',containerWidth);

                if(thumbGridWrapper.data('init') == 0)
                {
                    document.addEventListener('lazyloaded', function(e)
                    {
                        thumbGridWrapper.isotopeIG('layout')
                    });
                }
                thumbGridWrapper.data('init',1);

            }

            if(thumbGridType == 'by_rows')
            {
                thumbRowsGrid();
                setTimeout(function(){thumbRowsGrid();}, 200);
                setTimeout(function(){thumbRowsGrid();}, 500);

                $(window).resize(function()
                {
                    if(thumbGridWrapper.data('resizing') == 0)
                    {
                        thumbRowsGrid();
                        setTimeout(function(){thumbRowsGrid();}, 100);
                        setTimeout(function(){thumbRowsGrid();}, 200);
                        setTimeout(function(){thumbRowsGrid();}, 500);
                        thumbGridWrapper.data('resizing',1);
                    }

                    setTimeout(function(){thumbGridWrapper.data('resizing',0);}, 50);

                });
            }

            $('.ig-grid-img-link').each(function(index,el)
            {
                $(el).imagesLoaded( function()
                {
                    $(el).find('.ig-thumb-text').css('display','inline');
                });
            });

            if(galleryWrapper.find('.ig-tags-button-wrapper').length && thumbGridType != 'justified')
            {
                galleryWrapper.find('.ig-tags-button').on('click', function(event)
                {
                    var filterValue = $(this).attr('data-filter');
                    thumbGridWrapper.isotopeIG({ filter: filterValue });

                    galleryWrapper.find('.ig-tags-button').removeClass('ig-tags-button-active');
                    $(this).addClass('ig-tags-button-active');

                    var panelWrapper = $('#ig-lightbox-'+galleryWrapper.attr('data-ig-uniqueid'));
                    $(document).off('show', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                    panelWrapper.remove();
                    galleryWrapper.data('lightboxInit',0);

                    panel = createPanel(filterValue);
                    galleryWrapper.data('tag-filter',filterValue);

                    var panelWrapper = $('#ig-lightbox-'+galleryWrapper.attr('data-ig-uniqueid'));

                });

                if(galleryWrapper.find('.ig-tags-button-wrapper').attr('data-show-all') == 0)
                {
                    setTimeout(function(){galleryWrapper.find('.ig-tags-button').eq(0).click();}, 200);
                }
            }

            setTimeout(function(){thumbGridWrapper.css('visibility','visible');}, 600);
        }

        //lightbox
        if( galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox') == 1 || galleryWrapper.attr('data-ig-lbox-view') == 1)
        {
            galleryWrapper.data('lightboxInit',0);
            var templateHtmlWrapper = galleryWrapper.find('#ig-lightbox-template-' + galleryWrapper.attr('data-ig-uniqueid'));
            var templateHtml = templateHtmlWrapper.html();
            galleryWrapper.data('templateHtml',templateHtml);
            templateHtmlWrapper.empty();

            function createPanel(filterValue)
            {
                if(filterValue == '*')
                {
                    var thumbClassSelector = 'ig-scroller-img-wrapper';
                    var lboxImgClassSelector = 'ig-lightbox-link';
                }
                else
                {
                    var thumbClassSelector = filterValue.substr(1);
                    var lboxImgClassSelector = filterValue.substr(1);
                }

                templateHtml = $(galleryWrapper.data('templateHtml'));


                if( templateHtml.find('.ig-slider-items').length)
                {
                    templateHtml.find('.ig-scroller-img-wrapper').each(function(index,el)
                    {
                        var tagsArray = $(el).attr('class').split(' ');

                        if(tagsArray.indexOf(thumbClassSelector) != -1)
                        {

                        }
                        else
                        {
                            $(el).remove();
                        }
                    });
                }

                templateHtml = templateHtml.prop('outerHTML');

                var items = [];
                panelIds = Array();
                var slideshowElms = Array();
                var slideshowIndxs = Array();
                var panelIndex = 0;
                var gdprIndexes = Array();
                var gdprCount = 0;
                galleryWrapper.find('.ig-lightbox-link').each(function(index,el)
                {
                    if($(el).hasClass(lboxImgClassSelector))
                    {
                        var gdprConsent = parseInt(galleryWrapper.attr('data-ig-gdpr'));
                        var gdprAlready = localStorage.getItem('ig-gdpr') == '1' ? true : false;
                        var gdprImgSrc = $(el).attr('data-gdpr-image');
                        if(gdprConsent == 1 && !gdprAlready && gdprImgSrc.length > 0)
                        {
                            var lboxImgSrc = gdprImgSrc;
                            gdprIndexes.push(gdprCount);
                        }
                        else
                        {
                            var lboxImgSrc = $(el).attr('href');
                        }

                        var item =
                        {
                            source:lboxImgSrc,
                            caption:$(el).parent().find('.ig-lightbox-description-content').html(),
                            alt:$(el).parent().find('.ig-slideshow-image').attr('alt')
                        };

                        items.push(item);
                        panelIds.push($(el).attr('data-ig-imageid'));

                        slideshowElms[panelIndex] = galleryWrapper.find('.ig-slideshow-item').eq(index);
                        slideshowIndxs[panelIndex] = index;
                        panelIndex++;
                        gdprCount++;
                    }

                });

                galleryWrapper.data('gdpr-indexes',gdprIndexes);

                var velocity = parseFloat( galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox-transition-duration') );
                velocity = velocity == 0 ? 200 : velocity;

                var finite = galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox-infinite') == 1 ? false : true;
                var lboxAutoplay = galleryWrapper.attr('data-ig-lbox-autoplay') == 1 ? true : false;

                panel = iguiUIkit.lightboxPanel(
                {
                    items: items,
                    delayControls: 6000,
                    template:templateHtml,
                    videoAutoplay: lboxAutoplay,
                    velocity: (800/velocity),
                    autoplayInterval: galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox-interval'),
                    autoplay: false,
                    preload: 2,
                    finite:finite,
                    animation: galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox-fade')
                });

                var lboxWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid') );


                $(document).off('shown', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('shown', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    $('.igui-lightbox li').on('click', function(event)
                    {
                        event.stopPropagation();
                    });

                    var reCaptchaId = lboxWrapper.find('.ig-recaptcha').attr('id');
                    var reCaptchaSiteKey = lboxWrapper.find('.ig-recaptcha').attr('data-sitekey');
                    if(typeof reCaptchaSiteKey !== 'undefined' && galleryWrapper.data('lboxRecaptchaInit') == 0)
                    {
                        grecaptcha.render(reCaptchaId, {'sitekey' : reCaptchaSiteKey});
                        galleryWrapper.data('lboxRecaptchaInit',1);
                    }
                });

                $(document).off('show', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('show', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    var openLboxFullscreen = galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox-fullscreen') == 'open-fullscreen' ? 1 : 0;

                    if(openLboxFullscreen)
                    {
                        lboxWrapper.fullScreen(true);
                    }

                    var thumbGridWrapper = galleryWrapper.find('.ig-thumbs-grid');
                    if(thumbGridWrapper.length)
                    {
                        thumbGridWrapper.css('width', thumbGridWrapper.width() + 'px');
                    }

                    if(galleryWrapper.data('lightboxInit') == 0)
                    {

                        lboxWrapper.find('.ig-close-modal').on('click', function(event)
                        {
                            window.parent.igCloseModal();
                        });

                        lboxWrapper.find('.ig-fullscreen-on').on('click', function(event)
                        {
                            event.preventDefault();
                            event.stopPropagation();
                            lboxWrapper.fullScreen(true);
                            lboxWrapper.find('.ig-fullscreen-on').css('display','none');
                            lboxWrapper.find('.ig-fullscreen-off').css('display','inline-block');
                        });

                        lboxWrapper.find('.ig-fullscreen-off').on('click', function(event)
                        {
                            event.preventDefault();
                            event.stopPropagation();
                            lboxWrapper.fullScreen(false);
                            lboxWrapper.find('.ig-fullscreen-off').css('display','none');
                            lboxWrapper.find('.ig-fullscreen-on').css('display','inline-block');
                        });

                        $(document).bind('fullscreenchange', function()
                        {
                            if(!$(document).fullScreen())
                            {
                                lboxWrapper.find('.ig-fullscreen-off').css('display','none');
                                lboxWrapper.find('.ig-fullscreen-on').css('display','inline-block');
                            }

                            if(openLboxFullscreen && !$(document).fullScreen() && lboxWrapper.data('add-lbox-comment') !== 1)
                            {
                                panel.hide();
                            }

                            if(galleryWrapper.data('lboxPlaying') == true)
                            {
                                panel.stopAutoplay();
                                panel.startAutoplay();
                            }
                        });

                        //init rating
                        lboxWrapper.find('.ig-rating').on('click', function(event)
                        {
                            event.stopPropagation();
                            var imageid = panelIds[panel.index];
                            var ratingUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addRating&format=raw&rating=5&imageid=' + imageid;

                            $.ajax
                            ({
                                url: ratingUrl,
                                error: function(response){console.log(response);},
                                success: function(response)
                                {
                                    console.log(response);
                                    responseObj = $.parseJSON(response);

                                    if(responseObj.success == 1)
                                    {
                                        var currentRating = galleryWrapper.find('.ig-slideshow-item').eq(panel.index).attr('data-ig-rating');
                                        lboxWrapper.find('.ig-rating-number').html(parseInt(currentRating) + 1);
                                        galleryWrapper.find('.ig-slideshow-item').eq(panel.index).attr('data-ig-rating',(parseInt(currentRating) + 1));

                                    }

                                }
                            });
                        });

                        lboxWrapper.find('.ig-add-comment-text').click(function(event)
                        {
                            lboxWrapper.find('.ig-comments-textarea-wrapper').css('display','block');
                            if($(document).fullScreen() && lboxWrapper.find('.ig-comments-form').find('.ig-recaptcha').length)
                            {
                                lboxWrapper.data('add-lbox-comment',1);
                                $(document).fullScreen(false);
                                setTimeout(function(){lboxWrapper.data('add-lbox-comment',0);}, 1000);
                            }
                        });

                        lboxWrapper.find('.ig-comments-form').submit(function(event)
                        {
                            event.preventDefault();

                            var imageid = panelIds[panel.index]
                            var commentUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addComment&format=raw&imageid=' + imageid;
                            var postData = lboxWrapper.find('.ig-comments-form').serialize();
                            var commentText = lboxWrapper.find('.igui-textarea').val();

                            if(lboxWrapper.find('.ig-comments-form').find('#dynamic_recaptcha_1').length)
                            {
                                //postData = postData +'&g-recaptcha-response='+grecaptcha.getResponse();
                            }

                            $.ajax
                            ({
                                type: "POST",
                                url: commentUrl,
                                data: postData,
                                error: function(response){console.log(response);},
                                success: function(response)
                                {
                                    console.log(response);
                                    responseObj = $.parseJSON(response);

                                    if(responseObj.success == 1)
                                    {
                                        galleryWrapper.find('.ig-comments-content').each(function(index,el)
                                        {
                                            if( $(this).attr('data-img-id') == panelIds[panel.index])
                                            {
                                                var commentsContentWrapper = $(this);
                                                var usersName = lboxWrapper.find('.ig-comments-text-summary').attr('data-ig-current-user-name');
                                                commentsContentWrapper.append('<div class="ig-comment-data">'+usersName+'</div><div>'+commentText+'</div>');
                                                lboxWrapper.find('.ig-comments-list').html(commentsContentWrapper.html());
                                                lboxWrapper.find('.igui-textarea').val('');
                                            }
                                        });

                                    }

                                }
                            });

                            grecaptcha.reset();
                        });

                        //init thumbnail scroller
                        var thumbScrollerWrapper = lboxWrapper.find('.ig-thumb-scroller-lbox');
                        var vertical = thumbScrollerWrapper.hasClass('ig-thumb-scroller-vertical');

                        thumbScrollerWrapper.find('.ig-scroller-img-wrapper').each(function(index,el)
                        {
                            $(el).off('click');
                            $(el).on('click', function(e)
                            {
                                e.stopPropagation();
                                e.preventDefault();
                                panel.show(index);
                            });
                        });

                        var hoverRightThumbArrow = false;
                        var hoverLeftThumbArrow = false;
                        var hoverDownThumbArrow = false;
                        var hoverUpThumbArrow = false;

                        thumbScrollerWrapper.find('.ig-thumb-scroller-down').on('click', function(e)
                        {
                            e.preventDefault();
                            e.stopPropagation();
                            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() + 350;
                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();

                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 500,{easing:'linear',onAfter: function()
                                {
                                    if(hoverDownThumbArrow)
                                    {
                                        thumbScrollerWrapper.find('.ig-thumb-scroller-down').trigger('mouseenter');
                                    }
                                }});
                        });

                        thumbScrollerWrapper.find('.ig-thumb-scroller-up').on('click', function(e)
                        {
                            e.preventDefault();
                            e.stopPropagation();
                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() - 350;

                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 500,{easing:'linear',onAfter: function()
                                {
                                    if(hoverUpThumbArrow)
                                    {
                                        thumbScrollerWrapper.find('.ig-thumb-scroller-up').trigger('mouseenter');
                                    }
                                }});
                        });

                        thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('click', function(e)
                        {
                            e.preventDefault();
                            e.stopPropagation();
                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() - 700;

                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 700,{easing:'linear',onAfter: function()
                                {
                                    if(hoverLeftThumbArrow)
                                    {
                                        thumbScrollerWrapper.find('.ig-thumb-scroller-left').trigger('mouseenter');
                                    }
                                }});
                        });

                        thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('click', function(e)
                        {
                            e.preventDefault();
                            e.stopPropagation();
                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                            var pixels = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() + 700;

                            thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(pixels, 700,{easing:'linear',onAfter: function()
                                {
                                    if(hoverRightThumbArrow)
                                    {
                                        thumbScrollerWrapper.find('.ig-thumb-scroller-right').trigger('mouseenter');
                                    }
                                }});
                        });

                        if( getComputedStyle(document.documentElement).direction != 'rtl' && !isIOS && !isAndroid)
                        {

                            //right arrow hover
                            thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('mouseenter', function()
                            {
                                hoverRightThumbArrow = true;
                                var duration = (thumbScrollerWrapper.find('.ig-slider-items')[0].scrollWidth  - (thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() + thumbScrollerWrapper.width())) * 3;
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo('max', duration, {easing: 'linear'});
                            });

                            thumbScrollerWrapper.find('.ig-thumb-scroller-right').on('mouseleave', function()
                            {
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                                hoverRightThumbArrow = false;
                            });

                            //left arrow hover
                            thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('mouseenter', function()
                            {
                                hoverLeftThumbArrow = true;
                                var duration = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollLeft() * 3;
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(0, duration,{easing:'linear'});
                            });

                            thumbScrollerWrapper.find('.ig-thumb-scroller-left').on('mouseleave', function()
                            {
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                                hoverLeftThumbArrow = false;
                            });

                            //down arrow hover
                            thumbScrollerWrapper.find('.ig-thumb-scroller-down').on('mouseenter', function()
                            {
                                hoverDownThumbArrow = true;
                                var duration = (thumbScrollerWrapper.find('.ig-slider-items')[0].scrollHeight  - (thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() + thumbScrollerWrapper.height())) * 3;
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo('max', duration, {easing: 'linear'});
                            });

                            thumbScrollerWrapper.find('.ig-thumb-scroller-down').on('mouseleave', function()
                            {
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                                hoverDownThumbArrow = false;
                            });

                            //up arrow hover
                            thumbScrollerWrapper.find('.ig-thumb-scroller-up').on('mouseenter', function()
                            {
                                hoverUpThumbArrow = true;
                                var duration = thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTop() * 3;
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').scrollTo(0, duration,{easing:'linear'});
                            });

                            thumbScrollerWrapper.find('.ig-thumb-scroller-up').on('mouseleave', function()
                            {
                                thumbScrollerWrapper.find('.ig-thumb-scroller-inner').stop();
                                hoverUpThumbArrow = false;
                            });
                        }

                        setTimeout(function()
                        {
                            var innerWrapper = thumbScrollerWrapper.find('.ig-thumb-scroller-inner');

                            if(thumbScrollerWrapper.find('.ig-slider-items').height() < $(window).height() && vertical)
                            {
                                thumbScrollerWrapper.find('.ig-thumb-scroller-down').css('visibility','hidden');
                                thumbScrollerWrapper.find('.ig-thumb-scroller-up').css('visibility','hidden');
                            }


                            if(innerWrapper.prop('scrollWidth') <= innerWrapper.width() && !vertical)
                            {
                                thumbScrollerWrapper.find('.igui-slidenav-previous').css('visibility','hidden');
                                thumbScrollerWrapper.find('.igui-slidenav-next').css('visibility','hidden');
                            }

                        }, 200);

                        //lightbox zoom
                        lboxWrapper.find('.ig-zoomin-button').on('click', function(event)
                        {
                            alignZoomWrapper(lboxWrapper);
                            lboxWrapper.find('.ig-zoomout-button').css('display','inline-block');
                        });

                        lboxWrapper.find('.ig-zoomout-button').on('click', function(event)
                        {
                            removeZoom(lboxWrapper);
                        });

                        $(window).resize(function()
                        {
                            removeZoom(lboxWrapper);
                        });

                        galleryWrapper.data('lightboxInit',1);
                    }

                    lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(lboxWrapper.find('.ig-scroller-img-wrapper').eq(panel.index));


                    if(lboxWrapper.find('.ig-lbox-play-icon').length)
                    {
                        lboxWrapper.find('.ig-lbox-play-icon').css('display','inline-block');
                        lboxWrapper.find('.ig-lbox-pause-icon').css('display','none');

                        lboxWrapper.find('.ig-lbox-play-icon').on('click', function(event)
                        {
                            panel.autoplay = true;
                            panel.startAutoplay();
                            lboxWrapper.find('.ig-lbox-play-icon').css('display','none');
                            lboxWrapper.find('.ig-lbox-pause-icon').css('display','inline-block');
                            galleryWrapper.data('lboxPlaying', true);
                        });

                        lboxWrapper.find('.ig-lbox-pause-icon').on('click', function(event)
                        {
                            panel.stopAutoplay();
                            panel.autoplay = false;
                            lboxWrapper.find('.ig-lbox-pause-icon').css('display','none');
                            lboxWrapper.find('.ig-lbox-play-icon').css('display','inline-block');
                            galleryWrapper.data('lboxPlaying', false);
                        });

                        lboxWrapper.find('.ig-lightbox-button, .igui-lightbox-items li').on('click', function(event)
                        {
                            lboxWrapper.find('.ig-lbox-pause-icon').css('display','none');
                            lboxWrapper.find('.ig-lbox-play-icon').css('display','inline-block');
                        });
                    }

                    if(lboxWrapper.find('.ig-image-total').length)
                    {
                        lboxWrapper.find('.ig-image-total').html(items.length);
                    }

                    //add lbox mousewheel
                    var thumbVertical = lboxWrapper.find('.ig-thumb-scroller-lbox').hasClass('ig-thumb-scroller-vertical');
                    if(galleryWrapper.attr('data-ig-ismac')==0 && thumbVertical==false)
                    {
                        lboxWrapper.data('mousewheel',0);
                        lboxWrapper.on('wheel', function(event)
                        {
                            if(event.originalEvent.deltaY !== 0 && lboxWrapper.data('mousewheel') == 0)
                            {
                                if(event.originalEvent.deltaY < 0)
                                {
                                    panel.show(panel.index+1);
                                }
                                else
                                {
                                    panel.show(panel.index-1);
                                }
                                lboxWrapper.data('mousewheel',1);
                                setTimeout(function(){lboxWrapper.data('mousewheel',0);}, 800);
                            }
                        });
                    }

                });

                $(document).off('beforeitemshow', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('beforeitemshow', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    var lboxWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid') );

                    //swap rating
                    if(lboxWrapper.find('.ig-rating').length)
                    {
                        var rating = slideshowElms[panel.index].attr('data-ig-rating').toString();
                        var ratingWidth = rating.length < 2 ? 24 : 29;
                        var ratingWidth = rating.length > 2 ? 34 : ratingWidth;
                        lboxWrapper.find('.ig-rating').css('width',ratingWidth+'px');
                        lboxWrapper.find('.ig-rating-number').html(rating);
                    }

                    if(lboxWrapper.find('.ig-zoomin-button').length)
                    {
                        removeZoom(lboxWrapper);
                    }

                    //swap hit
                    var hitCount = slideshowElms[panel.index].attr('data-ig-hits');
                    lboxWrapper.find('.ig-hits-number').html(hitCount);

                    //swap image number
                    lboxWrapper.find('.ig-image-number').html(panel.index + 1);

                    //swap hash
                    if(galleryWrapper.attr('data-ig-showhash') == 'hash')
                    {
                        imageUrl(slideshowIndxs[panel.index],true);
                    }

                    //position bottom wrapper
                    var bottomWrapper = lboxWrapper.find('.ig-lightbox-bottom-wrapper');
                    var leftWrapper = lboxWrapper.find('.ig-lightbox-left-wrapper');
                    var rightWrapper = lboxWrapper.find('.ig-lightbox-right-wrapper');
                    var desOverlayWrapper = lboxWrapper.find('.ig-lightbox-descriptions-overlay');

                    if(bottomWrapper.length)
                    {
                        var bottomHeight = bottomWrapper.height() + 10;

                        if(leftWrapper.length)
                        {
                            if(leftWrapper.find('.ig-thumb-scroller').length > 0)
                            {
                                bottomWrapper.css('margin-left',leftWrapper.width()+'px');
                            }
                        }

                        if(desOverlayWrapper.length > 0)
                        {
                            desOverlayWrapper.css('margin-bottom',bottomHeight+'px');
                        }

                        if(rightWrapper.length)
                        {
                            if(rightWrapper.find('.ig-thumb-scroller').length > 0)
                            {
                                bottomWrapper.css('margin-right',rightWrapper.width()+'px');
                            }
                        }

                        lboxWrapper.find('.igui-lightbox-items').find('li').css('bottom',bottomHeight+'px');

                        var imageHeight = ( ( $(window).height() - bottomHeight ) / $(window).height() ) * 100;
                        lboxWrapper.find('.igui-lightbox-items').find('li').css('max-height',imageHeight+'vh');
                    }

                    //position left wrapper
                    if(leftWrapper.length)
                    {
                        if(bottomWrapper.find('.ig-thumb-scroller').length)
                        {
                            var wrapperHeight = (typeof bottomHeight) !== 'undefined' ? $(window).height() - (bottomHeight + 10) : $(window).height();
                            leftWrapper.css('height',wrapperHeight+'px');
                        }
                        else
                        {
                            var wrapperHeight = $(window).height();
                            leftWrapper.css('height',wrapperHeight+'px');
                        }

                        var leftWidth = leftWrapper.width();

                        if(desOverlayWrapper.length > 0)
                        {
                            desOverlayWrapper.css('margin-left',leftWidth+'px');
                        }

                        lboxWrapper.find('.igui-lightbox-items').find('li').css('left',leftWidth+'px');

                        var imageWidth = ( ( $(window).width() - leftWidth ) / $(window).width() ) * 100;
                        lboxWrapper.find('.igui-lightbox-items').find('li').css('max-width',imageWidth+'vw');

                        lboxWrapper.children('.ig-lightbox-button-left').css('left',leftWidth+'px');

                    }

                    //position right wrapper
                    if(rightWrapper.length)
                    {
                        if(bottomWrapper.find('.ig-thumb-scroller').length)
                        {
                            var wrapperHeight = typeof bottomHeight !== 'undefined' ? $(window).height() - (bottomHeight + 10) - 48 : ($(window).height() - 48);
                            rightWrapper.css('height',wrapperHeight+'px');
                        }
                        else
                        {
                            var wrapperHeight = ($(window).height() - 48);
                            rightWrapper.css('height',wrapperHeight+'px');
                        }


                        if(rightWrapper.find('.ig-thumb-scroller').length)
                        {
                            lboxWrapper.find('.ig-thumb-scroller, .ig-thumb-scroller-vert-inner, .ig-thumb-scroller-inner').css('height',wrapperHeight+'px');
                        }

                        var rightWidth = rightWrapper.width();

                        if(desOverlayWrapper.length > 0)
                        {
                            desOverlayWrapper.css('margin-right',rightWidth+'px');
                        }

                        lboxWrapper.find('.igui-lightbox-items').find('li').css('right',rightWidth+'px');

                        var imageWidth = ( ( $(window).width() - rightWidth ) / $(window).width() ) * 100;
                        lboxWrapper.find('.igui-lightbox-items').find('li').css('max-width',rightWidth+'vw');

                        lboxWrapper.find('.ig-lightbox-button-right').css('right',rightWidth+'px');
                    }

                    //swap comments
                    if(lboxWrapper.find('.ig-comments').length)
                    {
                        galleryWrapper.find('.ig-comments-content').each(function(index,el)
                        {
                            if( $(this).attr('data-img-id') == panelIds[panel.index])
                            {
                                var commentContent = $(this).html();
                                lboxWrapper.find('.ig-comments-list').html(commentContent);

                                var commentCount = $(this).find('.ig-comment').length;
                                lboxWrapper.find('.ig-comment-count').html(commentCount);

                                lboxWrapper.find('.ig-comments-textarea-wrapper').css('display','none');
                            }
                        });
                    }

                    //check thumb position
                    var currentThumb = lboxWrapper.find('.ig-scroller-img-wrapper').eq(panel.index);

                    if(lboxWrapper.find('.ig-thumb-scroller-horizontal').length)
                    {
                        var thumbPosition = currentThumb.position().left;
                        var containerWidth = lboxWrapper.find('.ig-thumb-scroller').width();

                        if(panel.index == 0)
                        {
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(0,400);
                        }
                        else if(thumbPosition > (containerWidth + lboxWrapper.find('.ig-thumb-scroller-inner').scrollLeft()))
                        {
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(currentThumb,400);
                        }
                        else if(thumbPosition < lboxWrapper.find('.ig-thumb-scroller-inner').scrollLeft() )
                        {
                            var position = thumbPosition - (containerWidth - currentThumb.width());
                            var position = position < 0 ? 0 : position;
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(position,400);
                        }

                    }
                    else if(lboxWrapper.find('.ig-thumb-scroller-vertical').length)
                    {
                        var thumbPosition = currentThumb.position().top;
                        var containerHeight = lboxWrapper.find('.ig-thumb-scroller').height();

                        if(panel.index == 0)
                        {
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(0,400);
                        }
                        else if(thumbPosition > (containerHeight + lboxWrapper.find('.ig-thumb-scroller-inner').scrollTop()))
                        {
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(currentThumb,400);
                        }
                        else if(thumbPosition < lboxWrapper.find('.ig-thumb-scroller-inner').scrollTop() )
                        {
                            var position = thumbPosition - (containerHeight - currentThumb.height());
                            var position = position < 0 ? 0 : position;
                            lboxWrapper.find('.ig-thumb-scroller-inner').scrollTo(position,400);
                        }
                    }

                    lboxWrapper.find('.igui-lightbox-items').find('li').css('visibility','visible');
                });


                $(document).off('itemshown', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('itemshown', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    var lboxWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid') );
                    lboxWrapper.off('click');

                    //gdpr
                    var gdprConsent = parseInt(galleryWrapper.attr('data-ig-gdpr'));
                    var gdprAlready = localStorage.getItem('ig-gdpr') == '1' ? true : false;

                    if(gdprConsent == 1 && !gdprAlready)
                    {
                        insertGDPRLbox();
                        setTimeout(function(){insertGDPRLbox();}, 500);
                        setTimeout(function(){insertGDPRLbox();}, 1000);
                        setTimeout(function(){insertGDPRLbox();}, 1500);
                        setTimeout(function(){insertGDPRLbox();}, 2000);
                    }

                    function insertGDPRLbox()
                    {
                        var currentLI = lboxWrapper.find('.igui-lightbox-items').find('li').eq(panel.index);
                        if(currentLI.find('.ig-gdpr-lbox').length == 0 && currentLI.find('img').length > 0)
                        {
                            if($.inArray(panel.index, galleryWrapper.data('gdpr-indexes')) !== -1)
                            {
                                currentLI.append(
                                    '<div class="ig-gdpr-lbox">'
                                    + '<div class="ig-gdpr-lbox-inner igui-position-center"><div class="ig-gdpr-lbox-message">' + galleryWrapper.find('#ig-gdpr-message').html() + '</div>'
                                    + '<button type="submit" class="ig-gdpr-lbox-submit">'+galleryWrapper.find('#ig-gdpr-button-text').html()+'</button><br />'
                                    + '<div class="ig-preview-play-icon-gdpr" data-igui-icon="icon:play; ratio:2"></div>'
                                    + '</div></div>');
                            }

                            currentLI.find('.ig-gdpr-lbox-submit').off('click');
                            currentLI.find('.ig-gdpr-lbox-submit').on('click', function (e)
                            {
                                localStorage.setItem('ig-gdpr', '1');
                                galleryWrapper.data('ig-keep-fullscreen',1);
                                var lastPanelIndex = panel.index;
                                panel.hide();

                                var panelWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                                $(document).off('show', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                                panelWrapper.remove();
                                galleryWrapper.data('lightboxInit', 0);

                                var panelFilter = typeof galleryWrapper.data('tag-filter') !== 'undefined' ? galleryWrapper.data('tag-filter') : '*';
                                panel = createPanel(panelFilter);
                                setTimeout(function(){panel.show(lastPanelIndex);}, 100);
                                setTimeout(function(){galleryWrapper.data('ig-keep-fullscreen',0);},1500);

                            });
                        }
                    }

                    lboxWrapper.find('.ig-download-button').off('click');
                    lboxWrapper.find('.ig-download-button').on('click', function(event)
                    {
                        event.stopPropagation();
                        var imageid = panelIds[panel.index];
                        window.location.href = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.download&format=raw&type=lbox&id=' + imageid;
                    });

                    lboxWrapper.find('.ig-facebook-share').off('click');
                    lboxWrapper.find('.ig-facebook-share').on('click', function(event)
                    {
                        event.stopPropagation();
                        var urlToShare = 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(  imageUrl(slideshowIndxs[panel.index],false) );
                        window.open(urlToShare, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();
                    });

                    lboxWrapper.find('.ig-twitter-share').off('click');
                    lboxWrapper.find('.ig-twitter-share').on('click', function(event)
                    {
                        event.stopPropagation();
                        var urlToShare = 'http://twitter.com/share?url=' + encodeURIComponent( imageUrl(slideshowIndxs[panel.index],false) );
                        window.open(urlToShare, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();

                    });

                    lboxWrapper.find('.ig-pinterest-share').off('click');
                    lboxWrapper.find('.ig-pinterest-share').on('click', function(event)
                    {
                        event.stopPropagation();

                        var imagePathLong = lboxWrapper.find('.igui-lightbox-items li').eq(panel.index).find('img').attr('src');
                        var imgPathShort = imagePathLong.slice(imagePathLong.indexOf('images/igallery'));
                        var imgUrl = galleryWrapper.attr('data-ig-basehref-long') + imgPathShort;
                        var description  = galleryWrapper.find('.ig-image-description').eq(slideshowIndxs[panel.index]).text();
                        description = description.length > 0 ? description : galleryWrapper.find('.ig-slideshow-image').eq(slideshowIndxs[panel.index]).attr('alt');

                        var href = 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent( imageUrl(slideshowIndxs[panel.index],false) ) + '&media=' + encodeURIComponent(imgUrl) + '&description=' + description;
                        window.open(href, '_blank', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0').focus();
                    });

                    //swap active thumb
                    lboxWrapper.find('.ig-scroller-img-wrapper').removeClass('ig-active-thumb');
                    lboxWrapper.find('.ig-scroller-img-wrapper').eq(panel.index).addClass('ig-active-thumb');


                    //add hit
                    if(galleryWrapper.attr('data-ig-collecthits') == 1)
                    {
                        var imageid = panelIds[panel.index];
                        var hitUrl = galleryWrapper.attr('data-ig-basehref') + '/index.php?option=com_igallery&task=imagefront.addHit&format=raw&id=' + imageid;
                        $.ajax({url: hitUrl, success: function(result){}});
                    }

                    //disable right click
                    if(galleryWrapper.attr('data-ig-disable-rightclick') == 1)
                    {
                        lboxWrapper.find('.igui-lightbox-items').find('li').eq(panel.index).off('contextmenu');
                        lboxWrapper.find('.igui-lightbox-items').find('li').eq(panel.index).on('contextmenu',function(){
                            alert(galleryWrapper.attr('data-ig-rightclick-msg'));
                            return false;
                        });
                    }

                    if(lboxWrapper.find('.igui-lightbox-items').find('iframe').length)
                    {
                        lboxWrapper.find('.igui-lightbox-button').removeClass('igui-transition-fade');
                    }
                });

                $(document).off('beforehide', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('beforehide', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    if(galleryWrapper.attr('data-ig-show-main-image') == 1)
                    {
                        slideshow.show(slideshowIndxs[panel.index]);
                    }

                    if($(document).fullScreen() && galleryWrapper.data('ig-keep-fullscreen') !== 1)
                    {
                        $(document).fullScreen(false);
                    }

                    var lboxWrapper = $('#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid') );
                    var thumbPosition = lboxWrapper.find('.ig-thumb-scroller').attr('data-ig-lbox-thumbs-position');
                    if(thumbPosition == 'below')
                    {
                        //galleryWrapper.data('lboxThumbScroller', lboxWrapper.find('.ig-thumb-scroller').detach() );
                    }

                });

                $(document).off('hidden', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'));
                $(document).on('hidden', '#ig-lightbox-' + galleryWrapper.attr('data-ig-uniqueid'), function()
                {
                    var thumbGridWrapper = galleryWrapper.find('.ig-thumbs-grid');
                    if(thumbGridWrapper.length)
                    {
                        thumbGridWrapper.css('width', '100%');
                    }

                    panel.stopAutoplay();
                    panel.autoplay = false;

                    if(galleryWrapper.attr('data-ig-show-main-image') == 0)
                    {
                        var currentUrlParam = getUrlParamater('i');
                        if(currentUrlParam != 'unset')
                        {
                            var url = window.location.href;
                            if(url.indexOf('?i='+currentUrlParam) !== -1)
                            {
                                newUrl = url.replace('?i='+currentUrlParam,'');
                            }
                            else if(url.indexOf('&i='+currentUrlParam) !== -1)
                            {
                                newUrl = url.replace('&i='+currentUrlParam,'');
                            }

                            history.replaceState({imgId:0}, document.title, newUrl);
                        }
                    }

                    if( typeof(window.parent.igCloseModal) == 'function')
                    {
                        window.parent.igCloseModal();
                    }

                    lboxWrapper.off('wheel');
                });

                galleryWrapper.find('.ig-grid-img-link').each(function(index,el)
                {

                    var linkEl = galleryWrapper.find('.ig-slideshow-item').eq($(this).parent().index());
                    var link = linkEl.attr('data-ig-image-link');

                    if( link.length < 2 && galleryWrapper.attr('data-ig-show-main-image') == 0)
                    {

                        $(this).off('click');
                        var gridImgId = $(this).attr('data-img-id');

                        var gridIndex = 0;
                        $.each(panelIds, function(index,value)
                        {
                            if(gridImgId == value)
                            {
                                gridIndex = index;
                            }
                        });

                        $(this).on('click', function(e)
                        {
                            panel.show(gridIndex);
                        });

                        $(this).find('a').on('click', function(e)
                        {
                            e.stopPropagation();
                        });
                    }

                });

                return panel;
            }

            panel = createPanel('*');

            if(galleryWrapper.attr('data-ig-lbox-view') == 1)
            {
                panel.show(0);
            }

            function alignZoomWrapper(lboxWrapperEl)
            {
                var zoomWrapper = lboxWrapperEl.find('.zoom-image-holder');
                var imgElement = lboxWrapperEl.find('.igui-lightbox-items li').eq(panel.index).find('img');
                var currentImgPosition = imgElement.position();
                var imgParentLeft = parseInt( lboxWrapperEl.find('.igui-lightbox-items li').eq(panel.index).css('left') );

                var isEmpty = zoomWrapper.find('img').length == 1 ? false : true;

                if(isEmpty)
                {
                    zoomWrapper.css('visibility','hidden');
                    var imgClone = imgElement.clone();
                    zoomWrapper.empty();
                    zoomWrapper.append(imgClone);
                    zoomWrapper.find('img').css({height:'auto',position:'relative','max-width':'100%'});
                }

                zoomWrapper.css(
                {
                    'top':currentImgPosition.top,
                    left:(currentImgPosition.left + imgParentLeft),
                    display:'block',
                    padding:'0px',
                    width:imgElement.width(),
                    height:imgElement.height(),
                    overflow:'hidden',
                    cursor: 'grab'
                });

                setTimeout(alignZoom, 80,true,lboxWrapperEl);
            }

            function alignZoom(doZoom,lboxWrapperEl)
            {
                var zoomWrapper = lboxWrapperEl.find('.zoom-image-holder');
                var zoomContainment = lboxWrapperEl.find('.zoom-image-containment');

                if(doZoom)
                {
                    var newWidth = zoomWrapper.find('img').width() * 1.3;
                    var newHeight = zoomWrapper.find('img').height() * 1.3;
                    var newLeft = (newWidth - zoomWrapper.width())/2;
                    var newTop = (newHeight - zoomWrapper.height())/2;

                    zoomWrapper.find('img').css(
                    {
                        width: newWidth+'px',
                        height: newHeight+'px',
                        left: -newLeft+'px',
                        top: -newTop+'px',
                        'max-width': 'none'
                    });
                }

                var horzExtra = zoomWrapper.find('img').width() - zoomWrapper.width();
                var vertExtra = zoomWrapper.find('img').height() - zoomWrapper.height();

                var newWidth = (horzExtra * 2) + zoomWrapper.width();
                var newHeight = (vertExtra * 2) + zoomWrapper.height();

                var xPos = zoomWrapper.offset().left - horzExtra;
                var yPos = zoomWrapper.position().top - vertExtra;

                zoomContainment.css(
                {
                    display:'block',
                    width:newWidth+'px',
                    height:newHeight+'px',
                    top: yPos+'px',
                    left: xPos+'px'
                });

                zoomWrapper.css('visibility','visible');

                if(draggable !== undefined)
                {
                    draggable.draggabilly('destroy');
                }

                var draggable = zoomWrapper.find('img').draggabilly(
                {
                    containment: '#zoom-image-containment-' + galleryWrapper.attr('data-ig-uniqueid')
                });
            }

            function removeZoom(lboxWrapperEl)
            {
                var zoomWrapper = lboxWrapperEl.find('.zoom-image-holder');
                var isEmpty = zoomWrapper.find('img').length == 1 ? false : true;

                if(!isEmpty)
                {
                    var zoomContainment = lboxWrapperEl.find('.zoom-image-containment');
                    zoomWrapper.empty();
                    zoomWrapper.css('display','none');
                    zoomContainment.css('display','none');
                    lboxWrapperEl.find('.ig-zoomout-button').css('display','none');
                }
            }



            //allow creation of custom links to open the lightbox
            $('.ig-lightbox-custom-link').on('click', function(e)
            {
                e.preventDefault();
                var galleryId = $(this).attr('data-gallery-id');
                var imageIndex = $(this).attr('data-image-index') > 0 ? $(this).attr('data-image-index') -1 : 0;
                if(galleryId == galleryWrapper.attr('data-ig-uniqueid'))
                {
                    panel.show(imageIndex);
                }
            });

            //if grid and hash then show lbox on page load
            var imgHash = getUrlParamater('i');
            imgHash = imgHash.replace(/_/g,'-');
            if(imgHash != 'unset' && galleryWrapper.attr('data-ig-show-main-image') == 0)
            {
                var elementToFind = galleryWrapper.find(".ig-slideshow-item[data-ig-imagehash='" + imgHash + "']");
                if(elementToFind.length)
                {
                    panel.show(elementToFind.index());
                }
            }

        }

        galleryWrapper.find('.ig-slideshow-item-inner').each(function(index,el)
        {
            if($(this).parent().attr('data-ig-image-link').length > 0)
            {
                $(this).css('cursor','pointer');
            }
        });

        galleryWrapper.find('.ig-slideshow-item-inner-lboxon, .ig-slideshow-item-inner').on('click', function(e)
        {
            e.preventDefault();

            var link = $(this).parent().attr('data-ig-image-link');
            if( link.length > 2)
            {
                if($(this).parent().attr('data-ig-link-new') == 1)
                {
                    window.open(link);
                }
                else
                {
                    window.location = link;
                }
            }
            else if( galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox') == 1 )
            {
                panel.show(slideshow.index);
            }
        });


        galleryWrapper.find('.ig-grid-img-link').off('click');
        galleryWrapper.find('.ig-grid-img-link').on('click', function(e)
        {
            e.preventDefault();
            var linkEl = galleryWrapper.find('.ig-slideshow-item').eq($(this).parent().index());
            var link = linkEl.attr('data-ig-image-link');

            if( link.length > 2)
            {
                if(linkEl.attr('data-ig-link-new') == 1)
                {
                    window.open(link);
                }
                else
                {
                    window.location = link;
                }
            }
            else
            {
                if(galleryWrapper.attr('data-ig-show-main-image') == 1)
                {
                    e.preventDefault();
                    slideshow.show($(this).parent().index());
                }
                else if( galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox') == 1 )
                {
                    panel.show($(this).parent().index());
                }

            }

        });

        thumbScrollerWrapper.find('.ig-img-link').each(function(index,el)
        {
            $(el).on('click', function(e)
            {
                e.preventDefault();
                var linkEl = galleryWrapper.find('.ig-slideshow-item').eq($(this).parent().index());
                var link = linkEl.attr('data-ig-image-link');

                if(galleryWrapper.find('.ig-slideshow').attr('data-ig-show-main') == 1)
                {
                    slideshow.show(index);
                }
                else if( link.length > 2)
                {
                    if(linkEl.attr('data-ig-link-new') == 1)
                    {
                        window.open(link);
                    }
                    else
                    {
                        window.location = link;
                    }
                }
                else if(galleryWrapper.find('.igui-slideshow-items').attr('data-ig-lightbox') == 1)
                {
                    panel.show($(this).parent().index());
                }
            });
        });

        function imageUrl(index,replace)
        {
            var newUrl = '';
            var shareUrl = getUrlParamater('shareurl');
            if(shareUrl != 'unset')
            {
                var imageid = galleryWrapper.find('.ig-slideshow-item').eq(index).attr('data-ig-imageid');

                var url = shareUrl.indexOf('?') !== -1 ? decodeURIComponent(shareUrl)+'&img='+imageid : decodeURIComponent(shareUrl)+'?img='+imageid;
                return url;
            }

            var imgName = galleryWrapper.find('.ig-slideshow-item').eq(index).attr('data-ig-imagehash');
            var url = window.location.href;

            var currentUrlParam = getUrlParamater('i');

            if(currentUrlParam != 'unset')
            {
                if(url.indexOf('?i='+currentUrlParam+'&') !== -1)
                {
                    newUrl = url.replace('i='+currentUrlParam+'&','');
                    newUrl = newUrl+'&i='+imgName;
                }
                else if(url.indexOf('?i='+currentUrlParam) !== -1)
                {
                    newUrl = url.replace('?i='+currentUrlParam,'');
                    newUrl = newUrl+'?i='+imgName;
                }
                else if(url.indexOf('&i='+currentUrlParam) !== -1)
                {
                    newUrl = url.replace('&i='+currentUrlParam,'');
                    newUrl = newUrl+'&i='+imgName;
                }
            }
            else if(url.indexOf('?') !== -1)
            {
                newUrl = url+'&i='+imgName;
            }
            else
            {
                newUrl = url+'?i='+imgName;
            }

            if(replace)
            {
                if(newUrl != url)
                {
                    history.replaceState({imgId:index}, document.title, newUrl);
                }
            }
            else
            {
                return newUrl;
            }
        }

        function getUrlParamater(paramName)
        {
            var urlValue = 'unset';
            var url = window.location.href;

            if(url.indexOf("?") > -1)
            {
                var queryParams = url.substr(url.indexOf("?"));
                var queryParamsArray = queryParams.split("&");

                for(var i=0; i< queryParamsArray.length; i++ )
                {
                    if( queryParamsArray[i].indexOf(paramName + "=") > -1 )
                    {
                        var paramMatch = queryParamsArray[i].split("=");
                        urlValue = paramMatch[1];
                        break;
                    }
                }
            }
            return unescape(urlValue);
        }

    });

    $('.ig-slideshow-image, .ig-scroller-img, .ig-menu-grid-image, .ig-thumbs-grid-image').hover(function()
        {
            $(this).data('originalTitle',$(this).attr('title'));
            $(this).removeAttr('title');
        },
        function()
        {
            $(this).attr('title',$(this).data('originalTitle'));
        });



});
