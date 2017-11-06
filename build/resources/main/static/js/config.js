/*
    09-04修改内容：
        原有模块与协议关系采用硬编码方式，替换为从数据库中读取
 */
var relation = {};
var checkstate = {};
$(function () {
    $("#module1").html("<label class='fixed-text control-label'>模块类型:</label>" + getModuleSelect(0));
    $("#protocol1").html("<label class='fixed-text control-label'>协议类型:</label>" + getProtocol(0));
    limitRelation(1);
    $(document).on('change', ".module select", function () {
        var parent = $(this).parent();
        var id = parent.attr("id").replace('module', '');
        var name = $(this).val();
        $("#protocolselect" + id).val(relation[name]);
        if (name == 'WATERMETER' || name == 'AMMETER') {
            $("#channel" + id).hide();
        } else {
            $("#channel" + id).show();
        }
        pickOutputControl(id, true);
    });
    // 监听IO模块地址输入变化(直接影响反向控制选择)
    $(document).on('blur', "input[name='address']", function () {
        var $self = $(this);
        // 获取模块编号
        var id = $self.attr("id").replace("address", "");
        var name = $("#select" + id).val();
        if (name == 'IO') {
            pickOutputControl(id, false, true);
        }
    });
});

function saveConfig() {
    var clientId = $("#clientid").val();
    var $cfg = $("fieldset");
    var cnt = $cfg.length;
    var paramsArr = [];
    var str = checkClientValid(clientId);
    if (str != "") {
        alert(str);
        return;
    }
    for (var i = 0; i < cnt; i++) {
        var $onecfg = $cfg[i];
        var $select = $("select", $onecfg);
        var cfgName = $select[0].value;
        var protocol = $select[1].value;
        var $input = $("input", $onecfg);
        var number = $input[0].value;
        var address = $input[1].value;
        if (checkstate[cfgName]) {
            alert("请选择其他类型的模块");
            checkstate = {};
            return;
        }
        checkstate[cfgName] = true;
        if (number == "" || address == "") {
            alert("请输入数值");
            checkstate = {};
            return;
        }
        var channel = $input[2] && $($input[2]).val();
        var output = "";
        if ($input[3] && $($input[3]).attr("id")) {
            output = $input[3].value;
        } else {
            var $output_select = $("select[name='feedback']", $onecfg);
            var outputArr = $($output_select).val();
            if (outputArr) {
                output = outputArr.join(",");
            }
        }
        var realNumber = address.split(",").length;
        if (parseInt(number) != realNumber) {
            alert("对应模块数与模块地址个数不一致！");
            checkstate = {};
            return;
        }
        var paramObj = {
            "name": cfgName,
            "protocol": protocol,
            "number": number,
            "address": address,
            "channel": channel,
            "output": output
        };
        paramsArr.push(paramObj);
    }
    var obj = {
        "clientid": clientId,
        "items": paramsArr
    };
    // 输入数据有效性校验
    str = checkValueValid(paramsArr);
    if (str == "") {
        $.ajax({
            url: '/config/save',
            method: 'post',
            contentType: "application/json",
            data: JSON.stringify(obj),
            success: function (response) {
                switch (response) {
                    case "002":
                        alert("编号已存在");
                        break;
                    case "1":
                        alert("保存成功");
                        document.getElementById("downloadLink").click();
                        break;
                    default:
                        alert("保存失败");
                        break;
                }
            }
        });
    } else {
        alert(str);
    }
    checkstate = {};
}

function checkClientValid(clientId) {
    var str = "";
    // 针对客户端编码进行校验
    if (!/^C\d{2}[1-9A-Ca-c][0-9A-Fa-f]{4}$/.test(clientId.trim())) {
        str = "请输入符合规范的客户端编码(长度为8位)，C+两位年号+一位十六进制表示的月份+四位流水号";
    }
    return str;
}

// 校验输入参数有效性
function checkValueValid(paramsArr) {
    var str = "";
    var addressArr = [];
    var params = paramsArr.length;
    for (var i = 0; i < params; i++) {
        var obj = paramsArr[i];
        var name = obj['name'];
        var channel = obj['channel'];
        var addr = obj['address'];
        var cnt = addr.split(",").length;
        str = isValidChannel(name, channel, cnt);
        if (str != "") {
            return str;
        }
        addressArr.push(addr);
    }
    var address = addressArr.join(",").split(",");
    // str = isRepeated(address);
    return str;
}

// 判断是否存在重复值
function isRepeated(arr) {
    var str = "";
    var hash = {};
    for (var i in arr) {
        if (hash[arr[i]]) {
            str = "地址:" + arr[i] + "  数值重复，请重新输入";
            break;
        }
        hash[arr[i]] = true;
    }
    return str;
}

