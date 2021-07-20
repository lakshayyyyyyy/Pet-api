var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
const cors = require('cors');
app.use(bodyParser.json());
var dateTime = require('node-datetime');
app.use(cors());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'dog_app'
});
app.use(express.json());
app.set('port', process.env.PORT || 4300);

app.get('/', function (req, res) {
    con.query("select * from users", function (err, result) {
        res.send(result);
    })
});

app.post('/login', function (req, res) {
    var sql = "select * from users where email=? and password=?";
    con.query(sql, [req.body.email, req.body.password], function (err, result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send(err);
        }
    });
});


app.post('/newpass', function (req, res) {
    var sql = "update users set password = ? where email= ?";
    con.query(sql, [req.body.password, req.body.email], function (err, result) {
        if (err) throw err;
        else {
            console.log(result);
            res.send(result);
        }
    })
})


app.post('/register', function (req, res) {
    var sql = "insert into users (email,password) values (?,?)";
    con.query(sql, [req.body.email, req.body.password], function (err, result) {
        res.send("done");
        con.query("select userid from users where email=?",[req.body.email],function(rq,response){
            if(response[0]){
                var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            console.log(userid); 
                con.query("insert into records_durations values (?,?,?,?,?,?,?)",[userid,576,48,12,744,72,720],function(requ,resp){
                    if(err) throw err;
                    else{
                        console.log("inserted");
                    }
                })
            }
            else{
                res.console("error");
            }

            con.query("insert  into basic_details (userid) values (?)",[userid],function(err,result){
                if(err) throw err;
                else{
                    console.log("done");
                }
            })
        })
        //add to basic details and to records durations 
    });
});

app.post('/basicdetails', function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        console.log(response[0]);
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            console.log(userid);
            var sql = "select * from basic_details where userid=?";
            con.query(sql, userid, function (err, result) {
                if (result) {
                    console.log(result);
                    res.json(result);
                }
                else {
                    res.send(err);
                }
            })
        }
        else {
            res.send("no data found");
        }
    })

})

app.post('/updatebasicdetails', function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        console.log(response[0]);
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            console.log(userid);
            var sql = "update  basic_details set dogname=?,dateofbirth=?,color=?,breed=?,gender=? where userid=?";
            con.query(sql, [req.body.dogname, req.body.dateofbirth, req.body.color, req.body.breed, req.body.gender, userid], function (err, result) {
                if (result) {
                    console.log(result);
                    res.json(result.body);
                }
                else {
                    res.send(err);
                }
            })
        }
        else {
            res.send("no data found");
        }
    })

});




app.post('/dailyrecords', function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        console.log(response[0]);
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            console.log(userid);
            var sql = "select * from daily_records where userid=? and type=?";
            con.query(sql, [userid, req.body.type], function (err, result) {
                if (result) {
                    console.log(result);
                    res.json(result);
                }
                else {
                    res.send(err);
                }
            })
        }
        else {
            res.send("no data found");
        }
    })

});

app.post('/medicalrecords', function (req, res) {
    console.log(req.body.email)
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        console.log(response);
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var sql = "select medical_detail.medicalid,medical_detail.date,medical_detail.title,medical_detail.description from medical_detail inner join medical_records on medical_records.medicalid=medical_detail.medicalid where medical_records.userid=? and medical_records.type=? order by medical_detail.date desc ";
            con.query(sql, [userid, req.body.type], function (err, result) {
                if (result) {
                    res.send(result);
                }
                else {
                    res.send(err);
                }
            })
        }
        else {

            res.send("no data found");
        }
    })

})


app.post('/specificmedicalrecords', function (req, res) {
    var sql = "select * from medical_detail where medicalid=?";
    con.query(sql, [req.body.medicalid], function (err, result) {
        if (result) {
            res.send(result);
        }
        else {
            res.send(err);
        }
    });

})

app.post('/updatespecificmedicalrecords', function (req, res) {
    console.log(req.body.description);
    var sql = "update  medical_detail set title=?,date=?,description=? where medicalid=?";
    con.query(sql, [req.body.title, req.body.date, req.body.description, req.body.medicalid], function (err, result) {
        if (result) {
            console.log(result);
            res.send(result);
        }
        else {
            res.send(err);
        }
    });

})

app.post('/deletespecificmedicalrecords', function (req, res) {
    var sql = "delete from medical_detail where medicalid=?";
    con.query(sql, [req.body.medicalid], function (err, result) {
        if (result) {
            con.query("delete from medical_records where medicalid=?", [req.body.medicalid], function (er, rsp) {
                if (rsp) {
                    console.log(rsp)
                    res.send(rsp);
                }
                else {
                    res.send(er)
                }
            })

        }
        else {
            res.send(err);
        }
    });

})



