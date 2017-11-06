$(function () {
    getModule();
    $("#submitModuleCommit").click(createModule);
});

function getModule() {
    $.ajax({
        url: 'config/module',
        data: null,
        async: false,
        success: function (response) {
            var str = "<thead><tr class='text-center'><td class='full-text'>选项</td><td class='full-text'>名称</td><td class='full-text'>关键字</td>";
            str += "<tbody>";
            for (var i = 0; i < response.length; i++) {
                var rowData = response[i];
                var name = rowData['name'];
                var keyword = rowData['keyword'];
                var no = rowData['id'];
                str += "<tr class='text-center'><td><input type='checkbox' value=\"" + no + "\">" + "</td><td>" + name + "</td><td>" + keyword + "</td></tr>";
            }
            str += "</tbody>";
            $("#module-table").html(str);
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

// 创建新的模块
function createModule() {
    var name = $("#protocol-name").val();
    var keyword = $("#protocol-keyword").val();
    if (name == "" || keyword == "") {
        alert("名称或关键字不可为空");
        return;
    }
    $.ajax({
        url: 'module/add',
        data: {
            name: name,
            keyword: keyword
        },
        async: false,
        success: function (response) {
            if (response == "success") {
                alert("添加成功");
                $("#newModulePanel").modal('hide');
            } else if (response == 'duplicate') {
                alert("名称或关键字已存在");
            } else {
                alert("新增模块出错");
            }
        }
    });
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
    });
}