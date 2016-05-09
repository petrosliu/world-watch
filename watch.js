var viewstatus = "SHOW";

$(document).ready(function() {
    if (localStorage.getItem("in.liuyid.watch.loctz") == null) {
        localStorage.setItem("in.liuyid.watch.loctz", "BEIJING:-480;SAN FRANCISCO:420;NEW YORK:240");
    }
    loctz = localStorage.getItem("in.liuyid.watch.loctz").split(';');
    localStorage.removeItem("in.liuyid.watch.loctz");
    var updateloctz = [];
    var wapper = '<tbody><tr><td><div class="cell" value="CURRENT"></div></td>';
    for (var i = 0; i < loctz.length; i++) {
        var lt = loctz[i].split(':');
        if (lt.length == 2) {
            loc = lt[0].toUpperCase();
            tz = parseInt(lt[1], 10);
            if (tz != NaN) {
                tz = Math.floor(tz);
                updateloctz.push(loc + ':' + tz);
                wapper += '<td><div class="cell" value="' + loc + ':' + tz + '"></div></td>';
            }
        }
    }
    wapper += '</tr></tbody>';
    $('#loctz')[0].innerHTML = wapper;
    localStorage.setItem("in.liuyid.watch.loctz", updateloctz.join(';'));
    if (-1 != window.location.href.indexOf("?")) {
        var newwatch = addWatch(window.location.href);
        if (newwatch != null) updateloctz.push(newwatch);
        localStorage.setItem("in.liuyid.watch.loctz", updateloctz.join(';'));
        window.location = window.location.href.substring(0, window.location.href.indexOf("?"));
        return;
    }
    watchize($('.cell'));
    //setInterval(function(){watchize($('.cell'));},1000);
});

function convertIcon(i) {
    switch (i) {
        case 0:
            return 'fa-moon-o';
        case 7:
            return 'fa-coffee';
        case 12:
            return 'fa-sun-o';
        case 20:
            return 'fa-television';
        default:
            return i.toString();
    }
}

function hourwrapper(n, left, center, right) {
    if (left.startsWith('fa-')) left = '<i class="fa fa-fw ' + left + '" aria-hidden="true"></i>';
    if (center.startsWith('fa-')) center = '<i class="fa fa-fw ' + center + '" aria-hidden="true"></i>';
    if (right.startsWith('fa-')) right = '<i class="fa fa-fw ' + right + '" aria-hidden="true"></i>';
    return '<div class="' + n + '"><p class="alignleft">' + left + '</p><p class="aligncenter">' + center + '</p><p class="alignright">' + right + '</p></div>';
}

function watchwrapper(cell, utcmin, loc, tz) {
    var tztext = '';
    if (tz < 0) tztext += '+';
    tztext += Math.floor(Math.abs(tz) / 60) + ':';
    if (Math.abs(tz) % 60 < 10) tztext += '0';
    tztext += (Math.abs(tz) % 60);
    var time = (utcmin - tz + 1440) % 1440;
    var hr = Math.floor(time / 60);
    var min = time % 60;
    var timetext = '';
    timetext += hr % 12 + ':';
    if (min < 10) timetext += '0';
    timetext += min + ' ';
    if (hr >= 0 && hr < 12) timetext += 'AM';
    else timetext += 'PM';

    var starthour = (hr - 2 + 24) % 24;
    var wapper = '';
    var visible = (viewstatus == "EDIT") ? 'visible' : 'hidden';
    if (loc == 'CURRENT') wapper += '<div class="hour hr' + starthour + '"><p class="alignleft"></p><p class="aligncenter"><i class="fa fa-location-arrow fa-fw" aria-hidden="true"></i></p><p class="alignright"></p></div>';
    else wapper += '<div class="hour hr' + starthour + '"><p class="alignleft" onclick="deleteWatch(\'' + loc + ':' + tz + '\')">&ensp;<i class="fa fa-fw fa-times-circle fa-lg" aria-hidden="true" style="visibility:' + visible + ';"></i></p><p class="aligncenter">' + loc + '</p><p class="alignright"></p></div>';
    for (var i = starthour; i < starthour + 24; i++) {
        if (i % 24 == hr) wapper += hourwrapper('hour hr' + i % 24, '&ensp;' + timetext, convertIcon(i % 24), tztext + '&ensp;');
        else wapper += hourwrapper('hour hr' + i % 24, 'fa-angle-right', convertIcon(i % 24), 'fa-angle-left');
    }
    return wapper;
}

function watchize(cells) {
    var current = new Date();
    var utcmin = (current.getHours() * 60 + current.getMinutes() + current.getTimezoneOffset() + 1440) % 1440;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var loc = 'ERR';
        var tz = 0;
        v = cell.getAttribute('value');
        if (v != null) {
            v = v.split(':');
            if (v.length == 1 && v[0] == 'CURRENT') {
                loc = 'CURRENT';
                tz = current.getTimezoneOffset();
                cell.innerHTML = watchwrapper(cell, utcmin, loc, tz);
            } else if (v.length == 2) {
                loc = v[0];
                tz = (+v[1]);
                cell.innerHTML = watchwrapper(cell, utcmin, loc, tz, viewstatus);
            }
            cell.style.width = (Math.floor(100 / cells.length) + 1) + 'vw';
        }

    }

};

function showtimes(param) {
    $('.fa-times-circle').css('visibility', 'visible');
    param.innerHTML = "&ensp;Done";
    param.setAttribute('onclick', 'hidetimes(this)');
    viewstatus = "EDIT";
}

function hidetimes(param) {
    $('.fa-times-circle').css('visibility', 'hidden');
    param.innerHTML = "&ensp;Edit";
    param.setAttribute('onclick', 'showtimes(this)');
    viewstatus = "SHOW";
}

function hideform() {
    $('#formnav').css('visibility', 'hidden');
}

function showform() {
    $('#formnav').css('visibility', 'visible');
}

function addWatch(url) {
    if (-1 != window.location.href.indexOf("?")) {
        var info = decodeURIComponent(window.location.href.substring(window.location.href.indexOf("?") + 1)).split('&');
        if (info.length == 2) {
            var loc = info[0].split('=');
            var tz = info[1].split('=');
            if (loc.length == 2 && tz.length == 2) {
                var timezone = tz[1].split(':');
                if (timezone.length == 2) {
                    var hr = +timezone[0];
                    var min = +timezone[1];
                    if (hr <= 12 && hr >= -12 && min >= 0 && min < 60) {
                        var n = -1 * Math.sign(hr) * (Math.abs(hr) * 60 + min);
                        return loc[1].toUpperCase() + ':' + n;
                    }
                }
            }
        }
    }
    return null;
}

function deleteWatch(param) {
    loctz = localStorage.getItem("in.liuyid.watch.loctz").split(';');
    var updateloctz = [];
    for (var i = 0; i < loctz.length; i++) {
        if (param != loctz[i]) updateloctz.push(loctz[i]);
    }
    localStorage.setItem("in.liuyid.watch.loctz", updateloctz.join(';'));
    window.location = window.location.href;
}