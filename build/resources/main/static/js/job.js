$(function () {
    $("#job-confirm").click(createNewJob);
});

function createNewJob() {
    var jobName = $("#task-name").val(),
        content = $("#task-content").val(),
        trigger = $("#task-trigger").val();
    if(jobName == "" || content == "" || trigger == ""){
        alert("所填内容不能为空");
    }
    $.ajax({
        url: '/job/add',
        data: {
            "jobName": jobName,
            "content": content,
            "expression": trigger
        },
        type: 'post',
        async: false,
        success: function (response) {

        },
        error: function () {
            console.log('创建任务失败');
        }
    });
}

function getVersion(payload) {
    var info = payload.slice(2 * 2 + 11 * 2);
    console.log("版本:", info);
    var arr = [];
    for (var i = 0; i < info.length; i++) {
        var code;
        if(info[i] >=0 && info[i] <= 15){
            code = info[i].toString(16);
        }else {
            code = String.fromCharCode(info[i]);
        }
        arr.push(code);
    }
    return arr.join("");
}

function dispatchMessages() {
    var msg = $("#content").val();
    var length = calculateLength(msg);
    var lenHex = (length).toString(16);
    var buf = bufferObj.alloc(4);
    setBufferHexBytes(buf, lenHex, 0, 4);
    // 换行符特殊处理
    msg = msg.replace(/[\n\r]/g, "");
    var encodedText = $URL.encode(msg);
    // GBK编码后得到字符中包含%,需要特殊处理
    encodedText = encodedText.replace(/%/g, "");
    var buf1 = bufferObj.from(encodedText);
    buf1 = formatGBKData(buf1);
    var content = bufferObj.concat([buf, buf1]);
    client.publish("A/BC", content, {qos: 1});
}

// 对数字进行处理获取其ASCII码值
function formatGBKData(buffer) {
    var len = buffer.length;
    var buf = bufferObj.alloc(len);
    for (var k = 0; k < len; k++) {
        var char = String.fromCharCode(buffer[k]);
        buf[k] = parseInt(char, 16);
    }
    return buf;
}

function formatRegularData(buf) {
    var len = buf.length;
    var bufTmp = bufferObj.alloc(len * 2);
    for (var i = 0; i < len; i++) {
        var twoDigits = buf[i].toString(16).toUpperCase();
        var firstDigit = twoDigits[0];
        var secondDigit = twoDigits[1];
        setDigitBytes(bufTmp, firstDigit, 2 * i);
        setDigitBytes(bufTmp, secondDigit, 2 * i + 1);
    }
    return bufTmp;
}

function formatData(buf) {
    var len = buf.length;
    var bufTmp = bufferObj.alloc(len * 2);
    for (var i = 0; i < len; i++) {
        var twoDigits = buf[i].toString(16).toUpperCase();
        var firstDigit = twoDigits[0];
        var secondDigit = twoDigits[1];
        setTextBytes(bufTmp, firstDigit, 2 * i);
        setTextBytes(bufTmp, secondDigit, 2 * i + 1);
    }
    return bufTmp;
}

function changeBigEndian(buffer) {
    for (var j = 0; j < buffer.length; j += 2) {
        var tmp = buffer[j];
        buffer[j] = buffer[j + 1];
        buffer[j + 1] = tmp;
    }
}

function calculateLength(msg) {
    var len = 0;
    var size = msg.length;
    for (var i = 0; i < size; i++) {
        // 中文字符
        if (msg.charCodeAt(i) > 255) {
            len += 2;
        } else if (msg.charCodeAt(i) != 10) {
            len++;
        }
    }
    return len;
}

/*function commitFeedback() {
    var clientid = $("#clientid").val();
    var data = $("#control").val();
    var buffer = bufferObj.alloc(2);
    buffer.writeInt16BE(6);
    var clientBuf = bufferObj.from(clientid, 'hex');
    var dataBuf = bufferObj.from(data, 'hex');
    buffer = bufferObj.concat([buffer, clientBuf, dataBuf]);
    client.publish("A/CN", buffer,{qos: 1});
    $("#controlPanel").modal('hide');
}*/

function commitFeedback() {
    var clientid = $("#clientid").val();
    // 获取控制数据，待联调测试
    var data = $("#control").val();
    var buffer = bufferObj.alloc(4 * 2 + 4 + 4);
    setBufferBytes(buffer, "6", 0, 4);
    setBufferBytes(buffer, clientid, 4, 8);
    setBufferBytes(buffer, data, 12, 4);
    client.publish("A/CN", buffer, {qos: 1});
    $("#controlPanel").modal('hide');
}

function queryVersion() {
    var buffer = bufferObj.from(['5', '0'], 'hex');
    client.publish("A/PA", buffer, {qos: 1});
}

function setBufferBytes(buffer, content, start, size) {
    var len = content.length;
    for (var i = start; i < start + size; i++) {
        var turn = i - start;
        if (content[len - 1 - turn]) {
            // content[len - 1 - turn]值为"a"，"a"-'0' === NaN
            buffer[start + size - turn - 1] = content[len - 1 - turn] - '0';
        }
    }
}

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

function dispatchParameters() {
    var clientId = $("#clientid-select").val();
    getSensorParameters(clientId, function (rows) {
        var fields = ["name", "highthreshold", "lowthreshold", "delta", "normalsample", "abnormalsample"];
        var fieldSize = fields.length;
        // 数据类型为对象
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var buffer = bufferObj.alloc(2 * 6 * 2 + 2);
            var totalBytes = 11 * 2;
            var hexStr = totalBytes.toString(16);
            setVal(hexStr, buffer, 0, 4);
            // console.log("查询字段个数:", fields.length);
            for (var i = 0; i < fieldSize; i++) {
                var field = fields[i];
                var val = row[field];
                var fieldHex = val.toString(16);
                // console.log("参数数值:", val);
                if (i == 0) {
                    setVal(fieldHex, buffer, 4, 2);
                } else {
                    setVal(fieldHex, buffer, 2 + 4 * i, 4);
                }
            }
            client.publish('A/PM', buffer);
        }
    });
    $("#parameterPanel").modal('hide');
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

function getSensorParameters(clientId, cb) {
    $.ajax({
        url: '/parameter/module',
        data: {
            "clientid": clientId
        },
        type: 'get',
        async: false,
        success: function (response) {
            cb(response);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}
