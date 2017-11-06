$(function () {
    $("#submitCommit").click(createProtocol);
    getProtocol();
});

function getProtocol() {
    $.ajax({
        url: 'config/protocol',
        data: null,
        async: false,
        success: function (response) {
            var str = "<thead><tr class='text-center'><td class='full-text'>选项</td><td class='full-text'>编号</td><td class='full-text'>描述</td>";
            str += "<tbody>";
            for(var i=0;i<response.length;i++){
                var rowData = response[i];
                var val = rowData['text'];
                var id = rowData['value'];
                str += "<tr class='text-center'><td><input type='checkbox' value=\"" + id + "\">" + "</td><td>" + createAlterLink(id, val) + "</td><td>" + val + "</td></tr>";
            }
            str += "</tbody>";
            $("#protol-table").html(str);
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
function createProtocol() {
    var id = $("#id").val();
    var text = $("#desc").val();
    if (id == "" || text == "") {
        alert("编号或描述不可为空");
        return;
    }
    $.ajax({
        url: 'protocol/add',
        data: {
            text: text,
            value: id
        },
        async: false,
        success: function (response) {
            if (response == "success") {
                $("#newPanel").modal('hide');
                getProtocol();
            } else if (response == 'isExisted') {
                alert("编号或描述已存在");
            } else {
                alert("新增协议出错");
            }
        }
    })

}