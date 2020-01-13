function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name'].split('properties[').join('').split(']').join('')] = n['value'];
    });
    return indexed_array;
}
/*---------------------MODAL CHECKOUT-----------------------------*/
function freeShipping(current,max) {
    var $progress = $('.free-shipping-progress-bar'),
        $current = $('.free-shipping-current'),
        $max = $('.free-shipping-full'),
        $alert = $('.js-free-shipping-alert'),
        $text = $('.js-free-shipping-text'),
        current = current,
        max = max;

    var  percent = Math.floor(current/max*100, 10);
    if (percent >= 100) {
        percent = $alert.html();
        $text.hide();
        $progress.css({
            width: '100%'
        })
        $progress.html(percent);
    } else {
        $text.show();
        $progress.css({
            width: percent + '%'
        })
        $progress.html(percent + '%');
    }
    if (percent < 100 && percent >=33){
        $progress.addClass('progress-bar-middle');
        $progress.removeClass('progress-bar-low')
    } else if (percent < 33) {
        $progress.addClass('progress-bar-low');
        $progress.removeClass('progress-bar-middle')
    } else {
        $progress.removeClass('progress-bar-low progress-bar-middle')
    }
    $current.html(Shopify.formatMoney((max-current)*100, price_format));
    $max.html(max);
    $progress.closest('.free-shipping').removeClass('hidden');
}
function freeShippingInit(){
    if($('.js-free-shipping-text').length)freeShipping(CartJS.cart.total_price/100,$('.js-free-shipping-text').data('count'));
    currencyUpdate();
}
function showCheckoutModal()
{
    $('.removed-note').addClass('hidden');
    $.fancybox.open({ src: '#modalCheckOut',touch: false,afterShow: function () {
        currencyUpdate();
    }})
}
function modalCheckoutUpdate(){
    $price_format=price_format;
    if($('body').hasClass('checkout-popup')){
        $('.js-mdlchk-prd-count').text(CartJS.cart.item_count);
        $('.js-mdlchk-prd-total').html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
        renderCartInModalPopup();
        renderPluralSingle('>1,0');
    }
}
function renderCartInModalPopup()
{
    $cart_count=$('.minicart .minicart-qty');
    cart_list='.modalchk-prd .cart-table';
    $cart_subtotal=$('.minicart-total');
    $price_format=price_format;

    $updated_list='';
    line_item=1;
    $.each(CartJS.cart.items, function(index, item) {
        variant_title='';
        properties='';
        $.each(item.properties, function(a, b) {
            if(b!="")
            {
                properties=properties+'<div class="options_title">'+a+': '+b+'</div>';
            }
        });
        variant_title = item.product_title;
        if(item.variant_title != 'Default' && item.variant_title != undefined){variant_title=item.variant_title}
        $item='<div class="cart-table-prd"> <div class="cart-table-prd-image"> <a href="' + item.url+'"><img src = "'+item.image+'" alt="'+item.product_title+'"></a> </div> <div class="cart-table-prd-name"> <h5><span>' + item.vendor+'</span></h5> <h2><a href="' + item.url+'">'+item.title+'</a></h2></div> <div class="cart-table-prd-price"><b>'+Shopify.formatMoney(item.price, $price_format)+'</b></div> <div class="cart-table-prd-qty"> <div class="prd-block_qty"> <div class="qty qty-changer"> <fieldset> <input type="button" value="&#8210;" class="decrease" data-variant-id="'+item.variant_id+'" data-variant-url="' + item.url+'" data-variant-name="'+item.title+'"> <input disabled type="text" class="qty-input" value="'+item.quantity+'" data-min="0" data-max="9999"> <input type="button" value="+" class="increase" data-variant-id="'+item.variant_id+'" data-variant-url="' + item.url+'" data-variant-name="'+item.title+'"> </fieldset> </div> </div> </div> <div class="cart-table-prd-price"><b>'+Shopify.formatMoney(item.line_price, $price_format)+'</b></div> <div class="cart-table-prd-action"> <a href="' + item.url+'" data-variant-name="'+item.title+'" data-variant-id="'+item.variant_id+'" data-line-number="'+line_item+'"  title="'+locales.remove+'" class="icon-cross js-popupcart-remove-item"></a> </div> </div>';
        $updated_list=$updated_list+$item;
        line_item=line_item+1;
        $(cart_list).html('<div class="block fullheight fullwidth empty-cart"> <div class="container"> <div class="image-empty-cart"> <img src="//cdn.shopify.com/s/files/1/0744/9541/t/139/assets/empty-basket.png?17187805938738385478" alt=""> <div class="text-empty-cart-1">SHOPPING CART IS</div> <div class="text-empty-cart-2">EMPTY</div> </div> <div><a href="#" onclick="history.go(-1);return false;" class="btn">back to previous page</a></div> </div> </div>'); }); $(cart_list).html($updated_list);
    freeShippingInit();
    if(CartJS.cart.item_count>0){$('.btn.checkout_procees').show()}else{$('.btn.checkout_procees').hide()}
    currencyUpdate();
}
$(document).on('click','.modalchk-prd .increase,.modalchk-prd .decrease',function(e){
    $('.modal--checkout .modal-content').addClass('is-loading');
    val = $(this).parent().find('input.qty-input').val();
    if($(this).hasClass('increase')) val ++;
    if($(this).hasClass('decrease')) val --;
    if(val < 0) val = 0;
    variant_id = $(this).attr('data-variant-id');
    variant_name = $(this).attr('data-variant-name');
    variant_url = $(this).attr('data-variant-url');
    CartJS.updateItemById(variant_id, val,{},{
        "success": function(data, textStatus, jqXHR) {
            renderCartInModalPopup();
            if(val == 0)
            {
                $('.product-removed-title').text(variant_name).attr('href',variant_url);
                $('.js-undo-remove').attr('data-variant-id',variant_id);
                $('.removed-note').removeClass('hidden');
            }
            setTimeout(function(){
                $('.modal--checkout .modal-content').removeClass('is-loading');
            },500)

        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})

        }
    });
    e.preventDefault();
})

