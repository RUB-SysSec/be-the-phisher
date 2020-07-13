$(document).ready(function() {
    var user_id = $("div.user_id").text();
    var error = false;

    $("input[name='phishing']").click(function() {
        var value = $("input[name='phishing']:checked").val();
        if (value == "yes") {
            $("#phishing_description").css("display", "block");
        } else {
            $("#phishing_description").css("display", "none");
        }
    });

    var getValue = function(identifier) {
        $("#" + identifier + " p").removeClass("red");
        var value = $("input[name='" + identifier + "']:checked").val();
        if (typeof(value) === "undefined") {
            error = true;
            $("#" + identifier + " p").addClass("red");
        }

        return value;
    }

    var sendResults = function(data) {
        $.ajax({
            "type": "POST",
            "url": "/questionnaire/results",
            "data": data,
            "success": function(data) {
                // set continue link visible
                $("#continue").css("display", "block");
                // set send questionnaire wrapper invisible
                $("#send_questionnaire_wrapper").css("display", "none");
            },
            "error": function() {
                $("#error_message").html("You already answered the questionnaire");
                $("#error_message").css("display", "block");
            }
        });
    }

    $(".send_questionnaire").click(function() {
        // error would stay true if we don't reset it
        // every time the button is clicked
        error = false;
        // get radio button's values
        data = {"user_id":              user_id,
                "age":                  getValue("age"),
                "gender":               getValue("gender"),
                "education":            getValue("education"),
                "origin":               getValue("origin"),
                "f1":                   getValue("f1"),
                "f2":                   getValue("f2"),
                "f3":                   getValue("f3"),
                "f4":                   getValue("f4"),
                "f5":                   getValue("f5"),
                "f6":                   getValue("f6"),
                "f7":                   getValue("f7"),
                "f8":                   getValue("f8"),
                "f9":                   getValue("f9"),
                "f10":                  getValue("f10"),
                "f11":                  getValue("f11"),
                "f12":                  getValue("f12"),
                "f13":                  getValue("f13"),
                "f14":                  getValue("f14"),
                "f15":                  getValue("f15"),
                "f16":                  getValue("f16"),
                "attention_test1":      getValue("attention_test1"),
                "attention_test2":      getValue("attention_test2"),
                "phishing":             getValue("phishing"),
                "phishing_description": $("textarea[name='feedback']").val().replace(/[\n\r]/g, ' ').replace("'", ""),
                "phishing_training":    getValue("phishing_training"),
                "techniques":           getValue("techniques"),
                "future":               getValue("future"),
                "feedback":             $("textarea[name='feedback']").val().replace(/[\n\r]/g, ' ').replace("'", "")}

        if (error) {
            // display error message when values are missing
            $("#error_message").css("display", "block");
        } else {
            // send answers to server
            sendResults(data);
        }
    });
});