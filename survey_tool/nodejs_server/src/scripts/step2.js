$(document).ready(function() {
    var domain;
    var created_domain = "";
    var created_combosquatting_domain = "";
    var created_subdomain = "";
    var squatting_technique;
    var last_click = 0;
    var user_id = $("div.user_id").text();
    var finish_url = "/step2/finished";
    var characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
                      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    var terms = ["login", "secure", "account", "verify", "service", "official", "support", "validation", "authentication", "mobile", "signin"]
    var qwerty_typos = {"1": ["2", "q"],
                        "2": ["1", "q", "w", "3"],
                        "3": ["2", "w", "e", "4"],
                        "4": ["3", "e", "r", "5"],
                        "5": ["4", "r", "t", "6"],
                        "6": ["5", "t", "y", "7"],
                        "7": ["6", "y", "u", "8"],
                        "8": ["7", "u", "i", "9"],
                        "9": ["8", "i", "o", "0"],
                        "0": ["9", "o", "p"],
                        "q": ["1", "2", "w", "a"],
                        "w": ["2", "3", "q", "e", "a", "s"],
                        "e": ["3", "4", "w", "r", "s", "d"],
                        "r": ["4", "5", "e", "t", "d", "f"],
                        "t": ["5", "6", "r", "y", "f", "g"],
                        "y": ["6", "7", "t", "u", "g", "h"],
                        "u": ["7", "8", "y", "i", "h", "j"],
                        "i": ["8", "9", "u", "o", "j", "k"],
                        "o": ["9", "0", "i", "p", "k", "l"],
                        "p": ["0", "o", "l"],
                        "a": ["q", "w", "s", "z"],
                        "s": ["w", "e", "a", "d", "z", "x"],
                        "d": ["e", "r", "s", "f", "x", "c"],
                        "f": ["r", "t", "d", "g", "c", "v"],
                        "g": ["t", "y", "f", "h", "v", "b"],
                        "h": ["y", "u", "g", "j", "b", "n"],
                        "j": ["u", "i", "h", "k", "n", "m"],
                        "k": ["i", "o", "j", "l", "m"],
                        "l": ["o", "p", "k"],
                        "z": ["a", "s", "x"],
                        "x": ["s", "d", "z", "c"],
                        "c": ["d", "f", "x", "v"],
                        "v": ["f", "g", "c", "b"],
                        "b": ["g", "h", "v", "n"],
                        "n": ["h", "j", "b", "m"],
                        "m": ["j", "k", "n"]}
    var homograph_chars = {"a": ["ɑ", "α", "а", "â", "à", "á", "â", "ã", "ä", "å", "ā", "ă", "ą", "ƌ", "ǎ", "ǟ", "ǡ", "ǻ", "ȁ", "ȃ", "ȧ", "ḁ", "ạ"],
                           "b": ["Ꮟ", "ᖯ", "ƀ", "ḃ", "ḅ", "ḇ"],
                           "c": ["ᴄ", "ⲥ", "с", "ç", "ć", "ĉ", "ċ", "č", "ƈ", "ȼ"],
                           "d": ["ԁ", "Ꮷ", "ᑯ", "ꓒ", "ď", "đ", "ȡ", "ḋ"],
                           "e": ["е", "ҽ", "è", "é", "ê", "ë", "ē", "ĕ", "ė", "ę", "ě", "ȅ", "ȇ", "ȩ", "ɇ", "ẹ"],
                           "f": ["ẝ", "ք", "ƒ", "ḟ"],
                           "g": ["ɡ", "ᶃ", "ƍ", "ց", "ĝ", "ğ", "ġ", "ģ", "ǥ", "ǧ", "ǵ"],
                           "h": ["һ", "հ", "Ꮒ", "ĥ", "ħ", "ȟ"],
                           "i": ["ı", "ɪ", "ɩ", "ι", "і", "ꙇ", "ӏ", "Ꭵ", "í", "ì", "í", "î", "ï", "ĩ", "ī", "ĭ", "į", "ı", "ǐ", "ȉ", "ȋ"],
                           "j": ["ϳ", "ј", "ĵ", "ǰ", "ȷ", "ɉ"],
                           "k": ["ᴋ", "ĸ", "κ", "ⲕ", "к", "ķ", "ƙ", "ǩ", "ḵ", "ḳ"],
                           "l": ["1", "۱", "I", "ǀ", "ⵏ", "ᛁ", "ꓲ", "𐌉", "ĺ", "ļ", "ľ", "ł", "ƚ", "ȴ", "ḻ"],
                           "m": ["ṁ", "ṃ", "м"],
                           "n": ["π", "ᴨ", "п", "ո", "ռ", "ñ", "ń", "ņ", "ň", "ŋ", "ƞ", "ǹ", "ȵ", "ṇ"],
                           "o": ["०", "੦", "૦", "௦", "൦", "๐", "໐", "၀", "۵", "ᴏ", "ᴑ", "ο", "σ", "ⲟ", "о", "օ", "ơ", "ȯ", "ō", "ó", "ô", "ð", "ò", "ó", "ô", "õ", "ö", "ŏ", "ő", "ǒ", "ǫ", "ǭ", "ǿ", "ȍ", "ȏ", "ȫ", "ȭ", "ȱ", "ọ", "ø"],
                           "p": ["ρ", "ⲣ", "р", "ƿ", "þ", "ƥ", "ṗ"],
                           "q": ["ԛ", "գ", "զ", "ɋ"],
                           "r": ["ᴦ", "ⲅ", "г", "ŕ", "ŗ", "ř", "ȑ", "ȓ", "ɍ", "ṛ"],
                           "s": ["ꜱ", "ƽ", "ѕ", "ꜱ", "ś", "ŝ", "ş", "š", "ș", "ȿ", "ṡ"],
                           "t": ["ᴛ", "τ", "т", "ť", "ţ", "ť", "ŧ", "ƫ", "ƭ", "ț", "ȶ", "ṫ", "ṭ"],
                           "u": ["ᴜ", "ʋ", "υ", "ц", "ս", "ù", "ú", "û", "ü", "ũ", "ū", "ŭ", "ů", "ű", "ų", "ư", "ǔ", "ǖ", "ǘ", "ǚ", "ǜ", "ȕ", "ȗ", "ụ"],
                           "v": ["ᴠ", "ν", "ѵ"],
                           "w": ["ŵ", "ẁ", "ẃ", "ẅ"],
                           "x": ["х", "ᕁ", "ᕽ"],
                           "y": ["ɣ", "ᶌ", "ʏ", "ỿ", "γ", "у", "ү", "ყ", "ý", "ÿ", "ŷ", "ƴ", "ȳ", "ɏ", "ỳ"],
                           "z": ["ᴢ", "ź", "ż", "ž", "ƶ", "ȥ", "ɀ", "ẓ", "ⱬ"],
                           "2": ["ᒿ"],
                           "4": ["Ꮞ"],
                           "6": ["б", "Ꮾ"],
                           "8": ["৪", "੪", "ȣ", "𐌚"],
                           "9": ["੧", "୨", "৭"]}
    var qwerty_replaced_id = -1;
    var homograph_replaced_id = -1;
    $("#combosquatting_front").val("");
    $("#combosquatting_back").val("");
    $("#subdomain_front").val("");
    $("#subdomain_back").val("");
    $("#subdomain_sld").val("");

    $.ajax({
        "type": "GET",
        "url": "/is_step_finished/user_id/" + user_id + "/step_id/step2",
        "success": function(data) {
            if ($("#start").length) {
                $("#start").remove();
            }
            // remove experiment div
            $("#step2_experiment").remove();
            // set continue link visible
            $("#continue").css("display", "block");
            $("#continue_info").html("You already finished this step!");            
        }
    })

    // order the squatting technique buttons randomly
    var squatting_technique_buttons = $(".squatting_technique");
    for(var i = 0; i < squatting_technique_buttons.length; i++){
        var target = Math.floor(Math.random() * squatting_technique_buttons.length - 1) + 1;
        var target2 = Math.floor(Math.random() * squatting_technique_buttons.length - 1) + 1;
        squatting_technique_buttons.eq(target).before(squatting_technique_buttons.eq(target2));
    }

    var startExperiment = function() {
        // remove start button div
        $("#start").remove();
        // set experiment visible
        $("#step2_experiment").css("display", "block");
        // set last_click to current time
        last_click = (new Date()).getTime();
        // scroll squatting techniques div into view
        document.getElementById("squatting_techniques_wrapper").scrollIntoView();
    }

    var markAsSelected = function(elem) {
        // remove selected class from all neighboring elements
        elem.parent().find(".selected").each(function() {
            $(this).removeClass("selected");
            $(this).addClass("unselected");
        });

        // remove unselected class from this element and mark it as selected
        elem.removeClass("unselected");
        elem.addClass("selected");
    }

    /**
     * Split a domain into single characters and create an a element for each
     * character
     */
    var createCharacterSelection = function(div_elem) {
        $(div_elem).empty();
        for (var i=0; i < domain.split(".")[0].length; i++) {
            letter_elem = "<div class='unselected letter' id='" + i.toString() + "'>";
            letter_elem += domain.charAt(i);
            letter_elem += "</div>";
            $(div_elem).append(letter_elem);
        }
    }

    var updateCharacterSelection = function(letter_div_elem, success_elem) {
        character_id = parseInt(letter_div_elem.attr("id"), 10);
        markAsSelected(letter_div_elem);

        // display div with generated domain if it is not yet visible
        if (!$(success_elem).is(":visible")) {
            $(success_elem).css("display", "block");
        }

        return character_id
    }

    $("#start").click(function() {
        startExperiment();
    });

    var finish = function() {
        $("#step2_experiment").remove();
        $("#domain_selection").remove();
        $("#start").remove();
        $("#counter").html("10");
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

    // selection of reference domain

    $.ajax({
        "type": "GET",
        "url": "/step2/get_ref_domain",
        "success": function(data) {
            data = $.parseJSON(data);
            domain = data["ref_domain"];
            $("#selected_domain").html("<b>" + data["ref_domain"] + "</b>");
            $.ajax({
                "type": "GET",
                "url": "/step2/get_count/user_id/" + user_id,
                "success": function(data) {
                    data = $.parseJSON(data);
                    counter = data["counter"];
                    if (counter == 10) {
                        finish();
                    } else {
                        $("#start").css("display", "inline-block");
                    }
                }
            });
        }
    });

    // selection of domain squatting technique

    var handleCombosquatting = function() {
        var splitted_ref_domain = domain.split(".");
        var reference_sld = splitted_ref_domain[0];
        var reference_tld = "." + splitted_ref_domain.slice(1).join(".");

        // set reference sld and tld
        $("#reference_sld_combosquatting").html(reference_sld);
        $("#reference_tld_combosquatting").html(reference_tld);
    }

    $("#squatting_techniques div").click(function() {
        // hide all squatting technique divs
        $("#squatting_techniques_wrapper").children().css("display", "none");

        // in case there was already another technique selected,
        // remove the selected class and add the unselected class
        markAsSelected($(this));

        // get selected domain squatting technique
        squatting_technique = $(this).attr("id").split("_link")[0];

        // show div for the selected domain squatting technique
        $("#" + squatting_technique).css("display", "block");
        document.getElementById(squatting_technique).scrollIntoView();
        if (squatting_technique == "combosquatting") {
            handleCombosquatting();
        } else if (squatting_technique == "subdomain_usage") {
            $("#reference_domain_subdomain").html(domain);
        } else if (squatting_technique == "homograph") {
            createCharacterSelection("#replace_homograph_domain_letters");
        }
    });

    // typosquatting

    $("#typosquatting_techniques div").click(function() {
        // get selected typosquatting technique
        typo_technique = $(this).html();
        typo_technique = typo_technique.toLowerCase().replace(/ /g, "_");

        // in case there was already another technique selected,
        // remove the selected class and add the unselected class
        markAsSelected($(this));
        $("#typosquatting_techniques_wrapper").children().css("display", "none");

        // show div for the selected typosquatting technique
        $("#" + typo_technique).css("display", "block");
        document.getElementById(typo_technique).scrollIntoView();

        // depending on the typosquatting technique, prepare div
        if (typo_technique == "prepend_www") {
            created_domain = "www" + domain;
            $("#prepend_www_created_domain").html(" <b>www" + domain + "</b>");
        } else if (typo_technique == "omit_character") {
            // create an a element for each character if not already done
            createCharacterSelection("#omit_character_domain_letters");
        } else if (typo_technique == "swap_characters") {
            // create an a element for each character if not already done
            createCharacterSelection("#swap_characters_domain_letters");
        } else if (typo_technique == "replace_qwerty") {
            // create an a element for each character if not already done
            createCharacterSelection("#replace_qwerty_domain_letters");
        } else if (typo_technique == "duplicate_character") {
            // create an a element for each character if not already done
            createCharacterSelection("#duplicate_character_domain_letters");
        }
    });

    $(document).on("click", "#omit_character_domain_letters div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = updateCharacterSelection($(this), "#omit_character_success");

        // update generated domain
        created_domain = domain.slice(0, character_id) + domain.slice(character_id+1);
        $("#omit_character_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("omit_character_created_domain").scrollIntoView();
    });

    $(document).on("click", "#swap_characters_domain_letters div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = updateCharacterSelection($(this), "#swap_characters_success");
        if (character_id == domain.split(".")[0].length-1) {
            character_id -= 1;
        }

        // update generated domain
        created_domain = domain.substring(0, character_id) + domain.charAt(character_id+1) +
                         domain.charAt(character_id) + domain.substring(character_id+2);
        $("#swap_characters_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("swap_characters_created_domain").scrollIntoView();
    });

    $(document).on("click", "#replace_qwerty_domain_letters div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = parseInt($(this).attr("id"), 10);
        qwerty_replaced_id = character_id;
        markAsSelected($(this));

        // remove all a elements if some were already there
        if ($("#qwerty_replacements div").length != 0) {
            $("#qwerty_replacements").empty();
        }

        selected_character = domain.charAt(character_id);
        possible_qwerty_typos = qwerty_typos[selected_character];

        //splitted_domain = domain.split(".");
        for (var i=0; i < possible_qwerty_typos.length; i++) {
            div_elem = "<div class='unselected letter' id='" + i.toString() + "'>";
            div_elem += possible_qwerty_typos[i];
            div_elem += "</div>";
            $("#qwerty_replacements").append(div_elem);
        }
        document.getElementById("qwerty_replacements").scrollIntoView();
    });

    $(document).on("click", "#qwerty_replacements div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = updateCharacterSelection($(this), "#replace_qwerty_success");

        // update generated domain
        created_domain = domain.slice(0, qwerty_replaced_id) + $(this).text() +
                         domain.slice(qwerty_replaced_id+1);
        $("#replace_qwerty_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("replace_qwerty_created_domain").scrollIntoView();
    });

    $(document).on("click", "#duplicate_character_domain_letters div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = updateCharacterSelection($(this), "#duplicate_character_success");

        // update generated domain
        created_domain = domain.substring(0, character_id) + domain.charAt(character_id) +
                         domain.charAt(character_id) + domain.substring(character_id+1);
        $("#duplicate_character_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("duplicate_character_created_domain").scrollIntoView();
    });

    // combosquatting

    var getRandomCharacters = function(numberOfCharacters) {
        chars = "";
        if (numberOfCharacters == -1) {
            numberOfCharacters = Math.floor(Math.random() * Math.floor(2)) + 1;
        }
        for (i = 0; i < numberOfCharacters; i++) {
            char = characters[Math.floor(Math.random() * characters.length)];
            chars = char + chars;
        }

        return chars;
    }

    var getRandomTerm = function() {
        term = terms[Math.floor(Math.random() * terms.length)];

        return term;
    }

    $("#chars_before, #terms_before, #none_before,\
       #chars_behind, #terms_behind, #none_behind").click(function() {
        created_domain_before = "";
        created_domain_behind = "";
        splitted_domain = domain.split(".");
        if (created_combosquatting_domain != "") {
            splitted_created_domain = created_combosquatting_domain.split(".")[0].split(splitted_domain[0]);
            created_domain_before = splitted_created_domain[0];
            created_domain_behind = splitted_created_domain[1];
        }
        markAsSelected($(this));
        id = $(this).attr("id");
        // check if none_before and none_behind are both selected
        if (($("#none_before").hasClass("selected") && $("#none_behind").hasClass("selected")) ||
            ($("#none_before").hasClass("selected") &&
             !$("#chars_behind").hasClass("selected") &&
             !$("#terms_behind").hasClass("selected") &&
             !$("#none_behind").hasClass("selected"))) {
            $("#combosquatting_success").css("display", "none");
            $("#combosquatting_error").css("display", "block");
        } else {
            $("#combosquatting_success").css("display", "block");
            $("#combosquatting_error").css("display", "none");
        }
        // display menu for behind the well-known domain if item before was selected
        if (["chars_before", "terms_before", "none_before"].includes(id)) {
            $("#create_combosquatting_domain_behind").css("display", "block");
            document.getElementById("create_combosquatting_domain_behind").scrollIntoView();
        }
        if (id == "none_before") {
            created_domain_before = "";
        } else if (id == "chars_before") {
            created_domain_before = getRandomCharacters(-1);
        } else if (id == "terms_before") {
            created_domain_before = getRandomTerm() + "-";
        } else if (id == "none_behind") {
            created_domain_behind = "";
        } else if (id == "chars_behind") {
            created_domain_behind = getRandomCharacters(-1);
        } else if (id == "terms_behind") {
            created_domain_behind = "-" + getRandomTerm();
        }
        created_domain = created_domain_before + splitted_domain[0] + created_domain_behind + "." + splitted_domain[1];
        created_combosquatting_domain = created_domain;
        $("#combosquatting_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("combosquatting_created_domain").scrollIntoView();
    });

    // subdomain

    $("#subdomain_chars_before, #subdomain_terms_before, #subdomain_none_before,\
       #subdomain_chars_behind, #subdomain_terms_behind, #subdomain_none_behind").click(function() {
        created_domain_before = "";
        created_domain_behind = "";
        splitted_domain = domain.split(".");
        if (created_subdomain != "") {
            splitted_created_domain = created_subdomain.split(domain);
            created_domain_before = splitted_created_domain[0];
            if (splitted_created_domain[1] != ".test-domain.com") {
                created_domain_behind = splitted_created_domain[1].split(".test-domain.com")[0];
            }
        }
        created_domain = "";
        markAsSelected($(this));
        id = $(this).attr("id");
        $("#subdomain_success").css("display", "block");
        // display menu for behind the well-known domain if item before was selected
        if (["subdomain_chars_before", "subdomain_terms_before", "subdomain_none_before"].includes(id)) {
            $("#create_subdomain_behind").css("display", "block");
            document.getElementById("create_subdomain_behind").scrollIntoView();
        }
        if (id == "subdomain_none_before") {
            created_domain_before = "";
        } else if (id == "subdomain_chars_before") {
            created_domain_before = getRandomCharacters(5) + ".";
        } else if (id == "subdomain_terms_before") {
            created_domain_before = getRandomTerm() + ".";
        } else if (id == "subdomain_none_behind") {
            created_domain_behind = "";
        } else if (id == "subdomain_chars_behind") {
            created_domain_behind = "." + getRandomCharacters(5);
        } else if (id == "subdomain_terms_behind") {
            created_domain_behind = "." + getRandomTerm();
        }
        created_domain = created_domain_before + domain + created_domain_behind + ".test-domain.com";
//        if (created_domain_before != "") {
//            created_domain += created_domain_before + ".";
//        }
//        created_domain += domain;
//        if (created_domain_behind != "") {
//            created_domain += "." + created_domain_behind;
//        }
//        created_domain += ".test-domain.com";
        created_subdomain = created_domain;
        $("#subdomain_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("subdomain_created_domain").scrollIntoView();
    });

    // wrong TLD

    $("#wrong_tld_selection_button").click(function() {
        // display/hide dropdown menu for domain selection
        $("#dropdown_content_wrong_tld").toggle();
    });

    $("#dropdown_content_wrong_tld a").click(function() {
        // get selected domain
        tld = $(this).html();
        // get reference sld
        var splitted_ref_domain = domain.split(".");
        var reference_sld = splitted_ref_domain[0];

        // remove dropdown menu and replace it with the selected domain
        $("#dropdown_content_wrong_tld").toggle();
        
        // display domain squatting selection
        created_domain = reference_sld + "." + tld
        $("#wrong_tld_created_domain").html(" <b>" + created_domain + "</b>");
        $("#wrong_tld_success").css("display", "block");
        document.getElementById("wrong_tld_success").scrollIntoView();
    });

    // homograph

    $(document).on("click", "#replace_homograph_domain_letters div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = parseInt($(this).attr("id"), 10);
        homograph_replaced_id = character_id;
        markAsSelected($(this));

        // remove all a elements if some were already there
        if ($("#homograph_replacements div").length != 0) {
            $("#homograph_replacements").empty();
        }

        selected_character = domain.charAt(character_id);
        possible_homograph_chars = homograph_chars[selected_character];

        for (var i=0; i < possible_homograph_chars.length; i++) {
            div_elem = "<div class='unselected letter' id='" + i.toString() + "'>";
            div_elem += possible_homograph_chars[i];
            div_elem += "</div>";
            $("#homograph_replacements").append(div_elem);
        }
        document.getElementById("homograph_replacements").scrollIntoView();
    });

    $(document).on("click", "#homograph_replacements div", function() {
        // in case there was already another letter selected,
        // remove the selected class and add the unselected class
        character_id = updateCharacterSelection($(this), "#replace_homograph_success");

        // update generated domain
        created_domain = domain.slice(0, homograph_replaced_id) + $(this).text() +
                         domain.slice(homograph_replaced_id+1);
        $("#replace_homograph_created_domain").html(" <b>" + created_domain + "</b>");
        document.getElementById("replace_homograph_created_domain").scrollIntoView();
    });

    // send generated domain to server

    $("#next_domain_prepend_www,\
       #next_domain_omit_character,\
       #next_domain_swap_characters,\
       #next_domain_replace_qwerty,\
       #next_domain_duplicate_character,\
       #next_domain_combosquatting,\
       #next_domain_subdomain,\
       #next_domain_wrong_tld,\
       #next_domain_replace_homograph").click(function() {

        // measure elapsed time
        now = (new Date()).getTime();
        elapsed_time = now - last_click;

        var squatting_techniques_order = [];
        $(".squatting_technique").each(function() {
            technique = $(this).text().toLowerCase().replace(/ /g, "_");
            if (technique == "subdomain_usage") {
                technique = "subdomain";
            } else if (technique == "wrong_top-level_domain") {
                technique = "wrong_tld";
            }
            squatting_techniques_order.push(technique);
        });
        squatting_techniques_order = squatting_techniques_order.join(",");

        $.ajax({
            "type": "POST",
            "url": "/step2/result",
            "data": {"user_id": user_id,
                     "reference_domain": domain,
                     "squatting_technique": squatting_technique,
                     "created_domain": created_domain,
                     "squatting_techniques_order": squatting_techniques_order,
                     "elapsed_time": elapsed_time},
            "success": function(data) {
                // link to same page
                $("#continue_to_next_domain").css("display", "block");
                $("#step2_experiment").css("display", "none");
                /*
                window.location = "/step2/user_id/" + user_id;
                return false;
                */
            },
            "error": function() {
                $("#error_message").css("display", "block");
            }
        });
    });
});