/* eslint-disable no-unused-vars */
var startTime = new Date(); // This is used by ol.analytics.js
/* eslint-enable no-unused-vars */

var Browser = {
    getJsonFromUrl: function () {
        var query = location.search.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    },

    change_url: function(query) {
        var getUrl = window.location;
        var baseUrl = getUrl.protocol + "//" + getUrl.host +
            "/" + getUrl.pathname.split('/')[1];
        window.history.pushState({
            "html": document.html,
            "pageTitle": document.title + " " + query,
        }, "", baseUrl + "?id=" + query);
    },

    removeURLParameter: function(url, parameter) {
        var urlparts = url.split('?');
        var prefix = urlparts[0];
        if (urlparts.length >= 2) {
            var query = urlparts[1];
            var paramPrefix = encodeURIComponent(parameter) + '=';
            var params= query.split(/[&;]/g);

            //reverse iteration as may be destructive
            for (var i = params.length; i-- > 0;) {
                //idiom for string.startsWith
                if (params[i].lastIndexOf(paramPrefix, 0) !== -1) {
                    params.splice(i, 1);
                }
            }

            url = prefix + (params.length > 0 ? '?' + params.join('&') : "");
            return url;
        } else {
            return url;
        }
    }
}

/* eslint-disable no-unused-vars */
// used in templates/account/notifications.html
function twitterOn() {
    if ($(".twitter").is(":checked")) {$("#twitterName").show();} else {$("#twitterName").hide();}
    $("input[type=radio]").click(function(){
        if ($(".twitter").is(":checked")) {$("#twitterName").show();} else {$("#twitterName").hide();}
    });
}
/* eslint-enable no-unused-vars */

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    if ($(elem).offset()) {
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((docViewTop < elemTop) && (docViewBottom > elemBottom));
    }
    return false;
}
$(window).scroll(function(){
  var scroller = $("#formScroll");
  if(isScrolledIntoView(scroller)){$("#scrollBtm").show();}else{$("#scrollBtm").hide();}
})

/* eslint-disable no-unused-vars */
// used in macros/Dashboard.html
function flickrBuild(){$(".flickrs").flickr({callback:colorboxCallback});}
/* eslint-enable no-unused-vars */

function colorboxCallback(){$('a.flickrpic').colorbox({photo:true,preloading:true,opacity:'0.70'});}


/* eslint-disable no-unused-vars */
// used below
var create_subject_carousel;
/* eslint-enable no-unused-vars */

$().ready(function() {
  create_subject_carousel = function(subject_name, type, options) {
    var ITEMS_PER_PAGE = 6;
    var apiurl = '/' + type + '/' + subject_name + '.json?has_fulltext=true';
    options = options || {};
    options.pagesize = ITEMS_PER_PAGE;
    options.readable = true;
    options.sort = options.sort || "";
    if (options.published_id) {
        apiurl += '&published_in=' + options.published_in;
    }
    $.ajax({
        dataType: "json",
        url: apiurl,
        type: "GET",
        contentType: "text/html",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Accept", "application/json");
        },
        success: function(data) {
            // TODO: Filter `data` by available
            var primed = false;
            // Subject is defined in openlibrary\plugins\openlibrary\js\subjects.js
            // eslint-disable-next-line no-undef
            var subject = new Subject(data, options);
            function fetchPageOfBooks(carousel) {
                primed = true;
                if (!subject.coverCarousel) {
                    subject.coverCarousel = carousel;
                    subject.coverCarousel.size(subject.getPageCount());
                }
                var index = carousel.first;
                subject.pos = (index - 1) * ITEMS_PER_PAGE;

                if (window.set_hash) {
                    var _p = (index == 1) ? null : index;
                    // set_hash is defined in:
                    //    openlibrary\openlibrary\templates\languages\view.html
                    //    openlibrary\openlibrary\templates\lib\covers.html
                    //    openlibrary\openlibrary\templates\subjects.html
                    // eslint-disable-next-line no-undef
                    set_hash({"page": _p});
                }

                if (carousel.has(index)) {
                    return;
                }

                subject.loadPage(index-1, function(data) {
                    var works = data.works;
                    $.each(works, function(widx, work) {
                        carousel.add(index + widx, subject.renderWork(work));
                    });
                    // updateBookAvailability is defined in openlibrary\plugins\openlibrary\js\availability.js
                    // eslint-disable-next-line no-undef
                    updateBookAvailability("#carousel-" + subject_name + " li ");
                });
            }
            $("#carousel-" + subject_name).jcarousel({
                scroll: ITEMS_PER_PAGE,
                itemLoadCallback: {onBeforeAnimation: fetchPageOfBooks}
            });
            if (!primed) {
                $("#carousel-" + subject_name).data('jcarousel').reload();
            }
        }
    });
  };
});

