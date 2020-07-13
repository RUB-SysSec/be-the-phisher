// require necessary modules
var winston = require("winston");
var moment = require("moment");
var express = require("express");
var useragent = require('express-useragent');
var mysql = require("mysql");
var uuidv4 = require("uuid/v4");
var bodyParser = require("body-parser");

// create logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({filename: "/home/node/app/logs/server.log"})
    ]
});

// create app
var app = express();

// configure body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(useragent.express());

// serve static files
app.use("/css", express.static("css"));
app.use("/external", express.static("external"));
app.use("/scripts", express.static("scripts"));

// set template engine
app.set("views", "./views");
app.set("view engine", "pug");

// create database connection pool
var pool = mysql.createPool({
    connectionLimit: 50,
    host:            "database",
    user:            "homer",
    password:        "TEST",
    database:        "domain_user_study"
});

// function to check whether a user id exists
var checkUserId = function(res, user_id, callbackFunction) {
    pool.query("SELECT * FROM test_persons WHERE user_id='" + user_id + "';",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       if (rows.length == 0) {
                           res.redirect("/user_id_not_known");
                       } else {
                           callbackFunction();
                       }
                   }
               });
}

// function to set a step as finished
var setStepAsFinished = function(req, res, stepId) {
    column_name = "finished_" + stepId;
    // read user ID from request and update database
    user_id = req.body.user_id;
    pool.query("UPDATE test_persons SET " + column_name + " = True WHERE user_id='" + user_id + "';",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.sendStatus(200);
                   }
               })
}

// check if step is already finished
app.get("/is_step_finished/user_id/:user_id/step_id/:step_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    step_id = req.params["step_id"];
    column_name = "finished_" + step_id;
    pool.query("SELECT * FROM test_persons WHERE user_id='" + user_id + "' AND " + column_name + "='1'",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       if (rows.length == 1) {
                           res.sendStatus(200);
                       } else {
                           res.sendStatus(404);
                       }
                   }
               });
});

// request handling

// index
app.get("/", function (req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    // create one uuid as user ID and one as completion code and store it in the database
    user_id = uuidv4();
    completionCode = uuidv4();
    os = req.useragent.os;
    browser = req.useragent.browser;
    version = req.useragent.version;
    isMobile = req.useragent.isMobile;
    pool.query("INSERT INTO test_persons (user_id, completion_code, os, browser, version, is_mobile, finished_step1,\
                                          finished_step2, finished_step3, finished_step4, finished_questionnaire)\
                VALUES\
                ('" + user_id + "', '" + completionCode + "','" + os + "','" + browser + "','" + version + "'," + isMobile + ", False, False, False, False, False);",
               function(err, rows, fields) {        
                   if (err) {
                       logger.error(err);
                   } else {
                       res.render("index", {
                           "user_id": user_id
                       });
                   }
               });
});

// user_id not known error page
app.get("/user_id_not_known", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    res.render("user_id_not_known", {});
});

var sendBackNextDomain = function(err, rows, fields, res) {
    if (err) {
        logger.error(err);
    } else if (rows.length == 0) {
        // no more domains available because the participant classified all
        res.sendStatus(404);
    } else {
        res.setHeader("Content-Header", "application/json");
        res.send(JSON.stringify({"next_domain": rows[0].domain}))
    }
}

var selectNextDomain = function(res, user_id) {
    pool.query("SELECT * FROM test_domains WHERE test_domain_id NOT IN\
                  (SELECT test_domain_id FROM step1 WHERE test_person_id=\
                     (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')\
                   UNION\
                   SELECT test_domain_id FROM step4 WHERE test_person_id=\
                     (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')\
                  )\
                ORDER BY RAND() LIMIT 1",
                function(err, rows, fields) {
                    sendBackNextDomain(err, rows, fields, res);
                });
}

// get next domain for steps 1 and 4
app.get("/next_domain/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id,
        selectNextDomain.bind({}, res, user_id));
});

// step 1
app.get("/step1/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id, function() {
        res.render("step1", {
            "user_id": user_id,
            "step_id": "step1"
        });
    });
});

var insertIntoStep1 = function(req, res) {
    // read data from request and store it in database
    user_id = req.body.user_id;
    domain = req.body.domain;
    elapsed_time = req.body.elapsed_time;
    result = req.body.result === "true";
    pool.query("INSERT INTO step1 (test_person_id, test_domain_id, elapsed_time, result) VALUES\
                ((SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "'),\
                 (SELECT test_domain_id FROM test_domains WHERE domain='" + domain + "'), " +
                elapsed_time + "," + result + ");",
                function(err, rows, fields) {
                    if (err) {
                        logger.error(err);
                    } else {
                        res.sendStatus(200);
                    }
                });
}

app.post("/step1/result", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        insertIntoStep1.bind({}, req, res));
});

