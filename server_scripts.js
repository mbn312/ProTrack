function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkAdmin() {
  fetch('/checkadmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project: getCookie("project")
    })
  })
  .then(response => response.json())
  .then(data => {
    var admin = data.data[0].admin;
    if (admin == getCookie("user")) {
      document.cookie = "admin=1;"
    } else {
      document.cookie = "admin=0;"
    }
  })
}

function regUser() {
  $.get("/regdata", function(data){      
    var user = data.data;
    var exists = false;
    var alert = "";

    for(i = 0; i < user.length ; i++) {
      if (user[i].username == username.value) {
        exists = true;
        alert += "Username already in use.\n";
        username.value = "";
      }
      if (user[i].email == emailAddress.value) {
        exists = true;
        alert += "Email already in use.\n";
        emailAddress.value = "";
      }
    }

    if (exists == true) {
      alert(alert);
      psw.value = "";
      cpsw.value = "";
    } else {
      fetch('/regdata', {
        method: 'POST',
        headers : { 
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
          username: username.value,
          password: psw.value,
          email: emailAddress.value,
          phone: phoneNumber.value,
          name: fullName.value
        })
      });
      window.location.replace("/login.html");
    }
  });
}


function login() {
  fetch('/login', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      username: uname.value
    })
  })
  .then(response => response.json())
  .then(data => {
    var pass = "";
    if (data.data[0] != undefined) {
      pass = data.data[0].password;
    }
    if (lpsw.value == pass && pass != "") {
      document.cookie = `user=${data.data[0].id};`;
      document.cookie = `username=${uname.value};`;
      window.location.replace("/userhome.html");
    } else {
      uname.value = "";
      lpsw.value = "";
      alert("Username or password is incorrect. Please try again.");
    }
  });
}

function createTask() {
    fetch('/taskcreator', {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json'
     },
        body: JSON.stringify({
         project: getCookie("project"),
         name: TaskName.value,
         numUsers: numUsers.value,
         description: TaskDescription.value,
         deadline: Deadline.value
      })
    })
    .then(response => response.json())
    .then(data => {
     var task_id = data.data[0].id;
      fetch('/updateprojecttasks', {
        method: 'POST',
        headers : { 
         'Content-Type': 'application/json'
       },
         body: JSON.stringify({
           project: getCookie("project"),
            task: task_id
        })
     })
    });
    setTimeout(() => window.location.replace("/projecthome.html"),100); 
}

function logOut() {
  document.cookie = "user=;";
  document.cookie = "username=;";
  document.cookie = "project=;";
  document.cookie = "admin=;";
  document.cookie = "task=;";
}

function checkProjectPass() {
  if(project_psw.value == project_cpsw.value) {
      createProject();
  } else {
      project_psw.value = "";
      project_cpsw.value = "";
      alert("Passwords do not match.");
  }
}

function createProject() {
  $.get("/project", function(data){      
      var project = data.data;
      var exists = false;
      var alert = "";
  
      for(i = 0; i < project.length ; i++) {
        if (project[i].project_name == projectName.value) {
          exists = true;
          alert += "Project name already in use.\n";
          projectName.value = "";
        }
      }
  
      if (exists == true) {
        alert(alert);
      } else {
        fetch('/project', {
          method: 'POST',
          headers : { 
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              user: getCookie("user"),
              name: projectName.value,
              description: projectDescription.value,
              password: project_psw.value
          })
        });
        window.location.replace("/userhome.html");
      }
    });
}

function joinProject() {

  fetch("/j_project", {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        project: pname.value
    })
  })
  .then(response => response.json())
  .then(data => {
    var pass = "";
    if (data.data[0] != undefined) {
      pass = data.data[0].password;
    }
    if (ppsw.value == pass && pass != "") {
      joinProject_db(data.data[0].id);
    } else {
      pname.value = "";
      ppsw.value = "";
      alert("Project name or password is incorrect");
    }
  });
}

function joinProject_db(id) {
  fetch('/joinproject_db', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        user: getCookie("user"),
        project_id: id
    })
  }) 
  setTimeout( () => window.location.replace("/userhome.html"), 100);
}

function getUserProjects() {
  fetch('/getUserProjects', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        user: getCookie("user")
    })
  })
  .then(response => response.json())
  .then(data => {
      var projects = data.data;
      var cards = `<tr>
                    <th> </th>
                    <th style="text-align:center"> Project Name </th>
                    <th style="text-align:center"> Project Description </th>
                    <th> </th>
                   </tr>`;
      for (i = 0; i < projects.length; i++) {
        cards += `<tr>
                  <td style="text-align:center"> <button style="color:white;background-color:rgb(228, 55, 55);border-radius:50%;height:25%;width:25%" onclick="removeProject(${projects[i].id})"> - </button> </td>
                  <td style="text-align:center"> ${projects[i].project_name} </td>
                  <td style="text-align:center"> ${projects[i].project_description} </td>
                  <td style="text-align:center"> <button class="myButton" onclick="openProject(${projects[i].id})"> Select </button> </td>
                  </tr>`;
      }
      document.getElementById('projecttable').innerHTML = cards;
  });
}