// BUILD CAROUSEL
/* eslint-disable no-unused-vars */
// used in templates/lib/covers.html
function carouselSetup(loadCovers, loadLists) {
  $('#coversCarousel').jcarousel({
    visible: 1,
    scroll: 1,
    itemLoadCallback: loadCovers
  });
// SET-UP COVERS LIST
  $('#listCarousel').jcarousel({
    vertical: true,
    visible: 6,
    scroll: 6,
    itemLoadCallback: loadLists
  });
// SWITCH RESULTS VIEW
  $("#resultsList").hide()
  $("a#booksList").click(function(){
    //page.listCarousel.scroll(1+page.pos);

    $('span.tools a').toggleClass('on');
    $('#resultsList').customFadeIn();
    $('#resultsCovers').hide();
  });
  $("a#booksCovers").click(function(){
    //page.coverCarousel.scroll(1+page.pos/12);

    $('span.tools a').toggleClass('on');
    $('#resultsList').hide();
    $('#resultsCovers').customFadeIn();
  });
// SWITCH EDITIONS VIEW
  $("#editionsList").hide()
  $("a#edsList").click(function(){
    $('span.tools a').toggleClass('on');
    $('#editionsList').customFadeIn();
    $('#editionsCovers').hide();
  });
  $("a#edsCovers").click(function(){
    $('span.tools a').toggleClass('on');
    $('#editionsList').hide();
    $('#editionsCovers').customFadeIn();
  });
}
/* eslint-enable no-unused-vars */

// BOOK COVERS
/* eslint-disable no-unused-vars */
// used in templates/work_search.html
function bookCovers(){
    $("img.cover").error(function(){
        $(this).closest(".SRPCover").hide();
        $(this).closest(".coverMagic").find(".SRPCoverBlank").show();
    });
}
/* eslint-enable no-unused-vars */

// CLOSE POP-UP FROM IFRAME
/* eslint-disable no-unused-vars */
// used in templates/covers/saved.html
function closePop(){
    $("#popClose").click(function(){
        parent.$.fn.colorbox.close();
    });
}
/* eslint-enable no-unused-vars */


function Place(key) {
    this.key = key;
    this.covers = {};
    this.bookCount = 0;
}


/**
 * Gets the covers using AJAX call and calls the callback with covers as argument.
 * AJAX call is avoided if the cover data is already present.
 */
Place.prototype.getCovers = function(pagenum, callback) {
    var offset = pagenum * 12;

    if (offset > this.bookCount)
        return [];

    if (this.covers[pagenum]) {
        callback(this.covers[pagenum]);
    }
    else {
        var page = this;
        $.getJSON(this.key + "/covers.json?limit=12&offset=" + offset, function(data) {
            page.covers[pagenum] = data;
            callback(data);
        });
    }
};