app.post("/step1/finished", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        setStepAsFinished.bind({}, req, res, "step1"));
});

// step 2

var renderStep2 = function(err, rows, fields, res, user_id, counter) {
    already_created_domains = [];
    for (row_number in rows) {
        already_created_domains.push(rows[row_number].domain);
    }
    res.render("step2", {
        "user_id": user_id,
        "counter": counter,
        "already_created_domains": already_created_domains
    });
}

var selectAlreadyCreatedDomains = function(err, rows, fields, res, user_id) {
    counter = rows[0]["count"];
    pool.query("SELECT domain FROM step2 WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   renderStep2(err, rows, fields, res, user_id, counter);
               });
}

var getCurrentCounter = function(req, res) {
    user_id = req.params["user_id"];
    pool.query("SELECT COUNT(*) as count FROM step2 WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   selectAlreadyCreatedDomains(err, rows, fields, res, user_id);
               });
}

app.get("/step2/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id,
        getCurrentCounter.bind({}, req, res));
});

app.get("/step2/get_ref_domain", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    pool.query("SELECT * FROM reference_domains\
                ORDER BY RAND() LIMIT 1;",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.setHeader("Content-Header", "application/json");
                       var data = {"ref_domain": rows[0].domain};
                       res.send(JSON.stringify(data));
                   }
               });
});

app.get("/step2/get_count/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    pool.query("SELECT COUNT(*) as count FROM step2 WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.setHeader("Content-Header", "application/json");
                       var data = {"counter": rows[0]["count"]};
                       res.send(JSON.stringify(data));
                   }
               });
})

var insertIntoStep2 = function(req, res) {
    user_id = req.body.user_id;
    ref_domain = req.body.reference_domain;
    squatting_technique = req.body.squatting_technique;
    created_domain = req.body.created_domain;
    elapsed_time = req.body.elapsed_time;
    squatting_techniques_order = req.body.squatting_techniques_order;
    pool.query("INSERT INTO step2 (test_person_id, reference_domain_id, squatting_technique, domain, elapsed_time, squatting_techniques_order) VALUES\
                ((SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "'),\
                 (SELECT reference_domain_id FROM reference_domains WHERE domain='" + ref_domain + "')," +
                 "'" + squatting_technique + "'," +
                 "'" + created_domain + "'," +
                 elapsed_time + "," +
                 "'" + squatting_techniques_order + "');",
                function(err, rows, fields) {
                    if (err) {
                        logger.error(err);
                    } else {
                        res.sendStatus(200);
                    }
                });
}

var checkDuplicatedDomain = function(req, res) {
    user_id = req.body.user_id;
    created_domain = req.body.created_domain;
    ref_domain = req.body.reference_domain;
    pool.query("SELECT * FROM step2 WHERE test_person_id=\
                  (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')\
                  AND domain='" + created_domain + "';",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else if (rows.length > 0 || created_domain == ref_domain) {
                       // the same domain was already created or is the same as the reference domain
                       res.sendStatus(404);
                   } else {
                       insertIntoStep2(req, res);
                   }
               });
}

app.post("/step2/result", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        checkDuplicatedDomain.bind({}, req, res));
});

app.post("/step2/finished", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        setStepAsFinished.bind({}, req, res, "step2"));
});

// step 3
app.get("/step3/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id, function() {
        res.render("step3", {"user_id": user_id});
    });
});

var selectRandomDomain = function(res, step2_domain, test_domain, count) {
    if (step2_domain.length == 0 && test_domain.length == 0) {
        res.sendStatus(404);
    } else {
        res.setHeader("Content-Header", "application/json");
        var data = {};
        randomNumber = Math.floor(Math.random() * 10);
        if (step2_domain.length == 0 || (randomNumber > 6 && test_domain.length != 0)) {
            data = {"next_domain": test_domain[0].domain,
                    "id": test_domain[0].test_domain_id,
                    "type": "test_domain",
                    "count": count};            
        } else {
            data = {"next_domain": step2_domain[0].domain,
                    "id": step2_domain[0].step2_id,
                    "type": "step2",
                    "count": count};            
        }
        res.send(JSON.stringify(data));
    }
}

var selectTestDomain = function(res, user_id, step2_domain, count) {
    pool.query("SELECT * FROM test_domains WHERE classification=1 AND test_domain_id NOT IN\
                  (SELECT test_domain_id FROM step3_test_domains WHERE test_person_id=\
                     (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')\
                  )\
                ORDER BY RAND() LIMIT 1;",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       selectRandomDomain(res, step2_domain, rows, count);
                   }
               });
}

