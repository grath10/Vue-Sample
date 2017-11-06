$(function () {
    getRelation();
    $("#submitRelation").click(createRelation);
    $("#newRelationPanel").on("show.bs.modal", function () {
        $.ajax({
            url: 'config/module',
            data: null,
            type: 'get',
            async: false,
            success: function (response) {
                var str = "";
                for(var i=0;i<response.length;i++){
                    var row = response[i];
                    str += "<option value='" + row['keyword'] + "'>" + row['name'] + "</option>";
                }
                $("#module-name").html(str);
            },
            error: function () {
                console.log('查询失败');
            }
        });
        $.ajax({
            url: 'config/protocol',
            data: null,
            type: 'get',
            async: false,
            success: function (response) {
                var str = "";
                for(var i=0;i<response.length;i++){
                    var row = response[i];
                    str += "<option value='" + row['value'] + "'>" + row['text'] + "</option>";
                }
                $("#protocol-text").html(str);
            },
            error: function () {
                console.log('查询失败');
            }
        });
    });
});

function getRelation() {
    $.ajax({
        url: 'relation/get',
        data: null,
        async: false,
        success: function (response) {
            var str = "<thead><tr class='text-center'><td class='full-text'>选项</td><td class='full-text'>模块名称</td><td class='full-text'>协议名称</td>";
            str += "<tbody>";
            for (var i = 0; i < response.length; i++) {
                var rowData = response[i];
                var name = rowData['name'];
                var keyword = rowData['protocol'];
                str += "<tr class='text-center'><td><input type='checkbox' value=\"" + name + "\">" + "</td><td>" + name + "</td><td>" + keyword + "</td></tr>";
            }
            str += "</tbody>";
            $("#relation-table").html(str);
        }
    });
}

function createAlterLink(id, val) {
    return "<a class='pointer' onclick='showAlterPanel(\"" + id + "\",\"" + val + "\")'>" + id + "</a>";
}

function showAlterPanel(id, val) {
    $("#modifyProtocolPanel").modal('show');
    $("#update-id").val(id);
    $("#update-desc").val(val);
}

// 创建新的模块协议对应关系
function createRelation() {
    var keyword = $("#module-name").val();
    var id = $("#protocol-text").val();
    $.ajax({
        url: 'relation/add',
        data: {
            id: id,
            keyword: keyword
        },
        async: false,
        success: function (response) {
            if (response == "success") {
                alert("添加成功");
                $("#newRelationPanel").modal('hide');
                getRelation();
            } else if (response == 'duplicate') {
                alert("名称对应关系已存在");
            } else {
                alert("新增关系出错");
            }
        }
    })
}

function deleteModule() {
    var checkboxes = $("input[type='checkbox']:checked");
    var boxes = checkboxes.length;
    if (boxes > 1 || boxes == 0) {
        alert("请选择一条记录！");
        return;
    }
    var id = checkboxes[0].value;
    $.ajax({
        url: 'module/delete',
        data: {
            "id": id
        },
        async: false,
        success: function (response) {
            if (response == "success") {
                alert("删除成功");
                getModule();
            } else {
                alert("删除操作出错");
            }
        }
    })
}