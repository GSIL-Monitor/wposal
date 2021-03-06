$(document).ready(function () {
    var pageManager = {
        pageOptions: {},
        pageInit: function () {
            this.pageInitStyle();
            this.pageInitEvents();
            this.pageInitData();
        },
        pageInitStyle: function () {
            $("#left_btnSite").addClass("active");
        },
        pageInitEvents: function () {
            var that = this;
            $(".toolbar #btnSave").on("click", function (e) {
                postObj = {
                    name: $.trim($('.mainModal #name').val()),
                    description: $.trim($('.mainModal #description').val())
                };
                postURI = "/admin/siteInfo/edit";
                selfAjax("post", postURI, postObj, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.reload();
                });
            });

            $(".mainModal #btnBgImageUpload").on("click", function (e) {
                var file = document.getElementById('bgImage').files;
                if (file.length == 1) {
                    var formData = new FormData();
                    formData.append("bgImage", file[0]);
                    formData.append("name", "bgImage");
                    $.ajax({
                        type: "POST",
                        data: formData,
                        url: "/admin/bgImageUp",
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            showAlert("上传成功！");
                        }
                    });
                }
            });

            $(".mainModal #btnAdvImageUpload").on("click", function (e) {
                var file = document.getElementById('advImage').files;
                if (file.length == 1) {
                    var formData = new FormData();
                    formData.append("bgImage", file[0]);
                    formData.append("name", "advImage");
                    $.ajax({
                        type: "POST",
                        data: formData,
                        url: "/admin/bgImageUp",
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            showAlert("上传成功！");
                        }
                    });
                }
            });

            $(".mainModal #btnAdvVideoUpload").on("click", function (e) {
                var file = document.getElementById('advVideo').files;
                if (file.length == 1) {
                    var formData = new FormData();
                    formData.append("bgVideo", file[0]);
                    $.ajax({
                        type: "POST",
                        data: formData,
                        url: "/admin/advVideoUp",
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            showAlert("上传成功！");
                        }
                    });
                }
            });
        },
        pageInitData: function () {
            this.pageSearch();
        },
        pageSearch: function (p) {
            selfAjax("post", "/admin/siteInfoList/search", {}, function (data) {
                if (data.error) {
                    showAlert(data.error);
                    return;
                }
                $(".mainModal #name").val(data.name);
                $(".mainModal #description").val(data.description);
            });
        }
    };

    pageManager.pageInit();
});