var selectStep2Domain = function(res, user_id, count) {
    pool.query("SELECT * FROM step2 WHERE\
                   test_person_id != (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')\
                   AND step2_id NOT IN (SELECT step2_id FROM step3_step2_domains\
                                        WHERE test_person_id=(SELECT test_person_id FROM test_persons\
                                                              WHERE user_id='" + user_id + "')\
                                       )\
                ORDER BY RAND() LIMIT 1;",
                function(err, rows, fields) {
                    if (err) {
                        logger.error(err);
                    } else {
                        selectTestDomain(res, user_id, rows, count);
                    }
                });
}

var getRatedStep2DomainsCount = function(res, user_id, count) {
    pool.query("SELECT COUNT(*) as count FROM step3_step2_domains WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       selectStep2Domain(res, user_id, count + rows[0]["count"]);
                   }
               })
}

var getRatedTestDomainsCount = function(res, user_id) {
    pool.query("SELECT COUNT(*) as count FROM step3_test_domains WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       getRatedStep2DomainsCount(res, user_id, rows[0]["count"]);
                   }
               })
}

app.get("/step3/next_domain/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id,
        getRatedTestDomainsCount.bind({}, res, user_id));
});

var insertIntoStep3TestDomains = function(user_id, id, elapsed_time, rating, res) {
    pool.query("INSERT INTO step3_test_domains (test_person_id, test_domain_id, elapsed_time, rating)\
                VALUES (\
                  (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')," +
                  id + "," + elapsed_time + "," + rating +
               ")",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.sendStatus(200);
                   }
               });
}

var insertIntoStep3Step2Domains = function(user_id, id, elapsed_time, rating, res) {
    pool.query("INSERT INTO step3_step2_domains (test_person_id, step2_id, elapsed_time, rating)\
                VALUES (\
                  (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')," +
                  id + "," + elapsed_time + "," + rating +
               ")",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.sendStatus(200);
                   }
               });
}

var insertIntoStep3 = function(req, res) {
    user_id = req.body.user_id;
    id = req.body.id;
    type = req.body.type;
    rating = parseInt(req.body.rating, 10);
    elapsed_time = parseInt(req.body.elapsed_time, 10);
    if (type == "test_domain") {
        insertIntoStep3TestDomains(user_id, id, elapsed_time, rating, res);
    } else {
        insertIntoStep3Step2Domains(user_id, id, elapsed_time, rating, res);
    }
}

app.post("/step3/result", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    // read data from request and store it in database
    checkUserId(res, user_id,
        insertIntoStep3.bind({}, req, res));
});

app.post("/step3/finished", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        setStepAsFinished.bind({}, req, res, "step3"));
});

// step 4
app.get("/step4/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id, function() {
        res.render("step4",
            {
                "user_id": user_id,
                "step_id": "step4"
            });
    })
});

var insertIntoStep4 = function(req, res) {
    // read data from request and store it in database
    user_id = req.body.user_id;
    domain = req.body.domain;
    elapsed_time = req.body.elapsed_time;
    result = req.body.result === "true";
    pool.query("INSERT INTO step4 (test_person_id, test_domain_id, elapsed_time, result) VALUES\
                ((SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "'),\
                 (SELECT test_domain_id FROM test_domains WHERE domain='" + domain + "'), " +
                elapsed_time + "," + result + ");",
                function(err, rows, fields) {
                    if (err) {
                        logger.error(err);
                    } else {
                        res.sendStatus(200);
                    }
                });
}

app.post("/step4/result", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        insertIntoStep4.bind({}, req, res));
});

app.post("/step4/finished", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        setStepAsFinished.bind({}, req, res, "step4"));
});

// questionnaire
app.get("/questionnaire/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id, function() {
        res.render("questionnaire", {"user_id": user_id});
    });
});

var setQuestionnaireAsFinished = function(req, res) {
    // read user ID from request and update database
    user_id = req.body.user_id;
    pool.query("UPDATE test_persons SET finished_questionnaire = True WHERE user_id='" + user_id + "';",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       res.send(JSON.stringify({"user_id": user_id}));
                   }
               })
}

