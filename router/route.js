var mysql = require('mysql');
var db_config = require('../db');
require('date-utils');



module.exports = function(app, fs, passport, upload)
{

     app.get('/',function(req,res){
        res.render('index',{
            title: "OOHJOO!",
        });
     });

     app.get('/alert/logIn_fail', function(req, res){
       res.render('alert/logIn_fail',{
         title: "OOHJOO!"
       });
    });


    app.post('/',
      passport.authenticate('local', {
        successRedirect: '/main',
        failureRedirect: '/alert/logIn_fail',
        failureFlash: false
      })
    );

     app.get('/main',function(req,res){
       if(typeof req.user == 'undefined'){
         console.log('Unauthorized access-main');
         res.redirect('/');
       } else {
         if(req.user.user_id){
           var home_check_show = false;
           today = new Date();
           var c_day = today.getDay();
           var c_hour = today.getHours();
           var c_min = today.getMinutes();
           if(c_day > 0 && c_day < 6) {
             if (c_hour == 15) {
               if (c_min > 29) {
                 home_check_show = true;
               }
             }
           } else {
             if (c_hour == 17) {
               if (c_min < 31) {
                 home_check_show = true;
               }
             }
           }
           var user = req.user;
           res.render('main',{
             title: "OOHJOO!",
             user:user,
             home_check_show:home_check_show
           });
         } else {
           console.log('Error'+err);
           return;
         }
       }
     });

     app.post('/write_note',function(req,res){
       var db = mysql.createConnection(db_config);
       var user_id = req.body.user_id;
       var content = req.body.content;
       var reg_date = req.body.reg_date;
       var isWrite = 1;
       var sql = 'INSERT INTO `note`(`note_id`, `content_text`, `note_date`)';
           sql += ' VALUES (?,?,?)';
       db.query(sql, [user_id, content, reg_date], function(err,results){
         if(err){
            console.error('mysql connection error');
            console.error(err);
            throw err;
         }
         db.end();
       });
       res.render('note_box',{
         user_id:user_id,
         content:content,
         reg_date:reg_date,
         isWrite:isWrite
       });
     });

     app.post('/view_note',function(req,res){
       var db = mysql.createConnection(db_config);
       var sql = 'SELECT * FROM `note` order by note_idx DESC';
       db.query(sql, function(err,rows){
         if(err){
           console.error('mysql connection error');
           console.error(err);
           throw err;
         }
         var notes = rows;
         var isWrite = 0;
         res.render('note_box',{
           notes:notes,
           isWrite:isWrite
         });
         db.end();
      });
     });

     app.post('/view_homework',function(req,res){
       var db = mysql.createConnection(db_config);
       var user_id = 'joonew';
       var sql = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
       db.query(sql, [user_id],function(err,rows){
         if(err){
           console.error('mysql connection error');
           console.error(err);
           throw err;
         }
         var joonew = rows[0];
         var user_id = req.body.user_id;
         var sql_s = 'SELECT * FROM `Stampcoin` WHERE `user_id`=?';
         db.query(sql_s, ['joonew'],function(err,rows){
           if(err){
             console.error('mysql connection error');
             console.error(err);
             throw err;
           }
           var checkedHomework = rows;
           res.render('homework/homework_page',{
             joonew:joonew,
             user_id:user_id,
             checkedHomework:checkedHomework
           });
        });
        db.end();
      });
     });

     app.post('/view_homework_box',function(req,res){
       var db = mysql.createConnection(db_config);
       var month = req.body.month;
       var sql = 'SELECT * FROM `Homework` WHERE month(isCreateDate) = ? order by homework_idx DESC';
       db.query(sql, [month],function(err,rows){
         if(err){
           console.error('mysql connection error');
           console.error(err);
           throw err;
         }
         var homeworks = rows;
         res.render('homework/homework_box',{
           homeworks:homeworks,
           session: req.session
         });
         db.end();
      });

     });

     app.post('/delete_note',function(req,res){
       var db = mysql.createConnection(db_config);
       var note_id = req.body.note_id;
       var notedate = req.body.notedate;
       var sql = 'DELETE FROM `note` WHERE `note_id` = ? and `note_date` = ?';
       console.log(note_id);
       console.log(notedate);
       db.query(sql, [note_id, notedate], function(err,rows){
         if(err){
           console.error('mysql connection error');
           console.error(err);
           throw err;
         }
      });
      var sql_s = 'SELECT * FROM `note` order by note_idx DESC';
      db.query(sql_s, function(err,rows){
        if(err){
          console.error('mysql connection error');
          console.error(err);
          throw err;
        }
        var notes = rows;
        var isWrite = 0;
        res.render('note_box',{
          notes:notes,
          isWrite:isWrite
        });
        db.end();
     });
   });


   app.post('/delete_homework',function(req,res){
     var db = mysql.createConnection(db_config);
     var homework_id = req.body.homework_id;
     var isCreateDate = req.body.homeworkdate;
     var sql = 'DELETE FROM `Homework` WHERE `homework_id` = ? and `isCreateDate` = ?';
     console.log(homework_id);
     console.log(isCreateDate);
     db.query(sql, [homework_id, isCreateDate], function(err,rows){
       if(err){
         console.error('mysql connection error');
         console.error(err);
         throw err;
       }
    });
    var filename = req.body.filename;
    var path_name = './static/img/uploads/' + filename;
    fs.unlink(path_name,
    function(err){
    if(err) throw err;
      console.log('파일을 정상적으로 삭제하였습니다.');
      }
    );

    var sql_s = 'SELECT * FROM `Homework` order by homework_idx DESC';
    db.query(sql_s, function(err,rows){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
      var homeworks = rows;
      res.render('homework/homework_box',{
        homeworks:homeworks
      });
      db.end();
   });
 });

     app.get('/auth/logout', function(req, res){
       req.logout();
       res.redirect('/');
     });


    app.post('/upload', upload.single('userfile'), function(req, res){
      var db = mysql.createConnection(db_config);
      var username = req.user.user_id;
      var filename = req.file.filename;
      var dt = new Date();
      var isCreateDate = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
      var sql = 'INSERT INTO `Homework`(`homework_id`, `content_image`, `isCreateDate`)';
          sql += ' VALUES (?,?,?)';
      db.query(sql, [username, filename, isCreateDate], function(err,results){
        if(err){
          console.error('mysql connection error');
          console.error(err);
          throw err;
        }
        console.log('homework input success');
      });
      var isHomeCheck = true;
      var sql_s = 'UPDATE `TEST` SET `isHomeCheck`= ? WHERE `user_id` = ?';
      db.query(sql_s, [isHomeCheck, username], function(err,results){
        if(err){
          console.error('mysql connection error');
          console.error(err);
          throw err;
        }
        console.log('isHomeCheck success');
        db.end();
      });
      res.redirect('/main');
  } );

  app.post('/stamp_coin',function(req,res){
    var db = mysql.createConnection(db_config);
    var user_id = 'joonew';
    var sql = 'SELECT * FROM `Stampcoin` WHERE `user_id` = ? order by point_idx DESC';
    db.query(sql, [user_id],function(err,rows){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
      var stampcoin = rows;
      res.render('stamp_coin',{
        stampcoin:stampcoin
      });
      db.end();
   });
  });


  app.post('/complete_homework',function(req,res){
    var db = mysql.createConnection(db_config);
    var homework_id = req.body.homework_id;
    var isCreateDate = req.body.homeworkdate;
    var isChecked = true;
    var sql = 'UPDATE `Homework` SET `isChecked`= ? WHERE `isCreateDate` = ?';
    console.log(homework_id);
    console.log(isCreateDate);
    db.query(sql, [isChecked, isCreateDate], function(err,rows){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
   });
   var stamp_change = 1;
   var stamp_total = parseInt(req.body.joonewstamp) + 1;
   var getExplain = '과제';
   var dt = new Date();
   var dt_2 = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
   var isCreateDate_s = dt_2.toString();
   var user_id = 'joonew';
   var sql_d = 'INSERT INTO `Stampcoin`(`user_id`, `stamp_change`, `stamp_total`,`isCreateDate`, `getExplain`) VALUES (?,?,?,?,?)';
   db.query(sql_d, [user_id, stamp_change, stamp_total, isCreateDate_s, getExplain], function(err,results){
     if(err){
       console.error('mysql connection error');
       console.error(err);
       throw err;
     }
     console.log('homework complete success');
   });
   var isHomeCheck = false;
   var sql_p = 'UPDATE `TEST` SET `stamp`= ?, `isHomeCheck`= ? WHERE `user_id` = ?';
   db.query(sql_p, [stamp_total, isHomeCheck, user_id], function(err,results){
     if(err){
       console.error('mysql connection error');
       console.error(err);
       throw err;
     }
     console.log('homework complete success');
   });
   var sql_s = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
   db.query(sql_s, [user_id],function(err,rows){
     if(err){
       console.error('mysql connection error');
       console.error(err);
       throw err;
     }
     var joonew = rows[0];
     var user_id = req.body.user_id;
     var sql_s = 'SELECT * FROM `Stampcoin` WHERE `user_id`=?';
				db.query(sql_s, ['joonew'],function(err,rows){
					if(err){
            console.error('mysql connection error');
            console.error(err);
            throw err;
					}
					var checkedHomework = rows;
					res.render('homework/homework_page',{
						joonew:joonew,
						user_id:user_id,
						checkedHomework:checkedHomework
					});
			 });
       db.end();
  });
});


app.post('/homework-change',function(req,res){
  var db = mysql.createConnection(db_config);
  var content = req.body.content;
  var user_id = 'joonew';
  var sql = 'UPDATE `TEST` SET `homework`= ? WHERE `user_id` = ?';
  db.query(sql, [content, user_id], function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
 });
 var sql_s = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
 db.query(sql_s, [user_id],function(err,rows){
     if(err){
       console.error('mysql connection error');
       console.error(err);
       throw err;
     }
     var joonew = rows[0];
     var user_id = req.body.user_id;
     var sql_s = 'SELECT * FROM `Stampcoin` WHERE `user_id`=?';
				db.query(sql_s, ['joonew'],function(err,rows){
					if(err){
            console.error('mysql connection error');
            console.error(err);
            throw err;
					}
					var checkedHomework = rows;
					res.render('homework/homework_page',{
						joonew:joonew,
						user_id:user_id,
						checkedHomework:checkedHomework
					});
			 });
       db.end();
  });
});

