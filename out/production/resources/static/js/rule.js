var operator = ['>','=','<'];
var logical = [{value:'and',text:'并且'}, {value:'or',text:'或者'}];
function generateRule(index) {
    var str = "<select class='operator select-control' id='operator" + index + "'>";
    for(var i=0;i<operator.length;i++) {
        str += "<option value='" + operator[i] + "'>" + operator[i] + "</option>";
    }
    str += "</select>";
    return str;
}

function getLogicalOperation(index) {
    var str = "<select class='relation select-control' id='relation" + index + "'>";
    for(var i=0;i<logical.length;i++) {
        var logicObj = logical[i];
        str += "<option value='" + logicObj['value'] + "'>" + logicObj['text'] + "</option>";
    }
    str += "</select>";
    return str;
}

function createChannel(number, index, isOut) {
    var str = isOut ? ("<select class='select-control' id='outChannel-select" + index + "'>") : ("<select class='select-control' id='inChannel-select" + index + "'>");
    for(var i=1;i<=number;i++){
        if(i == index) {
            str += "<option value='" + i + "' selected>" + "通道" + i + "</option>";
        }else{
            str += "<option value='" + i + "'>" + "通道" + i + "</option>";
        }
    }
    str += "</select>";
    return str;
}

function insertText(index) {
    var str = "<input type='text' class='form-inline-control' id='content" + index + "'" + "/>";
    return str;
}

function getLayout() {
    var inNum = $("#inChannel").val();
    var outNum = $("#outChannel").val();
    if(inNum == "" || outNum == ""){
        alert("通道数不能为空");
        return;
    }
    var index = $(".requirement").length;
    var nextId = index + 1;
    var str = "<div class='requirement' id='requirement" + nextId + "'>";
    str +="<div class='rule' id='condition1'>";
    str += "<div style='padding-left: 4px;width:79px;display: inline-block'><img src='/images/details_open.png' class='pointer' onclick='createAnotherRule(this)'/> \
        &nbsp;&nbsp;<img src='/images/details_close.png' class='pointer' onclick='deleteLastRule(this)'/></div>";
    str += "(" + createChannel(inNum, 1, false);
    str += generateRule(1);
    str += insertText(1);
    str += " ) </div>";
    str += "<div><label class='label-control'>影响结果：</label>" + createChannel(outNum, nextId, true) + "</div>";
    str += "</div>";
    if(nextId == 1) {
        $("#action").html(str);
    }else{
        $(str).insertAfter("#requirement" + index);
    }
}

function createAnotherRule(me) {
    var that = $(me).parents(".requirement");
    var parentId = $(that).attr('id').replace("requirement","");
    var inNum = $("#inChannel").val();
    var currentId = $(".rule", that).length;
    var nextId = currentId + 1;
    var str = "<div class='rule' id='condition" + nextId + "'>";
    str += getLogicalOperation(nextId);
    str += "(" + createChannel(inNum, nextId, false);
    str += generateRule(nextId);
    str += insertText(nextId);
    str += " )</div>";
    $(str).insertAfter($("#condition" + currentId, "#requirement" + parentId));
}

function deleteLastRule(me) {
    var that = $(me).parents(".requirement");
    var parentId = $(that).attr('id').replace("requirement","");
    var currentId = $(".rule", that).length;
    var lastId = currentId;
    if(lastId > 1) {
        $("#condition" + lastId, "#requirement" + parentId).remove();
    }
}

function deleteRule() {
    var currentId = $(".requirement").length;
    if(currentId > 1) {
        $("#requirement" + currentId).remove();
    }
}

function saveRule() {
    var requirements = $(".requirement").length;
    var arr = [];
    for(var i=1;i<=requirements;i++){
        var rules = $(".rule", "#requirement" + i).length;
        var line = "";
        for(var j=1;j<=rules;j++){
            var relation = "";
            if(j != 1){
                relation = " " + $("#relation" + j).val() + " ";
            }
            var inChannel = $("#inChannel-select" + j).val();
            var operator = $("#operator" + j).val();
            var content = $("#content" + j).val();
            line += relation + inChannel + " " + operator + " " + content;
        }
        var output = $("#outChannel-select" + i).val();
        arr.push(output + "=" + line);
    }
    console.log(arr);
}