// // 判断通道数是否合法
// /*
//     INPUT/OUTPUT 在0~65535之间
//  */
// function isValidChannel(name, channel, addr) {
//     var str = "";
//     // 输入量与输出量
//     if (name == 'ADC' || name == 'IO') {
//         var channelArr = channel.split(",");
//         var addrArr = addr.split(",");
//         // 判断通道数内是否存在重复的情况
//         str = isRepeat(channelArr);
//         if (str == "") {
//             for (var i in channelArr) {
//                 if (/[0-9A-Fa-f]+/.test(channelArr[i]) && 0 <= parseInt(channelArr[i], 16) <= 65535) {
//
//                 } else {
//                     str = "数值应当在0~65535之间";
//                     break;
//                 }
//             }
//         }
//         if (channelArr.length != addrArr.length) {
//             str = "输入通道数与地址数数量不一致";
//         }
//     } else if (name == 'WATERMETER' || name == 'AMMETER') {
//
//     } else {
//         if (0 <= channel <= 15) {
//
//         } else {
//             str = "通道数有效值应该在0~15之间";
//         }
//     }
//     return str;
// }

// 判断通道数是否合法
/*
    INPUT  0~12
    OUTPUT 1~14
    根据最新硬件实现方案，输入输出通道默认从低到高取N个，从1开始
 */
function isValidChannel(name, channelStr, cnt) {
    var str = "";
    if (!isExcluded(name)) {
        var channelArr = channelStr.split(",");
        var channels = channelArr.length;
        if (name == 'IO') {
            if (channels != cnt) {
                str = "IO模块通道数与地址数应该一致";
            } else {
                for (var i in channelArr) {
                    if (0 <= channelArr[i] && channelArr[i] <= 12) {

                    } else {
                        str = "IO模块通道数有效值应该在0~12之间";
                        break;
                    }
                }
            }
        } else {
            if (channels > 1) {
                str = "通道数唯一";
            } else {
                if (0 <= channelStr && channelStr <= 15) {

                } else {
                    str = "通道数有效值应该在0~15之间";
                }
            }
        }
    }
    return str;
}

// 是否需要对通道数进行规则校验
function isExcluded(name) {
    var arr = ['WATERMETER', 'AMMETER'];
    if (arr.indexOf(name) == -1) {
        return false;
    } else {
        return true;
    }
}

String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

function getTotal() {
    var total = 0;
    $.ajax({
        url: '/config/module/total',
        method: 'get',
        async: false,
        success: function (data) {
            total = data;
        }
    });
    return total;
}

// 新增模块
function addModule() {
    var currentNum = $("fieldset").length;
    var protocolStr = getProtocol(currentNum);
    var moduleStr = getModuleSelector(currentNum);
    if (currentNum == getTotal()) {
        return;
    }
    var newNum = currentNum + 1;
    var html = "<fieldset class=\"box form-horizontal\" id=\"panel" + newNum + "\"> \
                    <div class='module form-line' id=\"module" + newNum + "\" class='module'> \
                <label class='fixed-text control-label'>模块类型:</label>"
        + moduleStr + "</div> \
            <div class='protocol form-line'> \
            <label class='fixed-text control-label'>协议类型:</label>"
        + protocolStr + "</div><div class='form-line'> \
                <label class='fixed-text control-label'>对应模块数:</label> \
                <input class=\"form-inline-control\" name=\"number\" id='block" + newNum + "'/> \
            </div> \
            <div class='form-line'> \
                <label class='fixed-text control-label'>模块地址:</label> \
                <input class=\"form-inline-control\" name=\"address\" id='address" + newNum + "' placeholder=\"十进制数，以逗号分开\"/> \
            </div> \
            <div class='form-line' id='channel" + newNum + "'> \
                <label class='fixed-text control-label'>对应模块通道:</label> \
                <input class=\"form-inline-control\" name=\"channel\" id='channelInput" + newNum + "'/> \
            </div>\
            <div class='form-line' id='output" + newNum + "'> \
                <label class='fixed-text control-label'>反向控制:</label> \
                <input class=\"form-inline-control\" name=\"feedback\" id='backcontrol" + newNum + "'/> \
            </div> \
            </fieldset>";
    $("#panel" + currentNum).after(html);
    pickOutputControl(currentNum, true);
    limitRelation(newNum);
}