$(document).on('click','a.js-popupcart-remove-item',function(e){
    $('.modal--checkout .modal-content').addClass('is-loading');
    variant_id = $(this).attr('data-variant-id');
    variant_name = $(this).attr('data-variant-name');
    variant_url = $(this).attr('data-variant-url');
    CartJS.removeItem($(this).data('line-number'),{
        "success": function(data, textStatus, jqXHR) {
            renderCartInModalPopup();
            $('.product-removed-title').text(variant_name).attr('href',variant_url);
            $('.js-undo-remove').attr('data-variant-id',variant_id);
            $('.removed-note').removeClass('hidden');
            setTimeout(function(){
                $('.modal--checkout .modal-content').removeClass('is-loading');
            },500)
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})
        }
    });
    e.preventDefault();
})

$(document).on('click','.js-undo-remove',function(e){
    $('.modal--checkout .modal-content').addClass('is-loading');
    variant_id = $(this).attr('data-variant-id');
    CartJS.addItem(variant_id, 1,{},{
        "success": function(data, textStatus, jqXHR) {
            renderCartInModalPopup();
            $('.removed-note').addClass('hidden');
            setTimeout(function(){
                $('.modal--checkout .modal-content').removeClass('is-loading');
            },500)
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})

        }
    });
    e.preventDefault();
})
function getLatestProductData(variant_id){
    setTimeout(function(){
        $('.modalchk-prd-image').append("<div class='gdw-loader'></div>");
        $price_format=price_format;
        $.each(CartJS.cart.items, function (i, item) {
            if(item.id == variant_id){
                $('.modalchk-price').html(Shopify.formatMoney(item.price, $price_format));
                $('.modalchk-prd-info .modalchk-title').html('<a href="' + item.url + '" title="' + item.product_title + '">' + item.product_title + '</a>');
                $('.modalchk-prd-info .label-options').html(item.variant_title);
                image = item.image;
                if(image.indexOf('.png?v=') !== -1)
                {
                    image = image.replace('.png?v=','_340x.png?v=');
                }
                else if(image.indexOf('.jpg?v=') !== -1)
                {
                    image = image.replace('.jpg?v=','_340x.jpg?v=');
                }
                else if(image.indexOf('.gif?v=') !== -1)
                {
                    image = image.replace('.gif?v=','_340x.gif?v=');
                }
                $('.modalchk-prd-image').html('<a href="' + item.url + '" title="' + item.title + '"><img src="' + image + '" alt="' + item.title + '"><div class="gdw-loader"></div></a>');
            }
        })
        setTimeout(function(){
            $('.modalchk-prd-image .gdw-loader').remove();
        },1000)
    },1000)
}
/*---------------------END MODAL CHECKOUT-----------------------------*/
/*---------------------COLOR IMAGE PRICE SELECTOR CHANGE--------------*/
function _changeVprice(price,compare_price,el){
    $('.price-new',el).html(Shopify.formatMoney(price, moneyFormat));
    $('.prd-price .price-old,.prd-price .price-comment',el).remove();
    if(compare_price)
    {
        $('<div class="price-old">'+Shopify.formatMoney(compare_price, moneyFormat)+'</div><div class="price-comment"></div>').appendTo($('.prd-price',el));
    }
    currencyUpdate();
}
function _changeQuickViewPrice(price,compare_price,el){
    $('.prd-block_price--actual',el).html(Shopify.formatMoney(price, moneyFormat));
    $('.prd-block_price--old',el).remove();
    if(compare_price)
    {
        $('<div class="prd-block_price--old">'+Shopify.formatMoney(compare_price, moneyFormat)+'</div>').appendTo($('.prd-block_price',el));
    }
    currencyUpdate();
}
function _changeVid(vid,el) {
    $('select[name=id]',el).selectpicker('val', vid);
}
function _changePreviews(image,el) {
    data = {
        toggle: '.js-color-toggle',
        image: '.js-prd-img',
        colorswatch: '.color-swatch',
        product: '.prd, .prd-hor',
        arrows: '.color-swatch-arrows',
        prev: '.js-color-swatch-prev',
        next: '.js-color-swatch-next',
        scrolldiv: '.color-swatch-scroll',
        scrollpx: 42,
        scrollspeed: 300
    }
    $('.color-swatch li',el).removeClass('active');
    if (image) {
        var $prd = el,
            $image = $prd.find(data.image),
            imgSrc = image;
        $prd.addClass('prd-loading');
        //$($(data.toggle).parent(),el).siblings().removeClass('active');
        var newImg = document.createElement("img");
        newImg.src = imgSrc;
        newImg.onload = function() {
            $image.attr('src', imgSrc);
            $image.attr('srcset', imgSrc);
            $prd.removeClass('prd-loading');
        };
    }
}

function updateProductCardSelectbox(){
    $('.prd-action select').on('loaded.bs.select', function () {
        currencyUpdate();
    }).on('show.bs.select', function () {
        currencyUpdate();
    }).on('changed.bs.select', function () {
        product_item = $(this).closest('.product-item.prd');
        val = $(this).selectpicker('val');
        option = $('option[value='+val+']',$(this));
        price = option.data('price');
        compare_price = option.data('compare-price');
        data_image = option.data('image');
        color = option.data('color');
        _changeVprice(price,compare_price,product_item);
        _changePreviews(data_image,product_item);
        currencyUpdate();
    });
}

$(document).on('click','.prd .prd-img-area .color-swatch li',function(){
    product_item = $(this).closest('.product-item.prd');

    _changeVprice($(this).data('price'),$(this).data('compare-price'),product_item);
    _changeVid($(this).data('variant-id'),product_item);
    $('.color-swatch li',product_item).removeClass('active');
    $(this).addClass('active');
})
updateProductCardSelectbox();
/*---------------------END COLOR IMAGE PRICE SELECTOR CHANGE----------*/

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

