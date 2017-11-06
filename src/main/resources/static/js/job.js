$(function () {
    $("#job-confirm").click(createNewJob);
    $("#task-query").click(getDataTableDetails);
    $("#task-remove").click(removeJob);
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
            $("#jobPanel").modal('hide');
            getDataTableDetails();
        },
        error: function () {
            console.log('创建任务失败');
            $("#jobPanel").modal('hide');
        }
    });
}

function getDataTableDetails() {
    var $table = $("#task-table");
    var table = $table.DataTable({
        lengthChange: false,
        destroy: true,
        iDisplayLength: 10,  //每页显示10条数据
        autoWidth: false,   //禁用自动调整列宽
        processing: false,  //隐藏加载提示,自行处理
        serverSide: true,   //启用服务器端分页
        searching: false,
        ajax: function (data, callback, settings) {
            return loadInfo(data, callback, settings);
        },
        columns: [{
            "title": "选项",
            className: "text-center"
        }, {
            "title": "任务名称",
            data: 'name',
            className: "text-center"
        }, {
            "title": "内容",
            data: 'content',
            className: "text-center"
        }, {
            "title": "触发条件",
            data: 'schedule',
            className: "text-center"
        },{
            "title": "触发器名称",
            data: 'triggerName',
            className: 'text-center',
            visible: false
        }],
        order: [[1, "asc"]],
        columnDefs: [{
            "targets": 0,
            "searchable": false,
            'orderable': false,
            'className': 'dt-body-center',
            'render': function (data, type, full, meta) {
                return '<input type="checkbox" id="' + full['triggerName'] + '"/>';
            }
        }, {
            "targets": 1,
            'render': function (data, type, full, meta) {
                return "<a class='pointer'>" + data + "</a>";
            }
        }],
        language: {
            url: '/i18n/Chinese.lang'
        }
    });
}

function loadInfo(data, callback, settings) {
    var orderCfg = data['order'][0];
    $.ajax({
        url: '/job/query',
        data: {
            draw: data['draw'],
            dir: orderCfg['dir'],
            pageNum: data['start'],
            pageSize: data['length'],
            orderColumn: data['columns'][orderCfg['column']]['data']
        },
        type: 'get',
        async: false,
        success: function (response) {
            var returnData = {};
            returnData.draw = response.draw;
            returnData.recordsTotal = response["total"];
            returnData.recordsFiltered = response["total"];
            returnData.data = response.list;
            callback(returnData);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function removeJob() {
    var $checkbox = $("input[type='checkbox']:checked");
    var number = $checkbox.length;
    if(number != 1){
        alert("请选择一条记录!");
        return;
    }
    var jobName = $checkbox[0].id;
    $.ajax({
        url: '/job/delete',
        data:{
            "jobName": jobName
        },
        type: 'post',
        success: function () {
            getDataTableDetails();
        },
        error: function () {

        }
    })
}