app.post('/stamp-minus',function(req,res){
  var db = mysql.createConnection(db_config);
  var getExplain = req.body.content;
  var isCreateDate = req.body.isCreateDate;
  var stamp_change = -1;
  var stamp_total = parseInt(req.body.joonewstamp) - 1;
  var user_id = 'joonew';
  var sql = 'INSERT INTO `Stampcoin`(`user_id`, `stamp_change`, `stamp_total`,`isCreateDate`, `getExplain`) VALUES (?,?,?,?,?)';
  db.query(sql, [user_id, stamp_change, stamp_total, isCreateDate, getExplain], function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
 });
 var sql_p = 'UPDATE `TEST` SET `stamp`= ? WHERE `user_id` = ?';
 db.query(sql_p, [stamp_total, user_id], function(err,results){
   if(err){
     console.error('mysql connection error');
     console.error(err);
     throw err;
   }
 });
 var sql_s = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
 db.query(sql_s, [user_id],function(err,rows){
     if(err){
       console.error('mysql connection error');
       console.error(err);
       throw err;
     }
     var joonew = rows[0];
     var user_id = req.body.user_id;
     var sql_s = 'SELECT * FROM `Stampcoin` WHERE `user_id`=?';
				db.query(sql_s, ['joonew'],function(err,rows){
					if(err){
            console.error('mysql connection error');
            console.error(err);
            throw err;
					}
					var checkedHomework = rows;
					res.render('homework/homework_page',{
						joonew:joonew,
						user_id:user_id,
						checkedHomework:checkedHomework
					});
			 });
       db.end();
  });
});

