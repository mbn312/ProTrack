var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var pgp = require('pg-promise')();

var htmlPath = path.join(__dirname, '/');

let dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'protrack_db',
	user: 'postgres',
	password: 'postgres'
};

const isProduction = process.env.NODE_ENV === 'production';
dbConfig = isProduction ? process.env.DATABASE_URL : dbConfig;
let db = pgp(dbConfig);

//var db = pgp(dbConfig);

app.use(express.static(htmlPath));

//for registration.html

app.get('/regdata', function(req, res) {
	var query = `select * from users;`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });

});

app.post('/regdata', function(req, res) {
	var username = req.body.username;
	var name = req.body.name;
	var email = req.body.email;
	var phone = req.body.phone;
	var password = req.body.password;
	var insert = `insert into users(username, password, email, phone, full_name) values('${username}','${password}','${email}','${phone}','${name}');`;

	db.task('get-everything', task => {
        return task.batch([
            task.any(insert)
        ]);
	})
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

//for login.html

app.post('/login', function(req, res) {
    var username = req.body.username;
	var query = `select * from users where username = '${username}';`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });

});

//for taskcreator.html

app.post('/createcards', function(req, res) {
    var project = req.body.project;
	var query = `select *,cardinality(current_users) as user_count from tasks where id = ANY((select tasks from project where id = ${project})::int[]);`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });

});