function pickOutputControl(id, flag, isEffected) {
    // 获取IO模块对应的地址列表
    var $select = $(".module-keyword");
    var idx = -1;
    $select.each(function (index, element) {
        var val = $(element).val();
        if (val == 'IO') {
            idx = index;
        }
    });
    var name = $("#select" + id).val();
    if (name == 'IO') {
        var ioNum = $("#backcontrol" + id).length;
        if (ioNum == 0) {
            $("select[name='feedback']", "#output" + id).replaceWith("<input class='form-inline-control' name='feedback' " + "id='backcontrol" + ioNum + "'/>");
        }
    }
    if (idx == -1) {
        // 当前页面中不存在IO模块，则应该将页面中所有反向控制恢复为空
        var $substitute = $("select[name='feedback']");
        $substitute.each(function (id, element) {
            var $this = $(element);
            var $parent = $this.parent();
            var number = $parent.attr("id").replace("output", "");
            $this.replaceWith("<input class='form-inline-control' name='feedback'" + "id='backcontrol" + number + "' value=''/>");
            $("span", $parent).remove();
        });
        $("input[name='feedback']").val('');
        return;
    }
    var addressNo = idx + 1;
    var addressStr = $("#address" + addressNo).val();
    var addressArr = addressStr.split(",");
    var data = [];
    for (var i = 0; i < addressArr.length; i++) {
        data.push({"id": i + "", "text": addressArr[i]});
    }
    // 除了IO模块之外输出控制进行更新
    /*$("#backcontrol" + no).replaceWith("<select name='feedback' class='select-control' id='backcontrol" + no + "'></select>");
    $("#backcontrol" + no).select2({
        tags: true,
        tokenSeparators: [",", " "],
        // maximumSelectionLength: 3,
        data: data,
        escapeMarkup: function (markup) {
            return markup;
        },
        multiple: true,
        minimumInputLength: 1,
        language: "zh-CN",
        placeholder: '请选择',
        allowClear: true
    });*/
    var notExpr = '#backcontrol' + addressNo;
    var $subject = "";
    if (flag) {
        $subject = $("input[name='feedback']:not(" + notExpr + ")");
        $subject.replaceWith("<select name='feedback' class='select-control'></select>");
    }
    $subject = $("select[name='feedback']");
    $subject.each(function(i, element){
        var $element = $(element);
        var instance = $element.data('select2');
        if (instance && isEffected) {
            $element.select2('destroy').empty();
        }
        $element.select2({
            tags: true,
            // tokenSeparators: [",", " "],
            // maximumSelectionLength: 3,
            data: data,
            escapeMarkup: function (markup) {
                return markup;
            },
            multiple: true,
            // minimumInputLength: 1,
            language: "zh-CN",
            // placeholder: '请选择',
            allowClear: true
        });
    });
}

function createAutoIOChannel(keyword, newNum, size) {
    if (keyword == 'IO') {
        var channelStr = getChannelVal(size);
        $("#channelInput" + newNum).val(channelStr);
    }
}

function getChannelVal(size) {
    var num = [];
    for (var i = 0; i < size; i++) {
        num.push(i + 1);
    }
    return num.join(",");
}

function limitRelation(newNum) {
    // 获取模块属性
    var keyword = $("#select" + newNum).val();
    $("#protocolselect" + newNum).val(relation[keyword]).attr("disabled", "disabled");
}

// 默认首选项为IO输入输出
function getModuleSelect(currentNum) {
    var str = "";
    $.ajax({
        url: '/config/module/relation',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            str = "<select class='select-control module-keyword' id='select" + (currentNum + 1) + "'>";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                var keyword = module['keyword'];
                relation[keyword] = module['id'];
                if (keyword == 'IO') {
                    str += "<option value='" + keyword + "' selected='true'>" + module['name'] + "</option>";
                } else {
                    str += "<option value='" + keyword + "'>" + module['name'] + "</option>";
                }
            }
            str += "</select>";
        }
    });
    return str;
}

function getModuleSelector(currentNum) {
    var str = "";
    $.ajax({
        url: '/config/module',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            str = "<select class='select-control module-keyword' id='select" + (currentNum + 1) + "'>";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                var keyword = module['keyword'];
                relation[keyword] = module['protocol'];
                if (currentNum == i) {
                    str += "<option value='" + keyword + "' selected='true'>" + module['name'] + "</option>";
                } else {
                    str += "<option value='" + keyword + "'>" + module['name'] + "</option>";
                }
            }
            str += "</select>";
        }
    });
    return str;
}

function getProtocol(currentNum) {
    var str = "";
    var num = (currentNum + 1);
    $.ajax({
        url: '/config/protocol',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            str = "<select class='select-control' id='protocolselect" + num + "'>";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                str += "<option value=" + module['value'] + ">" + module['text'] + "</option>";
            }
            str += "</select>";
        }
    });
    return str;
}

function deleteModule() {
    var maxNum = $("fieldset").length;
    if (maxNum > 1) {
        $("#panel" + maxNum).remove();
    }
    pickOutputControl(maxNum, false);
}

// 检测当前页面中是否存在IO模块
// 如果无IO模块，则无需反向控制
function hasIOModule() {
    var flag = false;
    var $select = $(".module");
    $select.each(function (index, element) {
        var val = $(element).val();
        if (val == 'IO') {
            flag = true;
        }
    });
    return flag;
}

function checkIO() {
    var timer = setInterval(function () {
        var flag = hasIOModule();
        if (flag) {
            clearInterval(timer);
        }
    }, 2000);
}