function initElevateZoom($imageHolder, $zoomImg, $prdBlock) {
    var $imageHolder = $imageHolder,
        $zoomImg = $zoomImg,
        imageHolder = '.prd-block_main-image-holder',
        zoompos = $('body').is('.rtl') ? 11 : 1,
        append,
        zoomtype;
    if (!$('body').hasClass('touch')) {
        $imageHolder.removeClass('hideZoom');
        append = '#' + $prdBlock.attr('id') + " " + imageHolder;
        zoomtype = $zoomImg.closest('[data-zoomtype]').data('zoomtype') ? $zoomImg.closest('[data-zoomtype]').data('zoomtype') : 'window';
        $zoomImg.ezPlus({
            zoomType: zoomtype,
            zIndex: 149,
            zoomWindowPosition: zoompos,
            zoomContainerAppendTo: append,
            zoomWindowFadeIn: 500,
            zoomWindowFadeOut: 500,
            lensFadeIn: 500,
            lensFadeOut: 500,
            imageCrossfade: true,
            responsive: true,
            cursor: 'crosshair'
        });
        $imageHolder.addClass('zoomInit');
    } else {
        $imageHolder.addClass('hideZoom');
    }
}

function destroyElevateZoom($imageHolder, $zoomImg) {
    var $zoomImg = $zoomImg,
        $imageHolder = $imageHolder;
    if ($('.zoomContainer').length) {
        $zoomImg.data('ezPlus').destroy();
        $zoomImg.removeData('ezPlus');
    }
    $('.zoomContainer, .ezp-spinner').remove();
    if ($zoomImg.closest('.zoomWrapper').length) {
        $zoomImg.removeAttr('style').unwrap();
    }
    $imageHolder.removeAttr('style');
}

function updateData($type,$id,$options){
  	path='product_options_'+$id;
    product_to_update=$('.product-info-block-id-'+$id);
    $price_format=price_format;

    $($type,$options).each(function(){
        if($type=='select') val=$(this).val(); else val=$(this).data('value');
        x='[\''+val+'\']';
        path+=x;
    });
    if(eval(path)!=undefined){
        /*variant changer*/
        $('input[name=id]',product_to_update).val(eval(path+'[\'id\']'));
        window.history.pushState('', '', updateQueryStringParameter(window.location.toString(),'variant',eval(path+'[\'id\']')));

        /*add to cart button update for checkout modal*/
        $('.js-add-to-cart-product-page',product_to_update).attr('data-variant-id',eval(path+'[\'id\']'));

        /*price changer*/
        $('.prd-block_price--actual',product_to_update).html(Shopify.formatMoney(eval(path+'[\'price\']'), $price_format));

        /*compare price changer*/
        if(eval(path+'[\'compare_at_price\']')!='')
        {
            if(parseInt(eval(path+'[\'compare_at_price\']'))>parseInt(eval(path+'[\'price\']')))
            {
                if($('.prd-block_price').hasClass('show_you_save'))
                {
                    save = parseInt(eval(path+'[\'compare_at_price\']'))-parseInt(eval(path+'[\'price\']'));
                    if($('.prd-block_price .price-comment').length)
                    {
                        $('.prd-block_price .price-comment').removeClass('hidden');
                    }else{
                        $('.prd-block_price').append('<div class="price-comment">'+locales.you_save+' <span></span></div>')
                    }
                    $('.prd-block_price .price-comment span').html(Shopify.formatMoney(save, $price_format));
                }

                if($('.prd-block_price .prd-block_price--old').length){
                    $('.prd-block_price .prd-block_price--old',product_to_update).html(Shopify.formatMoney(eval(path+'[\'compare_at_price\']'), $price_format));
                }else{
                    $('.prd-block_price',product_to_update).append('<div class="prd-block_price--old">'+Shopify.formatMoney(eval(path+'[\'compare_at_price\']'), $price_format)+'</div>');
                }
            }else{
                $('.prd-block_price--old',product_to_update).html('');
            }
        }
        else {
            $('.prd-block_price--old',product_to_update).html('');
            if($('.prd-block_price').hasClass('show_you_save'))
            {
                if($('.prd-block_price .price-comment').length){
                    $('.prd-block_price .price-comment',product_to_update).addClass('hidden');
                }
            }
        }


        /*sku changer*/
        sku=eval(path+'[\'sku\']');
        if(sku == '')sku = '----'
        $('.product-sku span',product_to_update).html(sku);

        GOODWIN.product.swatchToggleSize(eval(path+'[\'image\']'), product_to_update);

        /*stock changer*/
        path_inventory_management = eval(path + '[\'inventory_management\']');
        path_inventory_quantity = eval(path + '[\'inventory_quantity\']');
        path_inventory_policy = eval(path + '[\'inventory_policy\']');
        if($('.prd-availability').length)
        {
            if (path_inventory_quantity < 1 && path_inventory_management == 'shopify' && path_inventory_policy == 'continue') {
                $('.prd-availability:first span',product_to_update).html('<span class="pre-order-color">'+locales.pre_order+'</span>')
            } else if(path_inventory_quantity < 1 && path_inventory_management == 'shopify' && path_inventory_policy == 'deny') {
                $('.prd-availability:first span',product_to_update).text(locales.out_of_stock)
            } else {
                $('.prd-availability:first span',product_to_update).text(locales.in_stock)
            }
        }
    }
    currencyUpdate();
}

function add_to() {
    if($('body').hasClass('adding_'))return false;
    $('body').addClass('adding_');
    _this = $(this);
    $form=_this.closest('form');
    var line_properties = getFormData($('[name*=properties]',$form));
    CartJS.addItem(_this.data("variant-id"), 1, line_properties, {
        "success": function (data, textStatus, jqXHR) {
            if (_this.length) {
                if($('body').hasClass('checkout-popup'))
                {
                    getLatestProductData(_this.data("variant-id"));
                    setTimeout(function () {
                        showCheckoutModal();
                    }, 2000);
                }
                _this.addClass('btn--loading');
                setTimeout(function () {
                    $('.js-add-to-cart').removeClass('btn--loading');
                }, 2000);
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            }
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
            $.fancybox.open({ src: '#modalError'})
            setTimeout(function () {
                $('body').removeClass('adding_');
            }, 2500);
        }
    });
    CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
}