app.get('/coin_main',function(req,res){
  if(typeof req.user == 'undefined'){
    console.log('Unauthorized access-coin_main');
    res.redirect('/');
  } else {
    var db = mysql.createConnection(db_config);
    var user = req.user;
    var sql = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
    db.query(sql, [user.user_id],function(err,rows){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
      var user = rows;
      res.render('coin_main',{
        title: "OOHJOO!",
        user:user
      });
      db.end();
    });
  }
});

app.post('/stamp_to_coin',function(req,res){
  var db = mysql.createConnection(db_config);
  var user_id = req.body.userId;
  var dt = new Date();
  var dt_2 = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
  var isCreateDate_s = dt_2.toString();
  var sql = 'SELECT * FROM `TEST` WHERE `user_id` = ?';
  db.query(sql, [user_id],function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
    var user = rows;
    var userstamp = user[0].stamp;
    var usercoin = user[0].coin;
    var stamp_change = -5;
    var stamp_total = userstamp - 5;
    var coin_change = 1;
    var coin_total = usercoin + 1;
    var getExplain = '코인 교환';
    var sql_d = 'INSERT INTO `Stampcoin`(`user_id`, `stamp_change`, `stamp_total`, `coin_change`, `coin_total`, `isCreateDate`, `getExplain`) VALUES (?,?,?,?,?,?,?)';
    db.query(sql_d, [user_id, stamp_change, stamp_total, coin_change, coin_total, isCreateDate_s, getExplain], function(err,results){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
    });
    var sql = 'UPDATE `TEST` SET `stamp`= ?, `coin`= ? WHERE `user_id` = ?';
    db.query(sql, [stamp_total, coin_total, user_id],function(err,rows){
      if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
      }
      res.render('coin_main',{
         title: "OOHJOO!",
         user:user
      });
    });
    db.end();
  });
});