var insertIntoQuestionnaire = function(req, res) {
    // read data from request and store it in database
    user_id = req.body.user_id;
    age = req.body.age;
    gender = req.body.gender;
    education = req.body.education;
    origin = req.body.origin;
    f1 = req.body.f1;
    f2 = req.body.f2;
    f3 = req.body.f3;
    f4 = req.body.f4;
    f5 = req.body.f5;
    f6 = req.body.f6;
    f7 = req.body.f7;
    f8 = req.body.f8;
    f9 = req.body.f9;
    f10 = req.body.f10;
    f11 = req.body.f11;
    f12 = req.body.f12;
    f13 = req.body.f13;
    f14 = req.body.f14;
    f15 = req.body.f15;
    f16 = req.body.f16;
    attention_test1 = req.body.attention_test1;
    attention_test2 = req.body.attention_test2;
    phishing = req.body.phishing;
    phishing_description = "";//req.body.phishing_description;
    phishing_training = req.body.phishing_training;
    techniques = req.body.techniques;
    future = req.body.future;
    feedback = "";//req.body.feedback;
    pool.query("INSERT INTO questionnaire (test_person_id, age, gender, education, origin,\
                                           f1, f2, f3, f4, f5, f6, f7, f8, f9, f10,\
                                           f11, f12, f13, f14, f15, f16,\
                                           attention_test1, attention_test2,\
                                           phishing, phishing_description, phishing_training,\
                                           techniques, future, feedback)\
                VALUES (\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "')," +
                 "'" + age + "','" + gender + "','" + education + "','" + origin + "','" + f1 + "','" +
                 f2 + "','" + f3 + "','" + f4 + "','" + f5 + "','" + f6 + "','" + f7 + "','" +
                 f8 + "','" + f9 + "','" + f10 + "','" + f11 + "','" + f12 + "','" + f13 + "','" +
                 f14 + "','" + f15 + "','" + f16 + "','" + attention_test1 + "','" + attention_test2 + "','" +
                 phishing + "','" + phishing_description + "','" + phishing_training + "','" +
                 techniques + "','" + future + "','" + feedback + "');",
                function(err, rows, fields) {
                    if (err) {
                        logger.error(err);
                    } else {
                        setQuestionnaireAsFinished(req, res);
                    }
                });
}

var checkAlreadyInserted = function(req, res) {
    user_id = req.body.user_id;
    pool.query("SELECT COUNT(*) as count FROM questionnaire WHERE test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       count = rows[0]["count"];
                       if (count > 0) {
                           res.sendStatus(404);
                       } else {
                           insertIntoQuestionnaire(req, res);
                       }
                   }
               });
}

app.post("/questionnaire/results", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": POST " + req.url + " (" + JSON.stringify(req.body) + ")");
    user_id = req.body.user_id;
    checkUserId(res, user_id,
        checkAlreadyInserted.bind({}, req, res));
});

// final notes

var getCompletionCode = function(res, user_id, step1Results, step4Results) {
    pool.query("SELECT * FROM test_persons WHERE user_id='" + user_id + "';",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       completionCode = -1;
                       if (rows[0]["finished_step1"] &&
                           rows[0]["finished_step2"] &&
                           rows[0]["finished_step3"] &&
                           rows[0]["finished_step4"] &&
                           rows[0]["finished_questionnaire"]) {
                           completionCode = rows[0]["completion_code"];
                       }
                       res.render("final_notes", {
                           "user_id": user_id,
                           "finished_step1": rows[0]["finished_step1"],
                           "finished_step2": rows[0]["finished_step2"],
                           "finished_step3": rows[0]["finished_step3"],
                           "finished_step4": rows[0]["finished_step4"],
                           "finished_questionnaire": rows[0]["finished_questionnaire"],
                           "step1Results": step1Results,
                           "step4Results": step4Results,
                           "completionCode": completionCode
                       });
                   }
               });
}

var selectStep4Domains = function(res, user_id, step1Results) {
    pool.query("SELECT step4.test_person_id, step4.test_domain_id, step4.result,\
                test_domains.classification, test_domains.domain FROM step4\
                JOIN test_domains ON step4.test_domain_id = test_domains.test_domain_id\
                WHERE step4.test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       step4Results = [];
                       for (row_number in rows) {
                           row = rows[row_number];
                           if (row["classification"] != row["result"]) {
                               step4Results.push(row);
                           }
                       }
                       getCompletionCode(res, user_id, step1Results, step4Results);
                   }
               });
}

var selectStep1Domains = function(res, user_id) {
    pool.query("SELECT step1.test_person_id, step1.test_domain_id, step1.result,\
                test_domains.classification, test_domains.domain FROM step1\
                JOIN test_domains ON step1.test_domain_id = test_domains.test_domain_id\
                WHERE step1.test_person_id=\
                (SELECT test_person_id FROM test_persons WHERE user_id='" + user_id + "');",
               function(err, rows, fields) {
                   if (err) {
                       logger.error(err);
                   } else {
                       step1Results = [];
                       for (row_number in rows) {
                           row = rows[row_number];
                           if (row["classification"] != row["result"]) {
                               step1Results.push(row);
                           }
                       }
                       selectStep4Domains(res, user_id, step1Results);
                   }
               });
}

app.get("/final_notes/user_id/:user_id", function(req, res) {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": GET " + req.url);
    user_id = req.params["user_id"];
    checkUserId(res, user_id,
        selectStep1Domains.bind({}, res, user_id));
});

app.listen(5000, function () {
    logger.info(moment().format("YYYY-MM-DD HH:mm:ss") + ": Survey app listening on port 5000!");
});