$().ready(function(){
    var cover_url = function(id) {
        return '//covers.openlibrary.org/b/id/' + id + '-S.jpg'
    };

    // Search mode
    var searchModes = ['everything', 'ebooks', 'printdisabled'];
    var searchModeDefault = 'ebooks';

    // Maps search facet label with value
    var defaultFacet = "all";
    var searchFacets = {
        'title': 'books',
        'author': 'authors',
        'lists': 'lists',
        'subject': 'subjects',
        'all': 'all',
        'advanced': 'advancedsearch',
        'text': 'inside'
    };

    var composeSearchUrl = function(q, json, limit) {
        var facet_value = searchFacets[localStorage.getItem("facet")];
        var url = ((facet_value === 'books' || facet_value === 'all')? '/search' : "/search/" + facet_value);
        if (json) {
            url += '.json';
        }
        url += '?q=' + q;
        if (limit) {
            url += '&limit=' + limit;
        }
        return url + '&mode=' + localStorage.getItem('mode');
    }

    var marshalBookSearchQuery = function(q) {
        if (q && q.indexOf(':') == -1 && q.indexOf('"') == -1) {
           q = 'title: "' + q + '"';
        }
        return q;
    }

    var renderInstantSearchResults = function(q) {
        var facet_value = searchFacets[localStorage.getItem("facet")];
        if (q === '') {
            return;
        }
        if (facet_value === 'books') {
            q = marshalBookSearchQuery(q);
        }

        var url = composeSearchUrl(q, true, 10);

        $('header#header-bar .search-component ul.search-results').empty()
        var facet = facet_value === 'all'? 'books' : facet_value;
        $.getJSON(url, function(data) {
            for (var d in data.docs) {
                renderInstantSearchResult[facet](data.docs[d]);
            }
        });
    }

    var setFacet = function(facet) {
        var facet_key = facet.toLowerCase();

        if (facet_key === 'advanced') {
            localStorage.setItem("facet", '');
            window.location.assign('/advancedsearch')
            return;
        }

        localStorage.setItem("facet", facet_key);
        $('header#header-bar .search-facet-selector select').val(facet_key)
        var text = $('header#header-bar .search-facet-selector select').find('option:selected').text()
        $('header#header-bar .search-facet-value').html(text);
        $('header#header-bar .search-component ul.search-results').empty()
        q = $('header#header-bar .search-component .search-bar-input input').val();
        var url = composeSearchUrl(q)
        $('.search-bar-input').attr("action", url);
        renderInstantSearchResults(q);
    }

    var setMode = function(form) {
        if (!$(form).length) {
            return;
        }

        $("input[value='Protected DAISY']").remove();
        $("input[name='has_fulltext']").remove();

        var url = $(form).attr('action');
        if (url) {
            url = Browser.removeURLParameter(url, 'm');
            url = Browser.removeURLParameter(url, 'has_fulltext');
            url = Browser.removeURLParameter(url, 'subject_facet');
        } else {
            // Don't set mode if no action.. it's too risky!
            // see https://github.com/internetarchive/openlibrary/issues/1569
            return;
        }

        if (localStorage.getItem('mode') !== 'everything') {
            $(form).append('<input type="hidden" name="m" value="edit"/>');
            url = url + (url.indexOf('?') > -1 ? '&' : '?')  + 'm=edit';
            $(form).append('<input type="hidden" name="has_fulltext" value="true"/>');
            url = url + (url.indexOf('?') > -1 ? '&' : '?')  + 'has_fulltext=true';
        } if (localStorage.getItem('mode') === 'printdisabled') {
            $(form).append('<input type="hidden" name="subject_facet" value="Protected DAISY"/>');
            url = url + (url.indexOf('?') > -1 ? '&' : '?')  + 'subject_facet=Protected DAISY';
        }
        $(form).attr('action', url);
    }

    var setSearchMode = function(mode) {
        var searchMode = mode || localStorage.getItem("mode");
        var isValidMode = searchModes.indexOf(searchMode) != -1;
        localStorage.setItem('mode', isValidMode?
                             searchMode : searchModeDefault);
        $('.instantsearch-mode').val(localStorage.getItem("mode"));
        $('input[name=mode][value=' + localStorage.getItem("mode") + ']')
            .attr('checked', 'true');
        setMode('.olform');
        setMode('.search-bar-input');
    }

    var options = Browser.getJsonFromUrl();

    if (!searchFacets[localStorage.getItem("facet")]) {
        localStorage.setItem("facet", defaultFacet)
    }
    setFacet(options.facet || localStorage.getItem("facet") || defaultFacet);
    setSearchMode(options.mode);

    if (options.q) {
        var q = options.q.replace(/\+/g, " ")
        if (localStorage.getItem("facet") === 'title' && q.indexOf('title:') != -1) {
            var parts = q.split('"');
            if (parts.length === 3) {
                q = parts[1];
            }
        }
        $('.search-bar-input [type=text]').val(q);
    }

    // updateWorkAvailability is defined in openlibrary\openlibrary\plugins\openlibrary\js\availability.js
    // eslint-disable-next-line no-undef
    updateWorkAvailability();

    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            }

            if (timeout) {
                clearTimeout(timeout);
            } else if (execAsap) {
                func.apply(obj, args);
            }
            timeout = setTimeout(delayed, threshold || 100);
        };
    };

    $('.trigger').live('submit', function(e) {
        e.preventDefault(e);
        toggleSearchbar();
        $('.search-bar-input [type=text]').focus();
    });

    var enteredSearchMinimized = false;
    var searchExpansionActivated = false;
    if ($(window).width() < 568) {
        if (!enteredSearchMinimized) {
            $('.search-bar-input').addClass('trigger')
        }
        enteredSearchMinimized = true;
    }
    $(window).resize(function(){
        if($(this).width() < 568){
            if (!enteredSearchMinimized) {
                $('.search-bar-input').addClass('trigger')
                $('header#header-bar .search-component ul.search-results').empty()
            }
            enteredSearchMinimized = true;
        } else {
            if (enteredSearchMinimized) {
                $('.search-bar-input').removeClass('trigger');
                var search_query = $('header#header-bar .search-component .search-bar-input input').val()
                if (search_query) {
                    renderInstantSearchResults(search_query);
                }
            }
            enteredSearchMinimized = false;
            searchExpansionActivated = false;
            $('header#header-bar .logo-component').removeClass('hidden');
            $('header#header-bar .search-component').removeClass('search-component-expand');
        }
    });

    var toggleSearchbar = function() {
        searchExpansionActivated = !searchExpansionActivated;
        if (searchExpansionActivated) {
            $('header#header-bar .logo-component').addClass('hidden');
            $('header#header-bar .search-component').addClass('search-component-expand');
            $('.search-bar-input').removeClass('trigger')
        } else {
            $('header#header-bar .logo-component').removeClass('hidden');
            $('header#header-bar .search-component').removeClass('search-component-expand');
            $('.search-bar-input').addClass('trigger')
        }
    }

    $('header#header-bar .search-facet-selector select').change(function(e) {
        var facet = $('header .search-facet-selector select').val();
        if (facet.toLowerCase() === 'advanced') {
            e.preventDefault(e);
        }
        setFacet(facet);
    })

    var renderInstantSearchResult = {
        books: function(work) {
            var author_name = work.author_name ? work.author_name[0] : '';
            $('header#header-bar .search-component ul.search-results').append(
                '<li class="instant-result"><a href="' + work.key + '"><img src="' + cover_url(work.cover_i) +
                    '"/><span class="book-desc"><div class="book-title">' +
                    work.title + '</div>by <span class="book-author">' +
                    author_name + '</span></span></a></li>'
            );
        },
        authors: function(author) {
            // Todo: default author img to: https://dev.openlibrary.org/images/icons/avatar_author-lg.png
            $('header#header-bar .search-component ul.search-results').append(
                '<li><a href="/authors/' + author.key + '"><img src="' + ("http://covers.openlibrary.org/a/olid/" + author.key + "-S.jpg") + '"/><span class="author-desc"><div class="author-name">' +
                    author.name + '</div></span></a></li>'
            );
        }
    }

    /* eslint-disable no-unused-vars */
    // e is a event object
    $('form.search-bar-input').submit(function(e) {
        q = $('header#header-bar .search-component .search-bar-input input').val();
        var facet_value = searchFacets[localStorage.getItem("facet")];
        if (facet_value === 'books') {
            $('header#header-bar .search-component .search-bar-input input[type=text]').val(marshalBookSearchQuery(q));
        }
        setMode('.search-bar-input');
    });
    /* eslint-enable no-unused-vars */


    $('.search-mode').change(function() {
        $('html,body').css('cursor', 'wait');
        setSearchMode($(this).val());
        if ($('.olform').length) {
            $('.olform').submit();
        } else {
            location.reload();
        }
    });

    $('.olform').submit(function() {
        if (localStorage.getItem('mode') !== 'everything') {
            $('.olform').append('<input type="hidden" name="has_fulltext" value="true"/>');
        } if (localStorage.getItem('mode') === 'printdisabled') {
            $('.olform').append('<input type="hidden" name="subject_facet" value="Protected DAISY"/>');
        }

    });

    $('li.instant-result a').live('click', function() {
        $('html,body').css('cursor', 'wait');
        $(this).css('cursor', 'wait');
    });

    /* eslint-disable no-unused-vars */
    // e is a event object
    $('header#header-bar .search-component .search-results li a').live('click', debounce(function(event) {
        $(document.body).css({'cursor' : 'wait'});
    }, 300, false));
    /* eslint-enable no-unused-vars */

    $('header#header-bar .search-component .search-bar-input input').keyup(debounce(function(e) {
        // ignore directional keys and enter for callback
        if (![13,37,38,39,40].includes(e.keyCode)){
            renderInstantSearchResults($(this).val());
        }
    }, 500, false));

    $(document).click(debounce(function(event) {
        if(!$(event.target).closest('header#header-bar .search-component').length) {
            $('header#header-bar .search-component ul.search-results').empty();
        }
        if(!$(event.target).closest('header#header-bar .navigation-component .browse-menu').length) {
            $('header#header-bar .navigation-component .browse-menu .browse-menu-options').hide();
        }
        if(!$(event.target).closest('header#header-bar .navigation-component .my-books-menu').length) {
            $('header#header-bar .navigation-component .my-books-menu .my-books-menu-options').hide();
        }
        if(!$(event.target).closest('header#header-bar .navigation-component .more-menu').length) {
            $('header#header-bar .navigation-component .more-menu .more-menu-options').hide();
        }
        if(!$(event.target).closest('header#header-bar .hamburger-component .hamburger-button').length) {
            $('header#header-bar .hamburger-dropdown-component').hide();
        }

        if(!$(event.target).closest('.dropclick').length) {
            $('.dropclick').parent().next('.dropdown').slideUp(25);
            $('.dropclick').next('.dropdown').slideUp(25);
            $('.dropclick').parent().find('.arrow').removeClass("up");
        }
    }, 100, false));

    $('header#header-bar .search-component .search-bar-input input').focus(debounce(function() {
        var val = $(this).val();
        renderInstantSearchResults(val);
    }, 300, false));

    /* Browse menu */
    $('header#header-bar .navigation-component .browse-menu').click(debounce(function() {
        $('header#header-bar .navigation-component .browse-menu-options').toggle();
    }, 300, false));

    /* My Books menu */
    $('header#header-bar .navigation-component .my-books-menu').click(debounce(function() {
        $('header#header-bar .navigation-component .my-books-menu-options').toggle();
    }, 300, false));

    /* More menu */
    $('header#header-bar .navigation-component .more-menu').click(debounce(function() {
        $('header#header-bar .navigation-component .more-menu-options').toggle();
    }, 300, false));

    /* Hamburger menu */
    $('header#header-bar .hamburger-component .hamburger-button').live('click', debounce(function() {
        $('header#header-bar .hamburger-dropdown-component').toggle();
    }, 300, false));

    $('textarea.markdown').focus(function(){
        $('.wmd-preview').show();
        if ($("#prevHead").length == 0) {
            $('.wmd-preview').before('<h3 id="prevHead" style="margin:15px 0 10px;padding:0;">Preview</h3>');
        }
    });
    $('.dropclick').live('click', debounce(function(){
        $(this).next('.dropdown').slideToggle(25);
        $(this).parent().next('.dropdown').slideToggle(25);
        $(this).parent().find('.arrow').toggleClass("up");
    }, 300, false));

    $('a.add-to-list').live('click', debounce(function(){
        $(this).closest('.dropdown').slideToggle(25);
        $(this).closest('.arrow').toggleClass("up");
    }, 300, false));

    function hideUser(){
        $('#main-account-dropdown').slideUp(25);
        $('header#header-bar .dropdown-avatar').removeClass('hover');
    }

    /* eslint-disable no-unused-vars */
    // offUser is used in the function itself
    $('header#header-bar .dropdown-avatar').click(debounce(function() {
        var dropdown = $('#main-account-dropdown');
        if (dropdown.is(':visible') === true) {
            hideUser();
        } else {
            dropdown.slideToggle(25);
            $(this).toggleClass('hover');
            var offUser = $(this);
            $(document).mouseup(function(offUser){
                if($(offUser.target).parent("a").length==0){
                    hideUser()
                }
            });

        }
    }, 100, false));
    /* eslint-enable no-unused-vars */

    /* eslint-disable no-unused-vars */
    // success function receives data on successful request
    $('.reading-log-lite select').change(function(e) {
        var self = this;
        var form = $(self).closest("form");
        var remove = $(self).children("option").filter(':selected').text().toLowerCase() === "remove";
        var url = $(form).attr('action');
        $.ajax({
            'url': url,
            'type': "POST",
            'data': {
                bookshelf_id: $(self).val()
            },
            'datatype': 'json',
            success: function(data) {
                if (remove) {
                    $(self).closest('.searchResultItem').remove();
                } else {
                    location.reload();
                }
            }
        });
        e.preventDefault();
    });
    /* eslint-enable no-unused-vars */

});
jQuery.fn.exists = function(){return jQuery(this).length>0;}