app.post('/addmedicalrecords', function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            console.log(userid);
            var sql = "insert into medical_records (userid,type,medicalid) values(?,?,?)";
            var medid = uuid.v1();

            console.log(medid)
            con.query(sql, [userid, req.body.type, medid], function (err, result) {
                if (result) {
                    con.query("insert into medical_detail (medicalid,title,description,date) values(?,?,?,?)", [medid, req.body.title, req.body.description, req.body.date], function (e, ans) {
                        if (ans) res.send(ans);
                        else console.log(err);
                    })
                }
                else {
                    res.send(err);
                }
            })
        }
        else {
            res.send("no data found");
        }
    })

});


app.post('/fitnessrecords', function (req, res) {
    console.log("ye vala")
    console.log(req.body.email);
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        console.log(response);
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var sql = "select * from daily_records where userid=? and type=? order by time desc";
            con.query(sql, [userid, req.body.type], function (err, result) {
                if (err) res.send(err)
                else {
                    res.send(result);
                }
            })
        }
        else
            res.send(err);
    });
});


app.post('/insertfitnessrecord', function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var sql = "insert into daily_records (userid,type,basicid,time,nexttime) values(?,?,?,?,?)";
            var id = uuid.v1();
            con.query(sql, [userid, req.body.type, id, req.body.time, req.body.nexttime], function (err, result) {
                if (err) {
                    res.send(err);
                }
                else {
                    console.log(result);
                    res.send(result);
                }
            });
        }
        else {
            res.send(err);
        }
    });
});



app.post('/updatenexttime', function (req, res) {
    con.query("update daily_records set nexttime=? where basicid =?", [req.body.nexttime, req.body.basicid], function (err, response) {
        if (err) {
            res.send(err);
        }
        else {
            console.log(response);
            res.send(response);
        }

    });
});



app.get("/discover", function (req, res) {
    con.query("select * from discover", function (err, result) {
        if (err) res.send(err);
        else res.send(result);
    })
})

app.post("/alldurations", function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            con.query("select * from records_durations where userid=?", [userid], function (err, result) {
                if (err) res.send(err);
                else res.send(result);

            })
        }
    })
})


app.post("/updateduration", function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var sql = "update records_durations set fitness=? , Bath=? ,Teeth=?,Hair=?,Nails=?,Ears=? where userid=?"
            con.query(sql, [req.body.fitness, req.body.Bath, req.body.Teeth, req.body.Hair, req.body.Nails, req.body.Ears, userid], function (err, result) {
                if (err) res.send(err);
                else res.send(result);

            })
        }
    })
})



app.post("/upcoming", function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var dt = dateTime.create();
            console.log(dt._now);
            con.query("select * from daily_records  where nexttime > ? and userid=? order by nexttime", [dt._now, userid], function (err, result) {
                if (err) res.send(err);
                else {
                    res.send(result);
                    console.log(result);
                }

            })
        }
        else {
            res.send(err);
        }

    })
})

app.post("/deleteparticularrecord", function (req, res) {
    con.query("delete from daily_records where basicid=?", [req.body.basicid], function (err, result) {
        if (err) res.send(err);
        else res.send(result);
        console.log(result)
    })
})


app.post("/addimage", function (req, res) {
    var buf = Buffer.from(req.body.image, 'base64');
    fs.writeFile(path.join(__dirname, '/public/', req.body.name), buf, function (error) {
        if (error) {
            throw error;
        } else {
            console.log('File created from base64 string!');
            con.query("select userid from users where email =?", [req.body.email], function (request, response) {
                if (response[0]) {
                    var string = JSON.stringify(response[0]);
                    var objectValue = JSON.parse(string);
                    userid = objectValue['userid'];
                    var sql = "update basic_details set image=? where userid=?";
                    con.query(sql, [req.body.name, userid], function (err, result) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            console.log(result);
                            res.send(result);
                        }
                    });
                }
                else {
                    res.send(err);
                }
            });
        }
    });

})





app.post("/getimage", function (req, res) {
    con.query("select userid from users where email =?", [req.body.email], function (request, response) {
        if (response[0]) {
            var string = JSON.stringify(response[0]);
            var objectValue = JSON.parse(string);
            userid = objectValue['userid'];
            var sql = "select image from basic_details where userid=?";
            con.query(sql, [userid], function (err, result) {
                if (err) {
                    throw (err);
                }
                var string = JSON.stringify(result[0]);
                    var objectValue = JSON.parse(string);
                    image = objectValue['image'];
                if(image==null){
                    res.send(null);
                }
                else {
                    fs.readFile(path.join(__dirname, '/public/', result[0].image), function (error, data) {
                        if (error) {
                            throw error;
                        } else {
                            var buf = Buffer.from(data);
                            var base64 = buf.toString('base64');
                            //console.log('Base64 of ddr.jpg :' + base64);
                            res.send(base64);
                        }
                    });
                }
            });
        }
        else {
            res.send(err);
        }
    });
})
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express Server listening on Port ' + app.get('port'));
});