app.post('/coin_roulette',function(req,res){
  var user = req.user;
  var type = req.body.type;
  res.render('coin_roulette',{
     type:type,
     user:user
  });
});


app.post('/winning_gift',function(req,res){
  var db = mysql.createConnection(db_config);
  var user = req.user;
  var user_id = user.user_id;
  var use_coin = req.body.use_coin;
  var winning_gift = req.body.winning_gift;
  var type = req.body.type;
  var dt = new Date();
  var dt_2 = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
  var isCreateDate = dt_2.toString();
  var sql = 'INSERT INTO `Gift`(`user_id`, `gift_content`, `use_coin`, `isCreateDate`) VALUES (?,?,?,?)';
  db.query(sql, [user_id,winning_gift,use_coin,isCreateDate],function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
  });
  var coin_change = (-1)*use_coin;
  var coin_total = user.coin + coin_change;
  var getExplain = use_coin + ' Coin 룰렛';
  var sql_s = 'INSERT INTO `Stampcoin`(`user_id`, `coin_change`, `coin_total`, `isCreateDate`, `getExplain`) VALUES (?,?,?,?,?)';
  db.query(sql_s, [user_id,coin_change,coin_total,isCreateDate,getExplain],function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
  });
  var sql_d = 'UPDATE `TEST` SET `coin`= ? WHERE `user_id` = ?';
  db.query(sql_d, [coin_total, user_id],function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
    res.render('coin_roulette',{
       user:user,
       type:type
    });
  });
  db.end();
});

app.post('/coin_gift_list',function(req,res){
  var db = mysql.createConnection(db_config);
  var user_id = 'joonew';
  var sql = 'SELECT * FROM `Gift` WHERE `user_id` = ? order by gift_idx DESC';
  db.query(sql, [user_id],function(err,rows){
    if(err){
      console.error('mysql connection error');
      console.error(err);
      throw err;
    }
    var coin_gift = rows;
    res.render('coin_gift_list',{
      coin_gift:coin_gift
    });
    db.end();
 });
});







// is to redirect / should be in last
  app.get('*', function(req, res) {
    if(typeof req.user == 'undefined'){
      console.log('Unauthorized access-not_defined_url_a');
      res.redirect('/');
    } else {
      res.redirect('/main');
    }
  });
};
