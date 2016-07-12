$('document').ready(function(){

    var ip = window.ip;

    var make_ajax = function(url, data, headers, callback)
    {
        var reqObj = {};
        $.ajax({
            url : ip + url,
            type: "POST",
            data : JSON.stringify(data),
            headers : headers,
            success : function(data, textStatus, jqXHR)
            {
                callback(data);
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                alert(jqXHR.responseJSON.message);
            }
        });
    }

});
