function createCards() {
    $.get("/tasks", function(data) {
  
      var tasks = data.data;
      var backlog_cards = "";
      var inprogress_cards = "";
      var completed_cards = "";
  
      for (i = 0; i < tasks.length ; i++) {
        if(tasks[i].status == "backlog") {
          backlog_cards += `<div class="card"> 
                              <div class="card-body">
                                <h2 class="card-title">${tasks[i].task_name}</h2>
                                <hr class="my-4">
                                <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                  User Types: ${tasks[i].user_types}<br>
                                  Description: ${tasks[i].task_description}
                              </div>
                              <div class="row-group">
                                <button class="w3-button w3-circle w3-red" style="margin-left:1%" onclick="loadEditor(${tasks[i].id})"> Edit </button> 
                                <button class="w3-button w3-circle w3-red" style="margin-left:47%" onclick="claimTask(${tasks[i].id})"> Claim </button> 
                              </div> 
                            </div>`
        } else if (tasks[i].status == "inprogress") {
          inprogress_cards += `<div class="card">
                              <div class="card-body">
                                <h2 class="card-title">${tasks[i].task_name}</h2>
                                <hr class="my-4">
                                <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                  User Types: ${tasks[i].user_types}<br>
                                  Description: ${tasks[i].task_description}
                              </div>
                              <div class="row-group">
                                  <button class="w3-button w3-circle w3-red" style="margin-left:1%" onclick="unclaimTask(${tasks[i].id})"> Unclaim </button>
                                  <button class="w3-button w3-circle w3-red" onclick="loadEditor(${tasks[i].id})"> Edit </button> 
                                  <button class="w3-button w3-circle w3-red" style="margin-left:47%" onclick="completeTask(${tasks[i].id})"> Complete </button> 
                              </div> 
                            </div>`
        } else {
          completed_cards += `<div class="card">
                              <div class="card-body">
                                <h2 class="card-title">${tasks[i].task_name}</h2>
                                <hr class="my-4">
                                <p class="card-text">Deadline: ${tasks[i].task_deadline.substring(0,10)}<br>
                                  User Types: ${tasks[i].user_types}<br>
                                  Description: ${tasks[i].task_description}
                              </div>
                              <div> 
                                <button class="w3-button w3-circle w3-red" style="margin-left:1%" onclick="uncompleteTask(${tasks[i].id})"> Uncomplete </button> 
                                <button class="w3-button w3-circle w3-red" onclick="loadEditor(${tasks[i].id})"> Edit </button> 
                              </div> 
                            </div>`
        }
      }
      
      document.getElementById("backlog").innerHTML = backlog_cards;
      document.getElementById("inprogress").innerHTML = inprogress_cards;
      document.getElementById("completed").innerHTML = completed_cards;
    });
  }

function claimTask(taskId) {
  fetch('/taskstatus', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: taskId,
      status: 'inprogress'
    })
  })
  setTimeout(() => createCards(), 100);
}

function unclaimTask(taskId) {
  fetch('/taskstatus', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: taskId,
      status: 'backlog'
    })
  })
  setTimeout(() => createCards(), 100);
}

function uncompleteTask(taskId) {
  fetch('/taskstatus', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: taskId,
      status: 'inprogress'
    })
  })
  setTimeout(() => createCards(), 100);
}

function completeTask(taskId) {
  fetch('/taskstatus', {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
      id: taskId,
      status: 'completed'
    })
  })
  setTimeout(() => createCards(), 100);
}