if($('body').hasClass('ajax_cart'))
{
    $(document).on('click','.js-add-to-cart',function(e){
        add_to.call(this);
        e.preventDefault();
    });

    $(document).on('click','.js-add-to-cart-select',function(e){
        if($('body').hasClass('adding_'))return false;
        $('body').addClass('adding_');
        _this = $(this);
        $form=_this.closest('form');
        CartJS.addItem($('[name=id]',$form).val(), 1,{}, {
            "success": function(data, textStatus, jqXHR) {
                if($('body').hasClass('checkout-popup'))
                {
                    getLatestProductData($('[name=id]',$form).val());
                    setTimeout(function () {
                        showCheckoutModal();
                    }, 2000);
                }
                _this.addClass('btn--loading');
                setTimeout(function () {
                    $('.js-add-to-cart-select').removeClass('btn--loading');
                }, 2000);
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                $('#modalError .sms').text(locales.select_the_variant);
                $.fancybox.open({ src: '#modalError'})
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            }
        });
        CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        e.preventDefault();
    })

    $(document).on('click','.js-add-to-cart-product-page',function(e){
        if($('body').hasClass('loading'))return false;
        _this = $(this);
        $form=_this.closest('form');
        var line_properties = getFormData($('[name*=properties]',$form));
        CartJS.addItem($('[name=id]',$form).val(), $('[name=quantity]',$form).val(),line_properties, {
            "success": function(data, textStatus, jqXHR) {
                if($('.js-add-to-cart-product-page').length){
                    if($('body').hasClass('checkout-popup'))
                    {
                        getLatestProductData($('[name=id]',$form).val());
                        setTimeout(function () {
                            showCheckoutModal();
                        }, 2000);
                    }
                    _this.addClass('btn--loading')
                    setTimeout(function () {
                        $('.js-add-to-cart-product-page').removeClass('btn--loading');
                    }, 2000);
                }
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
                $.fancybox.open({ src: '#modalError'})
            }
        });
        CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        e.preventDefault();
    })


}

function cartPopupUpdate(){
    $cart_count=$('.minicart .minicart-qty');
    cart_list='.cart-list-prd';
    $cart_subtotal=$('.minicart-total');
    $price_format=price_format;
    if(CartJS.cart.item_count > 0)
    {
        free_shipping = '';
        if(checkout_popup_free_shipping_yes && free_shipping_header_cart_yes)
        {
            free_shipping =  '<div class="free-shipping">' +
                '   <div class="free-shipping-progress progress">' +
                '       <div class="free-shipping-progress-bar progress-bar progress-bar-striped active"></div>' +
                '   </div>' +
                '   <div class="free-shipping-text js-free-shipping-text" data-count="'+checkout_popup_free_shipping_count+'">'+locales.checkout_popup_free_condition_text+' ('+locales.free_shipping_from+'  '+Shopify.formatMoney(checkout_popup_free_shipping_count*100,price_format)+').</div>' +
                '   <div class="hidden js-free-shipping-alert">'+locales.congrats+'</div>' +
                '</div>';
        }
        $('.minicart-drop-content').html('<h3>'+locales.recently_added_items+':</h3><div class="cart-list-prd"></div>' + free_shipping +
            '<div class="minicart-drop-total"> ' +
            '   <div class="pull-right">' +
            '       <span class="minicart-drop-summa"><span>'+locales.subtotal+':</span> <b>'+Shopify.formatMoney(CartJS.cart.total_price, $price_format)+'</b></span> ' +
            '       <div class="minicart-drop-btns-wrap">' +
            '            <a href="/checkout" class="btn"><i class="icon-check-box"></i><span>'+locales.go_to_checkout+'</span></a>' +
            '            <a href="/cart" class="btn btn--alt"><i class="icon-handbag"></i><span>'+locales.view_cart+'</span></a>' +
            '       </div>' +
            '   </div> ' +
            '   <div class="pull-left">' +
            '        <a href="/cart" class="btn btn--alt"><i class="icon-handbag"></i><span>'+locales.view_cart+'</span></a>' +
            '   </div> ' +
            '</div>');

        $updated_list='';
        line_item=1;
        $.each(CartJS.cart.items, function(index, item) {
            variant_title='';
            properties='';
            $.each(item.properties, function(a, b) {
                if(b!="")
                {
                    properties=properties+'<div class="options_title">'+a+': '+b+'</div>';
                }
            });
            if(item.variant_title != 'Default' && item.variant_title != undefined){variant_title=item.variant_title}
            $item='<div class="minicart-prd"> <div class="minicart-prd-image"> <a href="' + item.url+'" title="'+item.product_title+'"><img src = "'+item.image+'" alt="'+item.product_title+'"> </a> </div> <div class="minicart-prd-name"> <h5><span>' + item.vendor+'</span></h5> <h5><a href="' +item.url+'">'+variant_title+'</a></h5> <h2><a href="' +item.url+'">'+item.product_title+'</a></h2> </div> <div class="minicart-prd-qty"><span>'+locales.qty+':</span> <b>'+item.quantity+'</b></div> <div class="minicart-prd-price"><span>'+locales.price+':</span> <b>'+Shopify.formatMoney(item.price, $price_format)+'</b></div> <div class="minicart-prd-action"> <a href="' + item.url+'"  class="icon-pencil "></a> <a href="' + item.url+'" data-variant-id="'+item.variant_id+'" data-line-number="'+line_item+'"  title="'+locales.remove+'" class="icon-cross js-minicart-remove-item"></a> </div> </div>';
            $updated_list=$updated_list+$item;
            line_item=line_item+1;
        });
        $(cart_list).html($updated_list);
        currencyUpdate();
    }
    else
    {
        $('.minicart-drop-content').html('<div class="cart-empty mx-auto"> <div class="cart-empty-icon"> <i class="icon icon-handbag"></i> </div> <div class="cart-empty-text"> <h3 class="cart-empty-title">'+locales.empty_minicart_text_1+'</h3> <p>'+locales.empty_minicart_text_2+' <a href="collections/all/">'+locales.empty_minicart_text_3+'</a></p> </div> </div>');
    }
    $cart_subtotal.html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
    $cart_count.html(CartJS.cart.item_count);
}
function currencyUpdate(){
    if(jQuery('.selected-currency:first').length)
    {
        Currency.convertAll(shopCurrency, jQuery('.selected-currency:first').text());
    }
}