function loadEditor() {
  setTimeout(() => {
   var task_id = getCookie("task");;
    if (task_id != "") {
     fetch('/gettask', {
        method: 'POST',
        headers : { 
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
           id: task_id
       })
      })
      .then(response => response.json())
      .then(data => {
       var task = data.data[0];
        editTaskName.value = task.task_name;
        editNumUsers.value = task.users_needed;
        editTaskDescription.value = task.task_description;
        editDeadline.value = task.task_deadline.substring(0,10);
     });
   }
  },100);
}

function editTask() {
  var task_id = getCookie("task");
  if (task_id != "") {
    fetch('/edittask', {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({
        id: task_id,
        name: editTaskName.value,
        numUsers: editNumUsers.value,
        description: editTaskDescription.value,
        deadline: editDeadline.value
      })
    });
    window.location.replace("/taskdetails.html"); 
  }
}

function deleteTask() {
  fetch('/deletetask', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: getCookie("task")
    })
  })
  window.location.replace("/projecthome.html");
}

function phJumbotron() {
  var project_id = getCookie("project");
  fetch('/phjumbotron', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        project: project_id
    })
  })
  .then(response => response.json())
  .then(data => {
      var project = data.data[0];
      header = project.project_name + " Home Page"
      description = "Project description: " + project.project_description;
      document.getElementById("phj_header").innerHTML = header;
      document.getElementById("phj_description").innerHTML = description;
  });  
}

function openProject(project_id) {
  document.cookie = `project=${project_id};`;
  setTimeout(() => window.location.replace("/projecthome.html"), 100);
}

function removeProject(project_id) {

  fetch('/removeproject', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        user: getCookie("user"),
        project: project_id
    })
  });
  setTimeout( () => location.reload(), 100);
}

function createCards() {
  loadProgress();
  fetch('/createcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project: getCookie("project")
    })
  })
  .then(response => response.json())
  .then(data => {
    var tasks = data.data;
    var backlog_cards = "";
    var inprogress_cards = "";
    var completed_cards = "";
    var needed = 0;
    var users;

    for (i = 0; i < tasks.length ; i++) {
      needed = tasks[i].users_needed - tasks[i].user_count;
      users = tasks[i].current_users;
   
      if (tasks[i].status == "backlog" && users.includes(`${getCookie("username")}`)) {
        inprogress_cards += `<div class="card">
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                              <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                Current Users: ${users}<br>
                                Description: ${tasks[i].task_description}
                            </div>
                            <div class="row-group">
                                <button class="myButton" style="margin:2%" onclick="unclaimTask(${tasks[i].id})"> Unclaim </button>
                                <button class="myButton" onclick="viewTask(${tasks[i].id})"> Details </button> 
                                <button class="myButton" style="float:right;margin:2%" onclick="startComplete(${tasks[i].id})"> Complete </button> 
                            </div> 
                          </div>`
    } else if(tasks[i].status == "backlog") {
        backlog_cards += `<div class="card"> 
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                              <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                              Users Needed: ${needed}<br>
                              Current Users: ${users}<br>
                                Description: ${tasks[i].task_description}
                            </div>
                            <div class="row-group">
                              <button class="myButton" style="margin:2%" onclick="viewTask(${tasks[i].id})"> Details </button> 
                              <button class="myButton" style="float:right;margin:2%" onclick="getUsers(${tasks[i].id},${needed})"> Join </button> 
                            </div> 
                          </div>`
      } else if (tasks[i].status == "inprogress" && users.includes(`${getCookie("username")}`)) {
        inprogress_cards += `<div class="card">
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                              <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                Current Users: ${users}<br>
                                Description: ${tasks[i].task_description}
                            </div>
                            <div class="row-group">
                                <button class="myButton" style="margin:2%" onclick="unclaimTask(${tasks[i].id})"> Unclaim </button>
                                <button class="myButton" onclick="viewTask(${tasks[i].id})"> Details </button> 
                                <button class="myButton" style="float:right;margin:2%" onclick="startComplete(${tasks[i].id})"> Complete </button> 
                            </div> 
                          </div>`
      } else if (tasks[i].status == "inprogress") {
        inprogress_cards += `<div class="card">
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                              <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                Current Users: ${users}<br>
                                Description: ${tasks[i].task_description}
                            </div>
                            <div class="row-group">
                                <button class="myButton" style="margint:2%" onclick="viewTask(${tasks[i].id})"> Details </button>
                            </div> 
                          </div>`
      } else if (tasks[i].status == "completed" && users.includes(`${getCookie("username")}`)) {     
        completed_cards += `<div class="card">
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                                Description: ${tasks[i].task_description}
                            </div>
                            <div> 
                              <button class="myButton" style="float:right;margin:2%" onclick="getCurrentUsers(${tasks[i].id},${needed})"> Uncomplete </button>  
                              <button class="myButton" style="margin:2%" onclick="viewTask(${tasks[i].id})"> Details </button> 
                            </div> 
                          </div>`
      } else {
        completed_cards += `<div class="card">
                            <div class="card-body">
                              <h2 class="card-title">${tasks[i].task_name}</h2>
                              <hr class="my-4">
                                Description: ${tasks[i].task_description}
                            </div>
                            <div> 
                              <button class="myButton" style="margin:2%;" onclick="viewTask(${tasks[i].id})"> Details </button> 
                            </div> 
                          </div>`
      }
    }   
    document.getElementById("backlog").innerHTML = backlog_cards;
    document.getElementById("inprogress").innerHTML = inprogress_cards;
    document.getElementById("completed").innerHTML = completed_cards; 
  });
}

