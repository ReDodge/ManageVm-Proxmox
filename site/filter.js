let table = document.getElementById("tableSearch")
$(document).ready(
    function filters() {
        $("#tableSearch").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#list tr").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
            if ($("#list").children(":visible").length === 0) {
                onClick()
            }
        });
    });

