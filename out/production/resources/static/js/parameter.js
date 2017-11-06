var arr = ["name", "lowthreshold", "highthreshold", "delta", "normalsample", "abnormalsample"];
$(function () {
    getModuleList();
    $("#submitDevice").click(saveDeviceChanges);
    getDetails();
});

function saveDeviceChanges() {
    var modalId = "#modifyPanel";
    var name = $("#update-name").val();
    var lowthreshold = $("#update-lowthreshold").val() == '--' ? -1 : $("#update-lowthreshold").val();
    var highthreshold = $("#update-highthreshold").val() == '--' ? -1 : $("#update-highthreshold").val();
    var delta = $("#update-delta").val() == '--' ? -1 : $("#update-delta").val();
    var normalsample = $("#update-normalsample").val();
    var abnormalsample = $("#update-abnormalsample").val();
    var obj = {
        "name": name,
        "lowthreshold": lowthreshold,
        "highthreshold": highthreshold,
        "delta": delta,
        "normalsample": normalsample,
        "abnormalsample": abnormalsample
    };
    $.ajax({
        url: '/parameter/save',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(obj),
        success: function (data) {
            alert("更新成功");
            $(modalId).modal('hide');
            // 刷新表格数据
            getDetails();
        }
    });
}

function getModuleList() {
    $.ajax({
        url: '/parameter/controller',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            var str = "";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                str += "<option value='" + module['name'] + "'>" + module['name'] + "</option>";
            }
            str += "<option value='all'>所有</option>";
            $("#module-name").html(str);
        }
    });
}

function getDetails() {
    var name = $("#module-name").val();
    $.ajax({
        url: '/parameter/controller/' + name,
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            var str = "<thead> \
                            <td class='text-center'>选项</td> \
                            <td class='text-center'>类型</td> \
                            <td class='text-center'>下限阈值</td> \
                            <td class='text-center full-text'>上限阈值</td> \
                            <td class='text-center'>delta阈值</td> \
                            <td class='text-center full-text'>常规采样周期</td> \
                            <td class='text-center full-text'>异常采样周期</td> \
                        </thead> \
                        <tbody>";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                var specifiedName = module['name'];
                str += "<tr><td class='text-center'><input type='checkbox' /></td>";
                for (var j = 0; j < arr.length; j++) {
                    var value = module[arr[j]];
                    if (j == 0) {
                        str += "<td class='text-center'><a class='pointer' ata-toggle='modal' data-target='#modifyPanel' onclick='showModifyPanel(\"" + value + "\")'>" + value + "</a></td>";
                    } else {
                        if (specifiedName == '输入输出') {
                            if (value == -1) {
                                str += "<td class='text-center'>--</td>";
                            } else {
                                str += "<td class='text-center'>" + value + "</td>";
                            }
                        } else {
                            str += "<td class='text-center'>" + value + "</td>";
                        }
                    }
                }
                str += "</tr>";
            }
            str += "</tbody>";
            $("#device-table").html(str);
        }
    });
}

function displayModuleType(value) {
    var str = "";
    switch (value) {
        case 'TEMPERATURE':
            str = '温度传感器';
            break;
        case 'HUMIDITY':
            str = '湿度传感器';
            break;
        case 'PRESSURE':
            str = '液压传感器';
            break;
        case 'LEVEL':
            str = '液位传感器';
            break;
        case 'ADC':
            str = '输入';
            break;
        case 'IO':
            str = '输出';
            break;
        case 'WATERMETER':
            str = '水表';
            break;
        case 'AMMETER':
            str = '电表';
            break;
        default:
            str = '中转板';
            break;
    }
    return str;
}

function showModifyPanel(name) {
    $.ajax({
        url: '/parameter/controller/' + name,
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            var clients = response.length;
            for (var i = 0; i < clients; i++) {
                var clientInfo = response[0];
                for (var key in clientInfo) {
                    var value = clientInfo[key];
                    if (name == '输入输出') {
                        if (key == 'highthreshold' || key == 'lowthreshold' || key == 'delta') {
                            $("#update-" + key).val('--');
                        } else {
                            $("#update-" + key).val(value);
                        }
                    } else {
                        $("#update-" + key).val(value);
                    }
                    if (key == 'name') {
                        $("#update-" + key).attr("disabled", "disabled");
                    } else {
                        $("#update-" + key).removeAttr("disabled");
                    }
                    if (name == '输入输出') {
                        $("#update-highthreshold").attr("disabled", "disabled");
                        $("#update-lowthreshold").attr("disabled", "disabled");
                        $("#update-delta").attr("disabled", "disabled");
                    }
                }
            }
            $("#modifyPanel").modal('show');
        }
    });
}