$(document).bind('_page_ready', function () {
    // ComponentInitializer.initPageComponents();
    // 转换超链接为ajax加载，引用tools.js
    $("a[hf]").each(function (e) {
        $(this).attr("href", $(this).attr("hf"));
    })
    $("a[target]").convertlink();
});

/*<![CDATA[*/
$(document).bind('_child_page_ready', function () {
    /*//批量导出
    $('#btn-export').report("/maintain_summary", "#queryForm");
    //状态
    $("#sel_maintain_status").singleSelect();
    //时效性
    $("#sel_maintain_timeeff").singleSelect();
    //选择小区
    $('#sel_maintain_area').singleSelect({url: "/biz/area/optionsData"});
    //重置form，清空localStorage的值并触发Datatables的刷新,zq-jq-plugins.js
    $('#btn-reset').resetForm(null, function(){
        $("#maintainRangeStart").val(null);
        $("#maintainRangeEnd").val(null);
        $('#daterange-btn').resetRangeSelect();
    });

    //选择维保单位
    $('#sel_maintain_supplier').singleSelect({url: "/biz/entity/optionsData?type=C"});

    //refresh button click
    $('#btn-refresh').click(function(){datatable.draw();});

    //checkbox的全选,zq-jq-plugins.js
    $('#checkAll').checkAll();

    //Date range as a button
    $('#daterange-btn').emsdaterangepicker(
        {
            ranges: {
                '今天': [moment(), moment()],
                '明天': [moment().add(1, 'days'), moment().add(1, 'days')],
                '本周': [moment().startOf('week'), moment().endOf('week')],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '本年': [moment().startOf('year'), moment().endOf('year')]
            }
        },
        function (start, end) {
            //选择日期后把值保存到form对应的field value,以供datatable使用
            $("#maintainRangeStart").val(start.format('YYYY-MM-DD'));
            $("#maintainRangeEnd").val(end.format('YYYY-MM-DD'));
        }
    );

    var datatable = $('#tb_maintain').DataTable({
        ajax:{url:'/maintain/maintainData'},
        order: [ [ 5, 'desc' ] ],
        columns: [
            {name: "checkbox", "orderable": false},
            {name: "index", data:null, "orderable": false},
            {name: "ticketnum", data:"ticketnum",
                render:function(data, type, row, meta){
                    return '<a href="/maintain/detail?tkId=' + row.id + '" target="#main-content">' + data + '</a>';
                }},
            {name:"elevname", data:"elevname",
                render:function(data, type, row, meta){
                    return '<a href="/biz/elev/detail?eqpId=' + row.elevId + '" target="#main-content">' + data + '</a>';
                }
            },
            {name: "maintaindate", data:"maintaindate"},
            {name: "closetime", data:"closetime", defaultContent: ""},
            {name:"usedtime", data:"usedtime",
                render:function(data, type, row, meta){
                    if(data > 0) {
                        return '超期(用时' + data + '天)';
                    } else {
                        if(data < 0 ) {
                            return '预计划';
                        } else {
                            return '正常(用时' + data + '天)';
                        }
                    }
                }
            },
            {name: "singrst", data:"singrst", defaultContent: ""},
            {name:"spenttime", data:"spenttime",
                render:function(data, type, row, meta){
                    if(data > 0) {
                        return data + '分钟';
                    } else {
                        return '';
                    }
                }
            },
            {name: "mtstepname", data:"mtstepname", defaultContent: ""},
            {name:"status", data:"status",
                render:function(data, type, row, meta){
                    //row.status   1:新建,2:已派单,3:已接受, 4:已到场, 5:已解决, 6:已完成记录，7:已经评价, 8:废弃
                    var tkStatus = '新建';
                    switch(data) {
                        case "2": tkStatus = '已派单'; break;
                        case "3": tkStatus = '已接受'; break;
                        case "4": tkStatus = '已到场'; break;
                        case "5": tkStatus = '已完成'; break;
                        case "7": tkStatus = '已经评价'; break;
                        case "8": tkStatus = '废弃'; break;
                        case "9": tkStatus = '数据包上传失败'; break;
                    }
                    return tkStatus;
                }
            },
            {name:"providername", data:"providername", defaultContent: ""},
            {name:"firstuser", data:"firstuser", defaultContent: ""},
            {name:"seconduser", data:"seconduser", defaultContent: ""}
        ],
        createdRow: function (row, data, index) {
            if(data.usedtime > 0) {
                $(row).css("color", "red");
            }
        }
    });*/
});
/*]]>*/

$(function () {
   $(document).trigger('_page_ready');
   window.localStorage.clear();
});