$(document).on('click','a.js-minicart-remove-item',function(e){
    CartJS.removeItem($(this).data('line-number'),{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})
        }
    })
    e.preventDefault();
})
$(document).on('click','.update_qty',function(e){
    CartJS.updateItemById($(this).data('variant-id'), $(this).prev().val(),{},{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})

        }
    });
    e.preventDefault();
})
$(document).on('cart.requestComplete', function(event, cart) {
    cartPopupUpdate();
    modalCheckoutUpdate();
    currencyUpdate();
});


function showProduct(delay,effect,selector){
    var delay = delay,
        effect = effect;
    $(selector).each(function(i) {
        var $this = $(this);
        setTimeout(function(){
            //$this.addClass(effect + ' animated');
        }, delay*i);
    });
}

function viewMode(viewmode) {
    var $grid = $('.grid-view', $(viewmode)),
        $list = $('.list-view', $(viewmode)),
        $products = $('.products-listview, .products-grid');
    if ($('.products-listview').length){
        $list.addClass('active');
    } else if ($('.products-grid').length){
        $grid.addClass('active');
    } else return false;
    $grid.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $list.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-listview').addClass('products-grid');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
    $list.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $grid.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-grid').addClass('products-listview');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
}

function tooltipIni() {
    var title;
    $('[data-tooltip]').darkTooltip({
        size: 'small',
        animation: 'fade'
    }).hover(function () {
        title = $(this).attr('title');
        $(this).attr('title', '');
    }, function () {
        $(this).attr('title', title);
    });
}

function countDownIni(countdown) {
    $(countdown).each(function () {
        var countdown = $(this);
        var promoperiod;
        if (countdown.attr('data-promoperiod')) {
            promoperiod = new Date().getTime() + parseInt(countdown.attr('data-promoperiod'), 10);
        } else if (countdown.attr('data-countdown')) {
            promoperiod = countdown.attr('data-countdown');
        }
        if (Date.parse(promoperiod) - Date.parse(new Date()) > 0) {
            countdown.countdown(promoperiod, function (event) {
                countdown.html(event.strftime('<span><span>%D</span>DAYS</span>' + '<span><span>%H</span>HRS</span>' + '<span><span>%M</span>MIN</span>' + '<span><span>%S</span>SEC</span>'));
            });
        }
    });
}
function renderPluralSingle(statement){
    var statement = statement;
    $('[data-text-plural]').each(function(){
        var $this = $(this),
            $target = $('.'+ $this.attr('data-count')),
            count = parseInt($target.html(),10),
            statementArray = statement.split(','),
            statementString = '';
        $.each(statementArray, function (index, value) {
            if($.isNumeric(value.substring(0))){
                statementString += 'count==' + value
            } else {
                statementString += 'count' + value
            }
            if (index !== (statementArray.length - 1)) {
                statementString += '||'
            }
        });
        if (eval(statementString)){
            $this.html($this.data('text-plural'))
        } else {
            $this.html($this.data('text-single'))
        }
    })
}





/*--------------------------------SHOPIFY theme.js-----------------------------------*/
window.theme = window.theme || {};
theme.customerTemplates = (function() {

    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /**
     *
     *  Show/Hide recover password form
     *
     */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /**
     *
     *  Show reset password success message
     *
     */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
            return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /**
     *
     *  Show/hide customer address forms
     *
     */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
            return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
                hideElement: 'AddressProvinceContainerNew'
            });
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });



        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
                Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
        });
    }

    /**
     *
     *  Check URL for reset password hash
     *
     */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
            toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();
theme.init = function() {
    theme.customerTemplates.init();
};
$(function(){
    $(theme.init);
    $('.address-new-toggle').on('click', function() {
        $('#AddressNewForm').toggleClass('hide');
    });
})

/*--------------------------------FOR SWATCHES UPDATE-----------------------------------*/
/*THEME.JS DEBUTE*/
window.debute = window.debute || {};
window.GOODWIN = window.GOODWIN || {};
window.slate = window.slate || {};
debute.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];

    $(document)
        .on('shopify:section:load', this._onSectionLoad.bind(this))
        .on('shopify:section:unload', this._onSectionUnload.bind(this))
        .on('shopify:section:select', this._onSelect.bind(this))
        .on('shopify:section:deselect', this._onDeselect.bind(this))
        .on('shopify:block:select', this._onBlockSelect.bind(this))
        .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};