app.post('/taskcreator', function(req, res) {

    var name = req.body.name;
    var numUsers = req.body.numUsers;
    var description = req.body.description;
    var deadline = req.body.deadline;
    var insert = `insert into tasks(task_name, users_needed, task_description, task_deadline) values('${name}','${numUsers}','${description}','${deadline}') returning id;`;

	db.task('get-everything', task => {
        return task.batch([
			task.any(insert)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });

});

app.post('/updateprojecttasks',function(req,res) {
    var project = req.body.project;
    var task = req.body.task;
    var query = `update project set tasks = tasks || '{${task}}' where id = ${project};`;
    
    db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .catch(err => {
        console.log('error',err);
        res.send({
            data: ''
        })
    });
});

//for projecthome.html

app.post('/phjumbotron', function(req, res) {
    var project = req.body.project;
	var query = `select project_name,project_description from project where id = ${project};`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/getcurrentusers',function(req,res) {
    var task = req.body.task;
    var query = `select current_users from tasks where id = ${task};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
        res.send({
            data: info[0][0].current_users
        })
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/getusers',function(req,res) {
    var task = req.body.task;
    var query = `select users from tasks where id = ${task};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
        res.send({
            data: info[0]
        })
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/updateclaimtask', function(req, res) {
    var username = req.body.username;
    var id = req.body.id;
    var status = req.body.status;
    var update = `update tasks set current_users = current_users || '{${username}}', users = (array_remove(users,'${username}') || '{${username}}'), status = '${status}' where id = ${id};`;
    var update1 = `update user_tasks set last_started = current_timestamp, current='true' where task_id = ${id} and username = '${username}';`;

	db.task('get-everything', task => {
        return task.batch([
            task.any(update),
            task.any(update1)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/addclaimtask', function(req, res) {
    var username = req.body.username;
    var id = req.body.id;
    var status = req.body.status;
    var update = `update tasks set current_users = current_users || '{${username}}', users = (array_remove(users,'${username}') || '{${username}}'), status = '${status}' where id = ${id};`;
    var insert = `insert into user_tasks(username,task_id) values('${username}',${id});`;

	db.task('get-everything', task => {
        return task.batch([
            task.any(update),
            task.any(insert)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/unclaimtask', function(req,res) {
    var username = req.body.username;
    var id = req.body.id;
    var status = req.body.status;
    var update = `update tasks set current_users = array_remove(current_users,'${username}'), status = '${status}' where id = ${id};`;
    var update1 = `update user_tasks set current = 'false', prev_worktime = (prev_worktime + (current_timestamp - last_started)) where task_id = ${id} and username='${username}';`;

    db.task('get-everything', task => {
        return task.batch([
            task.any(update),
            task.any(update1)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/uncompletetask', function(req, res) {
    var id = req.body.id;
    var status = req.body.status;
    var current_users = req.body.current_users;
    console.log(current_users);
    var update = `update tasks SET status = '${status}' WHERE id = ${id};`;
    var update1 = `update user_tasks set current = 'true', last_started = current_timestamp where task_id = ${id} and username = ANY((select current_users from tasks where id=${id})::VARCHAR(50)[]);`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(update),
            task.any(update1)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/completetask', function(req, res) {
    var id = req.body.id;
    var status = req.body.status;
    var current_users = req.body.current_users;
    var update = `update tasks SET status = '${status}' WHERE id = ${id};`;
    var update1 = `update user_tasks set current = 'false', prev_worktime = (prev_worktime + (current_timestamp - last_started)) where task_id = ${id} and username = ANY((select current_users from tasks where id=${id})::VARCHAR(50)[]);`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(update),
            task.any(update1)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/deletetask', function(req, res) {
    var id = req.body.id;
    var query = `delete from tasks WHERE id = ${id};`;
    var query1 = `delete from user_tasks where task_id = ${id};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query1)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

//for createproject.html

app.get('/project', function(req, res) {
	var query = `select * from project;`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });

});


app.post('/project', function(req, res) {
    var user = req.body.user;
    var name = req.body.name;
    var description = req.body.description;
    var password = req.body.password;
    var insert = `insert into project(project_name,project_description,password,admin,users) values ('${name}','${description}','${password}','${user}','{${user}}');`;
    var update = `update users set projects = array_append(projects,(select id from project where project_name = '${name}')) where id = ${user};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(insert),
            task.any(update)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

//for joinproject.html


app.post('/j_project', function(req,res) {
    var name = req.body.project;
    var query = `select id,password from project where project_name = '${name}';`;
    db.task('get-everything', task=> {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
        res.send({
            data: info[0]
        })
    })
    .catch(err => {
        console.log('error', err);
        res.send({
            data: ''
        })
    });
});

app.post('/joinproject_db', function(req, res) {
    var user = req.body.user;
    var project = req.body.project_id;
    var insert1 = `update users set projects = (array_remove(projects,${project}) || '{${project}}') where id = '${user}';`;
    var insert2 = `update project set users = (array_remove(users,${user}) || '{${user}}') where id = '${project}';`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(insert1),
            task.any(insert2)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});



//for userhome.html

app.post('/getUserProjects', function(req, res) {
    var user = req.body.user;
	var query = `select * from project where id = ANY((select projects from users where id = ${user})::int[]);`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/gettask', function(req, res) {
    var id = req.body.id;
	var query = `select * from tasks where id = ${id};`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
				data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/edittask', function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var numUsers = req.body.numUsers;
    var description = req.body.description;
    var deadline = req.body.deadline;
	var query = `update tasks set task_name = '${name}', users_needed = '${numUsers}', task_description = '${description}', task_deadline = '${deadline}' where id = ${id};`;
	db.task('get-everything', task => {
        return task.batch([
			task.any(query)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/removeproject', function(req, res) {
    var user = req.body.user;
    var project = req.body.project;

    var query1 = `update users set projects = array_remove(projects,${project}) where id = ${user};`;
    var query2 = `update project set users = array_remove(users,${user}) where id = ${project};`;

	db.task('get-everything', task => {
        return task.batch([
            task.any(query1),
            task.any(query2)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/loadusersdropdown', function(req,res) {
    var project = req.body.project;
    var query = `select * from users where id = ANY((select users from project where id = ${project})::int[]);`;
    var query1 = `select admin from project where id = ${project};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query1)
        ]);
    })
    .then(info => {
    	res.send({
                data: info[0],
                admin: info[1][0].admin
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
				data: ''
            })
    });
});

app.post('/getuserinfo', function(req,res) {
    var user = req.body.user;
    var project = req.body.project;
    var query = `select * from users where id = ${user};`;
    var query1 = `select admin from project where id = ${project};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query1)
        ]);
    })
    .then( data => {
    	res.send({
                data: data[0],
                admin: data[1][0].admin
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: '',
               admin: ''
            })
    });
});

app.post('/checkadmin', function(req,res) {
    var project = req.body.project;
    var query = `select admin from project where id=${project};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
    	res.send({
                data: info[0]
			})
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
});

app.post('/transferadmin', function(req,res) {
    var project = req.body.project;
    var user = req.body.user;
    var query = `update project set admin=${user} where id=${project};`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
});

app.post('/sendmessage', function(req,res) {
    var from = req.body.from;
    var to = req.body.to;
    var subject = req.body.subject;
    var message = req.body.message;
    var query = `insert into messages(sender,recipient,subject,message) values('${from}','${to}','${subject}','${message}');`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
});

app.post('/deletemessages', function(req,res) {
    var messages = req.body.messages;
    var query = `delete from messages where id = ANY(${messages})`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
});

app.post('/loadmessages', function(req,res) {
    var username = req.body.username;
    var option = req.body.option;
    var query = `select * from messages where ${option}='${username}';`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query)
        ]);
    })
    .then(info => {
        res.send({
            data: info[0]
        })
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
});

app.post('/loadprogress', function(req,res) {
    var project = req.body.project;
    var query = `select count(*) as total from tasks where id = ANY((select tasks from project where id = ${project})::int[]);`;
    var query1 = `select count(*) as completed from tasks where id = ANY((select tasks from project where id = ${project})::int[]) and status='completed';`;
    db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query1)
        ]);
    })
    .then(info => {
        res.send({
            total: info[0][0].total,
            completed: info[1][0].completed
        })
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
})

app.post('/loadtaskdetails', function(req,res) {
    var task = req.body.task;
    var query = `select *,(case when (task_deadline-current_timestamp) >= '0'::interval
                            then left((task_deadline-current_timestamp)::text,-7)
                            else ('0'::interval::text)
                            end) as time_remaining
                 from tasks 
                 where id=${task};`;
    
    var query1 = `select *, (case when (current)
                                then left(((current_timestamp - last_started) + prev_worktime)::text,-7)
                                else left(prev_worktime::text,-7)
                                end) as worktime
                    from user_tasks
                    where task_id=${task}`;


    db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(query1)
        ]);
    })
    .then(info => {
        res.send({
            task_details: info[0][0],
            task_activity: info[1]
        })
    })
    .catch(err => {
            console.log('error', err);
            res.send({
                data: ''
            })
    });
})

/*
var server = app.listen(3000, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log('listening on http://'+host+':'+port+'/');
});
*/
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
	console.log(`Express running → PORT ${server.address().port}`);
});