function claimTask(taskId,needed,users) {

  if (needed == 1) {
    var status = 'inprogress';
  } else {
    var status = 'backlog';
  }
  if (users.includes(getCookie("username"))){
    fetch('/updateclaimtask', {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({
          username: getCookie("username"),
          id: taskId,
          status: status
      })
    })
  } else {
    fetch('/addclaimtask', {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({
          username: getCookie("username"),
          id: taskId,
          status: status
      })
    })
  }
  setTimeout(() => createCards(), 100);
}

function unclaimTask(taskId) {
fetch('/unclaimtask', {
  method: 'POST',
  headers : { 
    'Content-Type': 'application/json'
  },
    body: JSON.stringify({
      username: getCookie("username"),
    id: taskId,
    status: 'backlog'
  })
})
setTimeout(() => createCards(), 100);
}

function uncompleteTask(taskId,needed,users) {
  if (needed == 0) {
    var status = 'inprogress';
  } else {
    var status = 'backlog';
  }
  fetch('/uncompletetask', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
   },
     body: JSON.stringify({
     id: taskId,
     status: status,
     current_users: users
    })
  })
  setTimeout(() => createCards(), 100);
}

function getCurrentUsers(taskId,needed) {
  fetch('/getcurrentusers', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      task: taskId
    })
  })
  .then(response => response.json())
  .then(data => {
    var users = data.data.current_users;
    uncompleteTask(taskId,needed,users);
  });
}

function startComplete(taskId) {
  fetch('/getcurrentusers', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      task: taskId
    })
  })
  .then(response => response.json())
  .then(data => {
    var users = data.data.current_users;
    completeTask(taskId,users);
  });
}



function getUsers(taskId,needed) {
  fetch('/getusers', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      task: taskId
    })
  })
  .then(response => response.json())
  .then(data => {
    var users = data.data[0];
    claimTask(taskId,needed,users.users);
  });
}

function completeTask(taskId,current_users) {
  fetch('/completetask', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: taskId,
      status: 'completed',
      current_users: current_users,
      bool: true
    })
  })
  setTimeout(() => createCards(), 100);
}

function viewTask(task_id) {
  document.cookie = `task=${task_id}`;
  setTimeout(()=>window.location.replace("/taskdetails.html"),50);
}

function loadTaskDetails() {
  var task_id = getCookie("task");
  fetch('/loadtaskdetails', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      task: task_id
    })
  })
  .then(response => response.json())
  .then(data => {
    var task = data.task_details;
    var activity = data.task_activity;

    document.getElementById("taskNameDetails").innerHTML = `${task.task_name}`;
    document.getElementById("taskDescriptionDetails").innerHTML = `${task.task_description}`;
    document.getElementById("taskDeadlineDetails").innerHTML = `${task.task_deadline.substring(0,10)}`;

    if (task.time_remaining == "00:00:00") {
      document.getElementById("taskTimeRemaining").innerHTML = `Past Deadline!`;
      document.getElementById("taskTimeRemaining").style.color = 'red';
    } else {
      document.getElementById("taskTimeRemaining").innerHTML = `${task.time_remaining}`;
      document.getElementById("taskTimeRemaining").style.color = 'black';
    }
    
    cards = "<tr><th> Username </th><th> Current </th><th> Started </th><th> Worktime </th></tr>";
    
    for(i = 0; i < activity.length; i++) {
      if(activity[i].current) {
        cards += `<tr> 
                   <td> ${activity[i].username} </td>
                   <td> Yes </td>
                   <td> ${activity[i].started.substring(0,10)} </td>
                   <td> ${activity[i].worktime} </td>
                  </tr>`
      } else {
        cards += `<tr> 
                   <td> ${activity[i].username} </td>
                   <td> No </td>
                   <td> ${activity[i].started.substring(0,10)} </td>
                   <td> ${activity[i].worktime} </td>
                  </tr>`
      }
    }
    document.getElementById("taskDetailsTable").innerHTML = cards;
  });
}

