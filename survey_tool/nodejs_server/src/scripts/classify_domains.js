$(document).ready(function() {
    var user_id = $("div.user_id").text();
    var step_id = $("div.step_id").text();
    var last_click = 0;
    var result_url = "/" + step_id + "/result";
    var finish_url = "/" + step_id + "/finished";
    var sendingResult = false;

    $.ajax({
        "type": "GET",
        "url": "/is_step_finished/user_id/" + user_id + "/step_id/" + step_id,
        "success": function(data) {
            if ($("#start").length) {
                $("#start").remove();
            }
            // remove experiment div
            $("#experiment").remove();
            // set continue link visible
            $("#continue").css("display", "block");
            $("#continue_info").html("You already finished this step!");            
        }
    })

    var getNextDomain = function(user_id) {
        $.ajax({
            "type": "GET",
            "url": "/next_domain/user_id/" + user_id,
            "success": function(data) {
                // display first domain when request was successful
                data = $.parseJSON(data);
                $("#domain").html(data["next_domain"]);
                sendingResult = false;
            },
            "error": function() {
                if ($("#start").length) {
                    $("#start").remove();
                }
                // remove experiment div
                $("#experiment").remove();
                // set continue link visible
                $("#continue").css("display", "block");
                $("#continue_info").html("You classified all available domains!");
            }
        })
    }
    
    var sendResult = function(user_id, result, url) {
        if (!sendingResult) {
            sendingResult = true;
            domain = $("#domain").text();
            now = (new Date()).getTime();
            elapsed_time = now - last_click;
            last_click = now;
            $.ajax({
                "type": "POST",
                "url": url,
                "data": {"user_id": user_id,
                         "domain": domain,
                         "elapsed_time": elapsed_time,
                         "result": result},
                "success": function(data) {
                    getNextDomain(user_id);
                }
            });
        }
    }
    
    var startExperiment = function() {
        // remove start button div
        $("#start").remove();
        // set experiment visible
        $("#experiment").css("display", "block");
        // set last_click to current time
        last_click = (new Date()).getTime();
    
        // start timer
        var timer = setInterval(function() {
            var count = parseInt($('#current_time').html());
            if (count !== 1) {
                $('#current_time').html(count - 1);
            } else {
                clearInterval(timer);
                $('#current_time').html(0);
                // remove experiment div
                $("#experiment").remove();
                // send message to server that step has been finished
                $.ajax({
                    "type": "POST",
                    "url": finish_url,
                    "data": {"user_id": user_id},
                    "success": function(data) {
                        // set continue link visible
                        $("#continue").css("display", "block");
                    }
                });
            }
        }, 1000);
    }

    // get first domain
    getNextDomain(user_id);

    $("#start").click(function() {
        startExperiment();
    });

    // handle button clicks
    $("#ben").click(function() {
        sendResult(user_id, false, result_url);
    });
    $("#mal").click(function() {
        sendResult(user_id, true, result_url);
    });
});