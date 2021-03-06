$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('.content.mainModal table tbody'),
            $slidContainer: $("#myModal .orderDetail.images ul")
        },
        init: function () {
            this.initStyle();
            this.initEvents();
            this.initData();
        },
        initStyle: function () {
            $("#left_btnOrder").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal .toolbar #btnPrint").on("click", function (e) {
                // to print

            });

            $("#gridBody").on("click", "td .btnPic", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                that.options.$slidContainer.empty();
                selfAjax("post", "/admin/orderDetailSnapList/getsnaps", {
                    detailId: entity._id
                }, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    // show snaps
                    if (data.length > 0) {
                        data.forEach(function (img) {
                            that.options.$slidContainer.append('<li><img src="/client/images/' + img.img + '" alt=""></li>');
                        });
                        $('#myModal #myModalLabel').text("snap");
                        $('#myModal').modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                        drawsnap();
                    }
                });
            });

            $('#myModal').on('hidden.bs.modal', function (e) {
                if(timeId)
                {
                    clearTimeout(timeId);
                }
            });
        },
        initData: function () {
            this.search();
        },
        search: function (p) {
            var that = this,
                filter = {
                    orderId: $("#orderId").val()
                };
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/shop/orderDetail/orderAndDetails", filter, function (data) {
                if (data) {
                    if (data.order) {
                        $(".content.mainModal .orderId").text(data.order._id);
                        $(".content.mainModal .orderDate").text(moment(data.order.updatedDate).format("YYYY-MM-DD HH:mm"));
                        $(".content.mainModal .total").text(data.order.totalPrice);
                    }
                    if (data.details.length > 0) {
                        var d = $(document.createDocumentFragment());
                        data.details.forEach(function (record) {
                            var name = record.name;
                            var $tr = $('<tr id=' + record._id + '><td>' + name + '</td><td>' +
                                record.buyCount + '</td><td>' + record.goodPrice + '</td><td><div class="btn-group">' + that.getButtons() + '</div></td></tr>');
                            $tr.find(".btn-group").data("obj", record);
                            d.append($tr);
                        });
                        that.options.$mainSelectBody.append(d);
                    }
                }
            });
        },
        getButtons: function () {
            var buttons = '<a class="btn btn-default btnPic">快照</a>';
            return buttons;
        }
    };

    var wrap=$("#myModal .orderDetail.images ul")[0],
    timeId =null;
    function drawsnap(){
        var newLeft;
        if(wrap.style.left === "-1136px"){
            newLeft = 0;
        }else{
            newLeft = parseInt(wrap.style.left||0)-568;
        }
        wrap.style.left = newLeft + "px";

        timeId = setTimeout(function(){
            drawsnap();
        },1000);
    }

    pageManager.init();
});