debute.Sections.prototype = _.assignIn({}, debute.Sections.prototype, {
    _createInstance: function(container, constructor) {
        var $container = $(container);
        var id = $container.attr('data-section-id');
        var type = $container.attr('data-section-type');

        constructor = constructor || this.constructors[type];

        if (_.isUndefined(constructor)) {
            return;
        }

        var instance = _.assignIn(new constructor(container), {
            id: id,
            type: type,
            container: container
        });

        this.instances.push(instance);
    },

    _onSectionLoad: function(evt) {
        var container = $('[data-section-id]', evt.target)[0];
        if (container) {
            this._createInstance(container);
        }
    },

    _onSectionUnload: function(evt) {
        this.instances = _.filter(this.instances, function(instance) {
            var isEventInstance = instance.id === evt.detail.sectionId;

            if (isEventInstance) {
                if (_.isFunction(instance.onUnload)) {
                    instance.onUnload(evt);
                }
            }

            return !isEventInstance;
        });
    },

    _onSelect: function(evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
            instance.onSelect(evt);
        }
    },

    _onDeselect: function(evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
            instance.onDeselect(evt);
        }
    },

    _onBlockSelect: function(evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
            instance.onBlockSelect(evt);
        }
    },

    _onBlockDeselect: function(evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
            instance.onBlockDeselect(evt);
        }
    },

    register: function(type, constructor) {
        this.constructors[type] = constructor;

        $('[data-section-type=' + type + ']').each(
            function(index, container) {
                this._createInstance(container, constructor);
            }.bind(this)
        );
    }
});
debute.Currency = (function () {
    var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
        if (typeof cents === 'string') {
            cents = cents.replace('.', '');
        }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = format || moneyFormat;

        function formatWithDelimiters(number, precision, thousands, decimal) {
            thousands = thousands || ',';
            decimal = decimal || '.';

            if (isNaN(number) || number === null) {
                return 0;
            }

            number = (number / 100.0).toFixed(precision);

            var parts = number.split('.');
            var dollarsAmount = parts[0].replace(
                /(\d)(?=(\d\d\d)+(?!\d))/g,
                '$1' + thousands
            );
            var centsAmount = parts[1] ? decimal + parts[1] : '';

            return dollarsAmount + centsAmount;
        }

        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
            case 'amount_no_decimals_with_space_separator':
                value = formatWithDelimiters(cents, 0, ' ');
                break;
            case 'amount_with_apostrophe_separator':
                value = formatWithDelimiters(cents, 2, "'");
                break;
        }

        return formatString.replace(placeholderRegex, value);
    }

    return {
        formatMoney: formatMoney
    };
})();
debute.Images = (function () {
    /**
     * Preloads an image in memory and uses the browsers cache to store it until needed.
     *
     * @param {Array} images - A list of image urls
     * @param {String} size - A shopify image size attribute
     */

    function preload(images, size) {
        if (typeof images === 'string') {
            images = [images];
        }

        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            this.loadImage(this.getSizedImageUrl(image, size));
        }
    }

    /**
     * Loads and caches an image in the browsers cache.
     * @param {string} path - An image url
     */
    function loadImage(path) {
        new Image().src = path;
    }

    /**
     * Swaps the src of an image for another OR returns the imageURL to the callback function
     * @param image
     * @param element
     * @param callback
     */
    function switchImage(image, element, callback) {
        var size = this.imageSize(element.src);
        var imageUrl = this.getSizedImageUrl(image.src, size);

        if (callback) {
            callback(imageUrl, image, element); // eslint-disable-line callback-return
        } else {
            element.src = imageUrl;
        }
    }

    /**
     * +++ Useful
     * Find the Shopify image attribute size
     *
     * @param {string} src
     * @returns {null}
     */
    function imageSize(src) {
        var match = src.match(
            /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\\.@]/
        );

        if (match !== null) {
            if (match[2] !== undefined) {
                return match[1] + match[2];
            } else {
                return match[1];
            }
        } else {
            return null;
        }
    }

    /**
     * +++ Useful
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
        if (size === null) {
            return src;
        }

        if (size === 'master') {
            return this.removeProtocol(src);
        }

        var match = src.match(
            /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i
        );

        if (match !== null) {
            var prefix = src.split(match[0]);
            var suffix = match[0];

            return this.removeProtocol(prefix[0] + '_' + size + suffix);
        }

        return null;
    }

    function removeProtocol(path) {
        return path.replace(/http(s)?:/, '');
    }

    return {
        preload: preload,
        loadImage: loadImage,
        switchImage: switchImage,
        imageSize: imageSize,
        getSizedImageUrl: getSizedImageUrl,
        removeProtocol: removeProtocol
    };
})();
debute.Product = (function() {
    function Product(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');

        this.settings = {
            // Breakpoints from src/stylesheets/global/variables.scss.liquid
            mediaQueryMediumUp: 'screen and (min-width: 750px)',
            mediaQuerySmall: 'screen and (max-width: 749px)',
            bpSmall: false,
            enableHistoryState: $container.data('enable-history-state') || false,
            namespace: '.slideshow-' + sectionId,
            sectionId: sectionId,
            sliderActive: false,
            zoomEnabled: false
        };

        this.selectors = {
            addToCart: '[data-add-to-cart]',
            addToCartText: '[data-add-to-cart-text]',
            cartCount: '[data-cart-count]',
            cartCountBubble: '[data-cart-count-bubble]',
            cartPopup: '[data-cart-popup]',
            cartPopupCartQuantity: '[data-cart-popup-cart-quantity]',
            cartPopupClose: '[data-cart-popup-close]',
            cartPopupDismiss: '[data-cart-popup-dismiss]',
            cartPopupImage: '[data-cart-popup-image]',
            cartPopupImageWrapper: '[data-cart-popup-image-wrapper]',
            cartPopupImagePlaceholder: '[data-cart-popup-image-placeholder]',
            cartPopupPlaceholderSize: '[data-placeholder-size]',
            cartPopupProductDetails: '[data-cart-popup-product-details]',
            cartPopupQuantity: '[data-cart-popup-quantity]',
            cartPopupQuantityLabel: '[data-cart-popup-quantity-label]',
            cartPopupTitle: '[data-cart-popup-title]',
            cartPopupWrapper: '[data-cart-popup-wrapper]',
            loader: '[data-loader]',
            loaderStatus: '[data-loader-status]',
            quantity: '[data-quantity-input]',
            SKU: '[data-sku]',
            stockStatus: '[data-stock-status]',
            productStatus: '[data-product-status]',
            originalSelectorId: '#ProductSelect-' + sectionId,
            productForm: '[data-product-form]',
            errorMessage: '[data-error-message]',
            errorMessageWrapper: '[data-error-message-wrapper]',
            productImageWraps: '.prd-block_main-image',
            productThumbImages: '.product-single__thumbnail--' + sectionId,
            productThumbs: '.product-single__thumbnails-' + sectionId,
            productThumbListItem: '.product-single__thumbnails-item',
            productFeaturedImage: '.product-featured-img',
            productThumbsWrapper: '.thumbnails-wrapper',
            saleLabel: '.product-price__sale-label-' + sectionId,
            singleOptionSelector: '.single-option-selector-' + sectionId,
            shopifyPaymentButton: '.shopify-payment-button',
            priceContainer: '[data-price]',
            regularPrice: '[data-regular-price]',
            salePrice: '[data-sale-price]',
            unitPrice: '[data-unit-price]',
            unitPriceBaseUnit: '[data-unit-price-base-unit]',
            youSave: '[data-you-save]',
            youSaveAmount: '[data-you-save] .money'
        };

        this.classes = {
            cartPopupWrapperHidden: 'cart-popup-wrapper--hidden',
            hidden: 'hide',
            inputError: 'input--error',
            productOnSale: 'price--on-sale',
            productUnitAvailable: 'price--unit-available',
            productUnavailable: 'd-none',
            cartImage: 'cart-popup-item__image',
            productFormErrorMessageWrapperHidden:
                'product-form__error-message-wrapper--hidden',
            activeClass: 'active-thumb'
        };


        this.$addToCart = $(this.selectors.addToCart, $container);
        this.$shopifyPaymentButton = $(
            this.selectors.shopifyPaymentButton,
            $container
        );
        // Stop parsing if we don't have the product json script tag when loading
        // section in the Theme Editor
        if (!$('#ProductJson-' + sectionId).html()) {
            return;
        }

        this.productSingleObject = JSON.parse(
            document.getElementById('ProductJson-' + sectionId).innerHTML
        );

        this._initVariants();
        this._initImageSwitch();
        this._setActiveThumbnail();
    }

    Product.prototype = _.assignIn({}, Product.prototype, {
        _initVariants: function() {
            var options = {
                $container: this.$container,
                enableHistoryState:
                this.$container.data('enable-history-state') || false,
                singleOptionSelector: this.selectors.singleOptionSelector,
                originalSelectorId: this.selectors.originalSelectorId,
                product: this.productSingleObject
            };

            this.variants = new slate.Variants(options);

            this.$container.on(
                'variantChange' + this.settings.namespace,
                this._updateAvailability.bind(this)
            );
            this.$container.on(
                'variantImageChange' + this.settings.namespace,
                this._updateImages.bind(this)
            );
            this.$container.on(
                'variantPriceChange' + this.settings.namespace,
                this._updatePrice.bind(this)
            );
            this.$container.on(
                'variantSKUChange' + this.settings.namespace,
                this._updateSKU.bind(this)
            );
        },

        _initImageSwitch: function() {
            if (!$(this.selectors.productThumbImages).length) {
                return;
            }

            var self = this;

            $(this.selectors.productThumbImages)
                .on('click', function(evt) {
                    evt.preventDefault();
                    var $el = $(this);

                    var imageId = $el.data('thumbnail-id');

                    self._switchImage(imageId);
                    self._setActiveThumbnail(imageId);
                })
                .on('keyup', self._handleImageFocus.bind(self));
        },

        _setActiveThumbnail: function(imageId) {
            /*GOODWIN.product.switchImage(imageId);*/
        },

        _switchImage: function(imageId) {
            GOODWIN.product.switchImage(imageId);
        },

        _handleImageFocus: function(evt) {
            if (evt.keyCode !== slate.utils.keyboardKeys.ENTER) return;

            $(this.selectors.productFeaturedImage + ':visible').focus();
        },

        _youSave: function(evt) {
            var variant = evt.variant;

            var $priceContainer = $(this.selectors.priceContainer, this.$container);
            var $youSave = $(this.selectors.youSave, $priceContainer);
            var $youSaveAmount = $(this.selectors.youSaveAmount, $priceContainer);

            // Reset product price state
            $priceContainer
                .removeClass(this.classes.productUnavailable)
                .removeClass(this.classes.productOnSale)
                .removeClass(this.classes.productUnitAvailable)
                .removeAttr('aria-hidden');

            // Unavailable
            if (!variant) {
                $priceContainer
                    .addClass(this.classes.productUnavailable)
                    .attr('aria-hidden', true);
                return;
            }


            if (variant.compare_at_price > variant.price) {
                $youSaveAmount.html(
                    debute.Currency.formatMoney(
                        (variant.compare_at_price - variant.price),
                        js_helper.moneyFormat
                    )
                );
                $youSave.removeClass(this.classes.productUnavailable);
            } else {
                $youSave.addClass(this.classes.productUnavailable)
            }
        },

        _updateAddToCart: function(evt) {
            var variant = evt.variant;
            
            if (variant) {
                if (variant.available) {
                    this.$addToCart
                        .removeAttr('aria-disabled')
                        .attr('aria-label', js_helper.strings.addToCart);
                    $(this.selectors.addToCartText, this.$container).text(
                        js_helper.strings.addToCart
                    );
                    this.$shopifyPaymentButton.show();
                } else {
                    // The variant doesn't exist, disable submit button and change the text.
                    // This may be an error or notice that a specific variant is not available.
                    this.$addToCart
                        .attr('aria-disabled', true)
                        .attr('aria-label', js_helper.strings.soldOut);
                    $(this.selectors.addToCartText, this.$container).text(
                        js_helper.strings.soldOut
                    );
                    this.$shopifyPaymentButton.hide();
                }
            } else {
                this.$addToCart
                    .attr('aria-disabled', true)
                    .attr('aria-label', js_helper.strings.unavailable);
                $(this.selectors.addToCartText, this.$container).text(
                    js_helper.strings.unavailable
                );
                this.$shopifyPaymentButton.hide();
            }
        },

        _updateStockStatus: function(evt) {
            var variant = evt.variant;

            if (variant) {
                if (variant.available) {
                    $(this.selectors.stockStatus, this.$container).text(
                        js_helper.strings.in_stock
                    );
                } else {
                    $(this.selectors.stockStatus, this.$container).text(
                        js_helper.strings.soldOut
                    );
                }
            } else {
                $(this.selectors.stockStatus, this.$container).text(
                    js_helper.strings.unavailable
                );
            }
        },

        _updateAvailability: function(evt) {

            // update form submit
            this._updateAddToCart(evt);
            // update live region
            //this._updateLiveRegion(evt);

            this._youSave(evt);

            this._updateStockStatus(evt);

            this._updatePrice(evt);
        },

        _updateImages: function(evt) {
            var variant = evt.variant;
            var imageId = variant.featured_image.id;

            this._switchImage(imageId);
            this._setActiveThumbnail(imageId);
        },

        _updatePrice: function(evt) {
            var variant = evt.variant;

            var $priceContainer = $(this.selectors.priceContainer, this.$container);
            var $regularPrice = $(this.selectors.regularPrice, $priceContainer);
            var $salePrice = $(this.selectors.salePrice, $priceContainer);

            // Reset product price state
            $priceContainer
                .removeClass(this.classes.productUnavailable)
                .removeClass(this.classes.productOnSale)
                .removeClass(this.classes.productUnitAvailable)
                .removeAttr('aria-hidden');

            // Unavailable
            if (!variant) {
                $priceContainer
                    .addClass(this.classes.productUnavailable)
                    .attr('aria-hidden', true);
                return;
            }

            // On sale
            if (variant.compare_at_price > variant.price) {
                $salePrice.html(
                    debute.Currency.formatMoney(
                        variant.compare_at_price,
                        js_helper.moneyFormat
                    )
                );
                $regularPrice.html(
                    debute.Currency.formatMoney(variant.price, js_helper.moneyFormat)
                );
                $priceContainer.addClass(this.classes.productOnSale);
            } else {
                // Regular price
                $salePrice.html('');
                $regularPrice.html(
                    debute.Currency.formatMoney(variant.price, js_helper.moneyFormat)
                );

            }
        },

        _updateSKU: function(evt) {
            var variant = evt.variant;
            // Update the sku
            if(variant.sku){
                $(this.selectors.SKU).html(variant.sku);
            } else {
                $(this.selectors.SKU).html('-');
            }
        },

        onUnload: function() {
            this.$container.off(this.settings.namespace);
        }
    });
    return Product;
})();
slate.Variants = (function() {
    /**
     * Variant constructor
     *
     * @param {object} options - Settings from `product.js`
     */
    function Variants(options) {
        this.$container = options.$container;
        this.product = options.product;
        this.singleOptionSelector = options.singleOptionSelector;
        this.originalSelectorId = options.originalSelectorId;
        this.enableHistoryState = options.enableHistoryState;
        this.currentVariant = this._getVariantFromOptions();

        $(this.singleOptionSelector, this.$container).on(
            'change',
            this._onSelectChange.bind(this)
        );
    }

    Variants.prototype = _.assignIn({}, Variants.prototype, {
        /**
         * Get the currently selected options from add-to-cart form. Works with all
         * form input elements.
         *
         * @return {array} options - Values of currently selected variants
         */
        _getCurrentOptions: function() {
            var currentOptions = _.map(
                $(this.singleOptionSelector, this.$container),
                function(element) {
                    var $element = $(element);
                    var type = $element.attr('type');
                    var currentOption = {};

                    if (type === 'radio' || type === 'checkbox') {
                        if ($element[0].checked) {
                            currentOption.value = $element.val();
                            currentOption.index = $element.data('index');

                            return currentOption;
                        } else {
                            return false;
                        }
                    } else {
                        currentOption.value = $element.val();
                        currentOption.index = $element.data('index');

                        return currentOption;
                    }
                }
            );

            // remove any unchecked input values if using radio buttons or checkboxes
            currentOptions = _.compact(currentOptions);

            return currentOptions;
        },

        /**
         * Find variant based on selected values.
         *
         * @param  {array} selectedValues - Values of variant inputs
         * @return {object || undefined} found - Variant object from product.variants
         */
        _getVariantFromOptions: function() {
            var selectedValues = this._getCurrentOptions();
            var variants = this.product.variants;

            var found = _.find(variants, function(variant) {
                return selectedValues.every(function(values) {
                    return _.isEqual(variant[values.index], values.value);
                });
            });

            return found;
        },

        /**
         * Event handler for when a variant input changes.
         */
        _onSelectChange: function() {
            var variant = this._getVariantFromOptions();

            this.$container.trigger({
                type: 'variantChange',
                variant: variant
            });

            if (!variant) {
                return;
            }
            this._updateMasterSelect(variant);
            this._updateImages(variant);
            this._updatePrice(variant);
            this._updateSKU(variant);
            this.currentVariant = variant;

            if (this.enableHistoryState) {
                this._updateHistoryState(variant);
            }
        },

        /**
         * Trigger event when variant image changes
         *
         * @param  {object} variant - Currently selected variant
         * @return {event}  variantImageChange
         */
        _updateImages: function(variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};

            if (
                !variant.featured_image ||
                variantImage.src === currentVariantImage.src
            ) {
                return;
            }

            this.$container.trigger({
                type: 'variantImageChange',
                variant: variant
            });
        },

        /**
         * Trigger event when variant price changes.
         *
         * @param  {object} variant - Currently selected variant
         * @return {event} variantPriceChange
         */
        _updatePrice: function(variant) {
            if (
                variant.price === this.currentVariant.price &&
                variant.compare_at_price === this.currentVariant.compare_at_price
            ) {
                return;
            }

            this.$container.trigger({
                type: 'variantPriceChange',
                variant: variant
            });
        },

        /**
         * Trigger event when variant sku changes.
         *
         * @param  {object} variant - Currently selected variant
         * @return {event} variantSKUChange
         */
        _updateSKU: function(variant) {
            if (variant.sku === this.currentVariant.sku) {
                return;
            }

            this.$container.trigger({
                type: 'variantSKUChange',
                variant: variant
            });
        },

        /**
         * Update history state for product deeplinking
         *
         * @param  {variant} variant - Currently selected variant
         * @return {k}         [description]
         */
        _updateHistoryState: function(variant) {
            if (!history.replaceState || !variant) {
                return;
            }

            var newurl =
                window.location.protocol +
                '//' +
                window.location.host +
                window.location.pathname +
                '?variant=' +
                variant.id;
            window.history.replaceState({ path: newurl }, '', newurl);
        },

        /**
         * Update hidden master select of variant change
         *
         * @param  {variant} variant - Currently selected variant
         */


        _updateMasterSelect: function(variant) {
            $(this.originalSelectorId, this.$container).val(variant.id);
        }
    });

    return Variants;
})();
$(document).ready(function() {
    var sections = new debute.Sections();
    sections.register('product', debute.Product);
});