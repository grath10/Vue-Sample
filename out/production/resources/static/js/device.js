$(function () {
    $("#submitDevice").click(saveDeviceChanges);
});

function saveDeviceChanges() {
    var modalId = "#modifyPanel";
    var clientid = $("#update-clientid").val();
    var location = $("#update-location").val();
    var comment = $("#update-comment").val();
    var obj = {
        clientid: clientid,
        location: location,
        comment: comment
    };
    $.ajax({
        url: '/device/save',
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

function getControllerList() {
    $.ajax({
        url: '/device/controllers',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: null,
        success: function (response) {
            var str = "";
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                str += "<option value='" + module + "'>" + module + "</option>";
            }
            $("#device-controller").html(str);
        }
    });
}

function getDataTableDetails() {
    var $table = $("#device-table");
    var table = $table.DataTable({
        lengthChange: false,
        destroy: true,
        iDisplayLength: 10,  //每页显示10条数据
        autoWidth: false,   //禁用自动调整列宽
        processing: false,  //隐藏加载提示,自行处理
        serverSide: true,   //启用服务器端分页
        searching: false,
        ajax: function (data, callback, settings) {
            return loadDeviceInfo(data, callback, settings);
        },
        columns: [{
            "title": "选项"
        }, {
            "title": "客户端编号",
            data: 'clientid',
            className: "text-center"
        }, {
            "title": "位置",
            data: 'location',
            className: "text-center"
        }, {
            "title": "类型",
            data: 'type',
            className: "text-center"
        }, {
            "title": "备注",
            data: 'comment',
            className: "text-center"
        }, {
            "title": "通道",
            data: 'channel',
            className: "text-center"
        }],
        order: [[1, "asc"]],
        columnDefs: [{
            "targets": 0,
            "searchable": false,
            'orderable': false,
            'className': 'dt-body-center',
            'render': function (data, type, full, meta) {
                return '<input type="checkbox" />';
            }
        }, {
            "targets": 1,
            'render': function (data, type, full, meta) {
                return "<a class='pointer' data-target='#modifyPanel' onclick='showModifyPanel(\"" + data + "\")'>" + data + "</a>";
            }
        }, {
            "targets": 3,
            'render': function (data, type, full, meta) {
                return displayModuleType(data);
            }
        }, {
            "targets": 5,
            'render': function (data, type, full, meta) {
                var str = data;
                if (data == "-1") {
                    str = "N/A";
                }
                if (data == '0') {
                    str = "";
                }
                return str;
            }
        }],
        language: {
            url: '/i18n/Chinese.lang'
        }
    });
}

function loadDeviceInfo(data, callback, settings) {
    var client = $("#device-controller").val();
    var orderCfg = data['order'][0];
    $.ajax({
        url: '/device/hardware',
        data: {
            id: client,
            draw: data['draw'],
            dir: orderCfg['dir'],
            startIndex: data['start'],
            pageSize: data['length'],
            orderColumn: data['columns'][orderCfg['column']]['data']
        },
        type: 'get',
        async: false,
        success: function (response) {
            var returnData = {};
            returnData.draw = response.draw;
            returnData.recordsTotal = response.total;
            returnData.recordsFiltered = response.total;
            returnData.data = response.list;
            callback(returnData);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function getDetails() {
    var client = $("#device-controller").val();
    $.ajax({
        url: '/device/controller',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: {
            id: client
        },
        success: function (response) {
            var str = "<thead> \
                            <td class='text-center'>选项</td> \
                            <td class='text-center'>客户端编号</td> \
                            <td class='text-center full-text'>位置</td> \
                            <td class='text-center'>类型</td> \
                            <td class='text-center full-text'>备注</td> \
                            <td class='text-center full-text'>通道</td> \
                        </thead> \
                        <tbody>";
            var arr = ['clientid', 'location', 'type', 'comment', 'channel'];
            for (var i = 0; i < response.length; i++) {
                var module = response[i];
                str += "<tr><td class='text-center'><input type='checkbox' /></td>";
                for (var j = 0; j < arr.length; j++) {
                    var key = arr[j];
                    if (key != 'protocol') {
                        str += "<td class='text-center'>" + formatDisplayInfo(key, module[key]) + "</td>";
                    }
                }
                str += "</tr>";
            }
            str += "</tbody>";
            $("#device-table").html(str);
        }
    });
}

function formatDisplayInfo(key, value) {
    var str = "";
    if (value) {
        str = value;
        if (key == 'type') {
            str = displayModuleType(value);
        } else if (key == 'clientid') {
            str = "<a class='pointer' data-target='#modifyPanel' onclick='showModifyPanel(\"" + value + "\")'>" + value + "</a>";
        } else if (key == 'channel') {
            if (str == "-1") {
                str = "N/A";
            }
        }
    }
    return str;
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
            str = '输入输出';
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

function showModifyPanel(id) {
    $.ajax({
        url: '/device/controller',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: {
            id: id
        },
        success: function (response) {
            var clients = response.length;
            for (var i = 0; i < clients; i++) {
                var clientInfo = response[0];
                for (var key in clientInfo) {
                    if (key == 'channel') {
                        var value = clientInfo[key] == -1 ? "N/A" : clientInfo[key] == 0 ? '' : clientInfo[key];
                        $("#update-" + key).val(value);
                    } else if (key == 'type') {
                        $("#update-" + key).val(displayModuleType(clientInfo[key]));
                    } else {
                        $("#update-" + key).val(clientInfo[key]);
                    }
                    if (key == 'clientid' || key == 'type' || key == 'channel') {
                        $("#update-" + key).attr("disabled", "disabled");
                    }
                }
            }
            $("#modifyPanel").modal('show');
        }
    });
}