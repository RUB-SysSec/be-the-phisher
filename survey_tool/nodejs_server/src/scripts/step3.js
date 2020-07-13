$(document).ready(function() {
    var user_id = $("div.user_id").text();
    var last_click = 0;
    var finish_url = "/step3/finished";
    var finished = false;
    var id = "";
    var type = "";
    var counter = 0;

    $.ajax({
        "type": "GET",
        "url": "/is_step_finished/user_id/" + user_id + "/step_id/step3",
        "success": function(data) {
            finished = true;
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

    var getNextDomain = function() {
        $.ajax({
            "type": "GET",
            "url": "/step3/next_domain/user_id/" + user_id,
            "success": function(data) {
                data = $.parseJSON(data);
            	id = data["id"];
            	type = data["type"];
                counter = parseInt(data["count"], 10);
                $("#counter").html(counter);
                // display domain when request was successful
                if (counter >= 10 && !finished) {
                    if ($("#start").length) {
                        $("#start").remove();
                    }
            	    $("#status").remove();
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
                } else {
                    $("#domain").html(data["next_domain"]);
                }
            },
            "error": function() {
            	$("#status").remove();
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
        })
    }

    var sendResult = function(rating, elapsed_time) {
        $.ajax({
            "type": "POST",
            "url": "/step3/result",
            "data": {"user_id": user_id,
                     "id": id,
                     "type": type,
                     "rating": rating,
                     "elapsed_time": elapsed_time},
            "success": function(data) {
            	getNextDomain();
            }
        });
    }

    var startExperiment = function() {
        // remove start button div
        $("#start").remove();
        // set experiment visible
        $("#experiment").css("display", "block");
        // set last_click to current time
        last_click = (new Date()).getTime();
    }

    // get first domain
    getNextDomain();

    $("#start").click(function() {
        startExperiment();
    });

    $("#rate_1, #rate_2, #rate_3, #rate_4, #rate_5").click(function() {
    	rating = $(this).attr("id").split("_")[1];
        now = (new Date()).getTime();
        elapsed_time = now - last_click;
        last_click = now;
        
        sendResult(rating, elapsed_time);
    	$("#dropdown_content_domain_rating").toggle();
    });
});