function toggleTaskActivity() {
  if(document.getElementById("taskDetailsTable").style.visibility == 'visible') {
    document.getElementById("taskDetailsTable").style.visibility = 'hidden';
    document.getElementById("taskActivityButton").innerHTML = "Show Activity";
  } else {
    document.getElementById("taskDetailsTable").style.visibility = 'visible';
    document.getElementById("taskActivityButton").innerHTML = "Hide";
  }
}
function loadUsersDropdown() {
  fetch('/loadusersdropdown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project: getCookie("project")
    })
  })
  .then(response => response.json())
  .then(data => {
    var users = data.data;
    var admin = data.admin;
    var cards = '<option selected value="select">----- Select User -----</option>';
    for (i = 0; i < users.length; i++) {
      if (users[i].id == admin) {
        cards += `<option value='${users[i].id}'> ${users[i].full_name} [Admin]</option>`;
      } else {
        cards += `<option value='${users[i].id}'> ${users[i].full_name} </option>`;
      }
    }
    document.getElementById("user_list").innerHTML = cards;
  });
}

function selectUser() {
  document.getElementById("message_box").style.visibility = 'hidden';
  var selected_user = user_list.value;
  if (selected_user != "select") {
    fetch('/getuserinfo', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
      body: JSON.stringify({
      user: selected_user,
      project: getCookie("project")
     })
   })
   .then(response => response.json())
   .then(data => {
     var user = data.data[0];
     var admin = data.admin;
    
      document.getElementById("selected_user_name").innerHTML = user.full_name;
      document.getElementById("selected_user_username").innerHTML = user.username;
      document.getElementById("selected_user_email").innerHTML = user.email;
      document.getElementById("selected_user_phone").innerHTML = user.phone;
      if (user.id == admin) {
       document.getElementById("admin").innerHTML = "<h2>Project Admin</h2>";
       document.getElementById("admin").style.visibility = 'visible';
     } else if (getCookie("admin") == 1) {
       document.getElementById("admin").innerHTML = `<input type="submit" value="Transfer Admin" class="btn btn-primary btn-block" onclick='transferAdmin(${user.id})'>`;
       document.getElementById("admin").style.visibility = 'visible';
     } else {
        document.getElementById("admin").style.visibility = 'hidden';
     }
     if(user.id != getCookie("user")) {
       document.getElementById("message_button").style.visibility = 'visible';
     } else {
       document.getElementById("message_button").style.visibility = 'hidden';  
     }
   });
  } else {
    document.getElementById("admin").style.visibility = 'hidden';
    document.getElementById("message_button").style.visibilty = 'hidden';
  }
}

function transferAdmin(id) {
  if(confirm("Confirm Admin Transfer")) {
    fetch('/transferadmin', {
     method: 'POST',
     headers: {
        'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       project: getCookie("project"),
        user: id
     })
   })
    document.cookie = "admin=0;"
    setTimeout(() => location.reload(),100);
  }
}

function loadProgress() {
  fetch('/loadprogress', {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project: getCookie("project")
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.total != 0) {
      var progress = parseInt((data.completed / data.total) * 100);
      document.getElementById("progress").innerHTML = `${progress}% Complete`;
      document.getElementById("progress").style.width = `${progress}%`;
    }
  })
}

function messageButton() {
  document.getElementById("message_from").innerHTML = `From: ${getCookie("username")}`;
  if (document.getElementById("message_box").style.visibility == 'visible') {
    clearMessage();
    document.getElementById("message_box").style.visibility = 'hidden';
  } else {
    document.getElementById("message_box").style.visibility = 'visible';
  }
}

function sendMessage() {
  var from = getCookie("username");
  var subject = document.getElementById("subject").value;
  var message = document.getElementById("message").value;
  var to = document.getElementById("selected_user_username").innerHTML;

  fetch('/sendmessage', {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: from,
      to: to,
      subject: subject,
      message: message
    })
  })
  clearMessage();
}

function clearMessage() {
  document.getElementById("subject").value = "";
  document.getElementById("message").value = "";
  document.getElementById("message_box").style.visibility = 'hidden';
}

function loadInbox() {
  fetch('/loadmessages', {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: getCookie("username"),
      option: 'to'
    })
  })
  .then(response => response.json())
  .then(data => {
    //TODO
  })
}

function loadSentMessages() {
  fetch('/loadmessages', {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: getCookie("username"),
      option: 'from'
    })
  })
  .then(response => response.json())
  .then(data => {
    //TODO
  })
}

function filterMessages() {
    //TODO
}