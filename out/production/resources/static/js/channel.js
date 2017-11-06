$(function () {
    getIODevices();
    $("#btn-update").hide();
    $(document).on('keyup',"#outChannels",function () {
        var $self = $(this);
        var number = $self.val();
        var str = "<div style='width:50%;display: inline-block;float:left'>";
        for (var i = 0; i < number; i++) {
            var channelDesc = "";
            if (i == 7) {
                str += "</div><div style='width:50%;display: inline-block;float:right'>";
            }
            str += createOutputRowLine(i, channelDesc);
        }
        str += "</div>";
        $("#channel-bitMap").html(str);
    });
    loadIOConfig();
    $("#device-io").on('change', function () {
        loadIOConfig();
    });
});

function loadIOConfig() {
    var ioId = $("#device-io").val();
    $.ajax({
        url: '/device/channelDetail',
        data: {
            id: ioId
        },
        type: 'get',
        async: false,
        success: function (response) {
            var str = "<div style='width:50%;display: inline-block;float:left'>";
            var cnt = response.length;
            for (var i = 0; i < response.length; i++) {
                var channelDesc = response[i]['remark'];
                if (i == 7) {
                    str += "</div><div style='width:50%;display: inline-block;float:right'>";
                }
                str += createOutputRowLine(i, channelDesc);
            }
            str += "</div>";
            $("#channel-bitMap").html(str);
            $("#outChannels").val(cnt);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}
function updateDetails() {
    var arr = [];
    var client = $("#device-io").val();
    $('.remark-input').each(function (index, element) {
        var $element = $(element);
        var id = $element.attr("id").replace("bit", "");
        var val = $element.val();
        var defaultVal = $element.attr("default");
        if (val != defaultVal) {
            arr.push({"index": id, "remark": val, "clientid": client});
        }
    });
    $.ajax({
        url: '/device/iochannelsave',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(arr),
        success: function (response) {
            alert("更新成功");
            getIODeviceDetails();
        }
    });
}

function getIODevices() {
    $.ajax({
        url: '/device/io',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            var str = "";
            for (var i = 0; i < response.length; i++) {
                var clientId = response[i];
                str += "<option value='" + clientId + "'>" + clientId + "</option>";
            }
            $("#device-io").html(str);
        }
    });
}

function configIODeviceDetails() {
    var number = $("#outChannels").val();
    var client = $("#device-io").val();
    if (number == "" || parseInt(number) < 1 || parseInt(number) > 14) {
        alert("输出通道数1—14之间");
        return;
    }
    var arr = [];
    $('.remark-input').each(function (index, element) {
        var $element = $(element);
        var id = $element.attr("id").replace("channel", "");
        var val = $element.val();
        var defaultVal = $element.attr("default");
        if (val != defaultVal) {
            arr.push({"index": id, "remark": val, "clientid": client});
        }
    });
    $.ajax({
        url: '/device/iosave',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(arr),
        success: function (response) {
            alert("操作成功");
        }
    });
}

function getIODeviceDetails() {
    var client = $("#device-io").val();
    $.ajax({
        url: '/device/channelDetail',
        data: {
            id: client
        },
        type: 'get',
        async: false,
        success: function (response) {
            var str = "<div style='width:50%;display: inline-block;float:left'>";
            for (var i = 0; i < response.length; i++) {
                var channelDesc = response[i];
                if (i == 7) {
                    str += "</div><div style='width:50%;display: inline-block;float:right'>";
                }
                str += createRowLine(i, channelDesc);
            }
            str += "</div>";
            $("#channel-bitMap").html(str);
            $("#btn-update").show();
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function createRowLine(index, channelDesc) {
    var str = "<div class='row-control'><label class='control-label label-fixedWidth'>" + index + "</label>";
    var bitData = channelDesc['output'];
    if (bitData == 1) {
        var val = channelDesc['remark'];
        var displayVal = displayRemark(val);
        str += "<input class=\"select-control remark-input\" id=\"bit" + index + "\" value=\"" + displayVal + "\" default=\"" + displayVal + "\"/>";
    }
    str += "</div>";
    return str;
}

function createOutputRowLine(index, channelDesc) {
    var channelId = index + 1;
    var str = "<div class='row-control'><label class='control-label label-fixedWidth'>" + channelId + "</label>";
    var displayVal = channelDesc;
    str += "<input class=\"select-control remark-input\" id=\"channel" + channelId + "\" value=\"" + displayVal + "\" default=\"" + displayVal + "\"/>";
    str += "</div>";
    return str;
}

function displayRemark(rawMsg) {
    var str = '';
    if (rawMsg) {
        str = rawMsg;
    }
    return str;
}