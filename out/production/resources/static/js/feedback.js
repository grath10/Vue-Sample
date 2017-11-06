var client = mqtt.connect('ws://192.168.0.234:3000');
// 仅供本地调试使用
// var client = mqtt.connect('ws://localhost:3000');
var Buffer = buffer["Buffer"];
client.on('connect', function () {
    client.subscribe('X/+', {qos: 1});
});
client.on("error", function (error) {
    console.log(error);
});
client.on("message", function (topic, payload) {
    // console.log("主题:" + topic + ",消息:" + payload.toString());
});

$(function () {
    $.ajax({
        url: '/device/io',
        data: null,
        type: 'get',
        async: false,
        success: function (response) {
            var str = "";
            for (var i = 0; i < response.length; i++) {
                var board = response[i];
                str += "<option value='" + board + "'>" + board + "</option>";
            }
            $("#clientid").html(str);
            adjustComment();
        },
        error: function () {
            console.log('查询失败');
        }
    });
    $("#clientid").on('change', adjustComment);
    $("#submitControl").click(commitFeedback);
});

// 根据通道数自动构建位分布图
function drawBitPic(channel, response) {
    var bitChannel = channel.toString(2);
    var bit16Channel = ("0000000000000000" + bitChannel).slice(-16);
    var str = "<div style='width: 50%; float: left;' id='lowChannel'>";
    for (var i = 15; i > 1; i--) {
        if (i == 8) {
            str += "</div><div style='width: 50%; float: right;' id='highChannel'>";
        }
        str += createRowLine(15 - i, bit16Channel[i], response[15 - i]);
    }
    str += "</div>";
    $("#channelDetail").html(str);
    initializeState(true);
}

function drawOutputChannel(response) {
    var str = "<div style='width: 50%; float: left;' id='lowChannel'>";
    for (var i = 0; i < response.length; i++) {
        if (i == 7) {
            str += "</div><div style='width: 50%; float: right;' id='highChannel'>";
        }
        str += createRowOutChannelLine(i, 0, response[i]);
    }
    str += "</div>";
    $("#channelDetail").html(str);
    initializeState(true);
}
function createRowOutChannelLine(index, bitData, channelEntity) {
    var str = "<div class='row-control'><label class='control-label label-fixedWidth'>" + (index + 1) + "</label>";
    if (bitData == 0) {
        var remark = channelEntity['remark'];
        str += "<input class=\"select-control\" id=\"bit" + index + "\" value='" + displayRemark(remark) + "' disabled='disabled'/> \
            <div class='switch inline' style='padding-left: 0;margin-left: 4px'> \
                <input type=\"checkbox\" class='control' id=\"control" + index + "\"/>\
            </div>";
    }
    str += "</div>";
    return str;
}
function createRowLine(index, bitData, channelEntity) {
    var str = "<div class='row-control'><label class='control-label label-fixedWidth'>" + index + "</label>";
    if (bitData == 0) {
        var remark = channelEntity['remark'];
        str += "<input class=\"select-control\" id=\"bit" + index + "\" value='" + displayRemark(remark) + "' disabled='disabled'/> \
            <div class='switch inline' style='padding-left: 0;margin-left: 4px'> \
                <input type=\"checkbox\" class='control' id=\"control" + index + "\"/>\
            </div>";
    }
    str += "</div>";
    return str;
}

function displayRemark(rawMsg) {
    return rawMsg || "";
}

// 获取通道当前状态
function getStateFromDB() {
    var clientid = $("#clientid").val();
    $.ajax({
        url: '/app/currentState',
        data: {
            "clientid": clientid
        },
        type: 'get',
        async: false,
        success: function (response) {
            initializeState(true);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

// 修改状态
function initializeState(state) {
    $('.control').each(function (index, element) {
        $(element).bootstrapSwitch({
            onColor: 'success',
            offColor: 'danger',
            state: state,
            onSwitchChange: function (event, state) {
            }
        });
    });
}

function adjustComment() {
    var clientid = $("#clientid").val();
    $.ajax({
        url: '/device/comment',
        data: {
            "clientid": clientid
        },
        type: 'get',
        async: false,
        success: function (response) {
            var comment = response.comment;
            var channel = response.channel;
            $("#comment").val(comment);
            // $("#channel").val(channel);
            // getStateFromDB();
            // getIOBitDesc(channel);
            getOutputDesc();
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function getOutputDesc() {
    var clientId = $("#clientid").val();
    $.ajax({
        url: '/device/channelDetail',
        data: {
            id: clientId
        },
        type: 'get',
        async: false,
        success: function (response) {
            drawOutputChannel(response);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function getIOBitDesc(channel) {
    var clientId = $("#clientid").val();
    $.ajax({
        url: '/device/channelDetail',
        data: {
            id: clientId
        },
        type: 'get',
        async: false,
        success: function (response) {
            drawBitPic(channel, response);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

// 按位发送控制数据
function commitFeedback() {
    var clientid = $("#clientid").val();
    // var data = calculateControlData();
    var channels = $(".control").length;
    var channel = channels.toString(16);
    // console.log(channel);
    for(var i=0;i<channels;i++) {
        var buffer = Buffer.alloc(4 * 2 + 4 + 4);
        setBufferBytes(buffer, "6", 0, 4);
        setBufferHexBytes(buffer, clientid, 4, 8);
        var index = (i + 1).toString(16);
        setBufferHexBytes(buffer, index, 12, 2);
        var element = $('.control')[i];
        var val = $(element).bootstrapSwitch('state');
        var data = val == true ? "1" : "0";
        setBufferHexBytes(buffer, data, 14, 2);
        client.publish("A/CN", buffer, {qos: 1});
    }
}

// 获取控制数据
function calculateControlData() {
    var arr = new Array(14);
    arr.fill(0);
    $('.control').each(function (index, element) {
        var val = $(element).bootstrapSwitch('state');
        var id = $(element).attr("id").replace("control", "");
        arr[id] = val == true ? 1 : 0;
    });
    return parseInt(arr.reverse().join(""),2).toString(16);
}

function setBufferBytes(buffer, content, start, size) {
    var len = content.length;
    for (var i = start; i < start + size; i++) {
        var turn = i - start;
        if (content[len - 1 - turn]) {
            // content[len - 1 - turn]值为"a"，"a"-'0' === NaN  有缺陷
            buffer[start + size - turn - 1] = content[len - 1 - turn] - '0';
        }
    }
}
// content类型为字符串
// 数值型.length不符合要求
function setBufferHexBytes(buffer, content, start, size) {
    var len = content.length;
    for (var i = start; i < start + size; i++) {
        var turn = i - start;
        if (content[len - 1 - turn]) {
            buffer[start + size - turn - 1] = parseInt(content[len - 1 - turn], 16);
        }
    }
}

function setTextBytes(buffer, content, start) {
    buffer[start] = content.charCodeAt(0);
}

function setDigitBytes(buffer, content, start) {
    buffer[start] = parseInt(content, 16);
}

function setVal(value, buffer, start, length) {
    var cmpLen = value.length;
    // console.log("写入字符串长度:", cmpLen);
    for (var i = start; i < start + length; i++) {
        // 表示轮次数
        var turn = i - start;
        if (value[cmpLen - 1 - turn]) {
            // console.log("写入buffer编号:", start - turn - 1 + length);
            buffer[start - turn - 1 + length] = parseInt(value[cmpLen - 1 - turn], 16);
        }
    }
}