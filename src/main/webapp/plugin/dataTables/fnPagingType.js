jQuery.fn.DataTable.ext.pager.custom_simple_numbers = function (page, pages) {
    var numbers = [];
    var buttons = jQuery.fn.DataTable.ext.pager.numbers_length;
    var half = Math.floor(buttons / 2);
    
    if(pages >= (10000 / 25)) {
        pages = (10000 / 25);
    }

    var _range = function (len, start) {
        var end;

        if (typeof start === "undefined") {
            start = 0;
            end = len;

        } else {
            end = start;
            start = len;
        }

        var out = [];
        for (var i = start; i < end; i++) {
            out.push(i);
        }

        return out;
    };


    if (pages <= buttons) {
        numbers = _range(0, pages);
        
    } else if (page <= half) {
        numbers = _range(0, buttons);

    } else if (page >= pages - 1 - half) {
        numbers = _range(pages - buttons, pages);

    } else {
        numbers = _range(page - half, page + half + 1);
    }

    numbers.DT_el = 'span';
    if (page >= (10000 / 25)) {
        return ['first', 'previous', 'next'];
    } else {
        return ['first', 'previous', numbers, 'next'];
    }
};