"use strict";

// TASK CONTROLLER
var taskController = (function() {

    var Todo = function(id, task) {
        this.id = id;
        this.task = task;
    };

    var Done = function(id, task) {
        this.id = id;
        this.task = task;
    };

    var data = {
        allTasks: {
            todo: [],
            done: []
        }
    };

    return {
        addTask: function(type, tsk) {
            var newTask, ID;

            // Setting ID
            if (data.allTasks[type].length > 0) {
                ID = data.allTasks[type][data.allTasks[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create a task
            if (type === 'todo') {
                newTask = new Todo(ID, tsk);
            } else {
                newTask = new Done(ID, tsk);
            }
                
            // Push it into the data
            data.allTasks[type].push(newTask);

            // Persist data in localStorage
            this.persistData();

            // Return the new element
            return newTask;
        },

        editTask: function(type, id, task) {
            var task, ids, index;

            ids = data.allTasks[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            data.allTasks[type][index].task = task;

            // Persist data in localStorage
            this.persistData();
        },

        delTask: function(type, id) {
            var ids, index;

            ids = data.allTasks[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allTasks[type].splice(index, 1);
            }

            // Persist data in localStorage
            this.persistData();
        },

        getTask: function(type, id) {
            var task, ids, index;

            ids = data.allTasks[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            task = data.allTasks[type][index].task;
            return {
                id: id,
                task: task
            }
        },

        persistData: function() {
            localStorage.setItem('todo', JSON.stringify(data.allTasks.todo));
            localStorage.setItem('done', JSON.stringify(data.allTasks.done));
        },

        readStorage: function() {
            var storageTodo = JSON.parse(localStorage.getItem('todo'));
            var storageDone = JSON.parse(localStorage.getItem('done'));

            // Restore likes from the localStorage
            if (storageTodo || storageDone) {
                data.allTasks.todo = storageTodo;
                data.allTasks.done = storageDone;
            }

            return {
                todo: data.allTasks.todo,
                done: data.allTasks.done
            }
        }
    }
})();


// UI CONTROLLER
var UIController = (function() {
   
    var DOMclass = {
        taskInput: '.task-input',
        inputBtn: '.btn-add',
        todoContainer: '.todo__display-part.todo',
        doneContainer: '.todo__display-part.done',
        taskEdit: '.task__edit',
        editCheck: '.item__ok--btn'
    }

    return {
        getInput: function() {
            return {
                task: document.querySelector(DOMclass.taskInput).value 
            };
        },

        getEditInput: function(id) {
            var el = document.getElementById('todo-' + id);
            return {
                task: el.querySelector(DOMclass.taskEdit).value
            };
        },
        
        addListTask: function(type, obj) {
            var html, newHtml, element;

            if (type === 'todo') {
                element = DOMclass.todoContainer;
                html = '<div class="item clearfix" id="todo-%id%"><div class="item__task">%task%</div><input class="task__edit" type="text"><div class="action clearfix"><div class="item__check"><button class="item__check--btn blue"><ion-icon name="checkbox-outline"></ion-icon></button></div><div class="item__edit"><button class="item__edit--btn yellow"><ion-icon name="create"></ion-icon></button></div><div class="item__delete"><button class="item__delete--btn red"><ion-icon name="trash"></ion-icon></button></div></div><div class="action_none clearfix"><div class="item__ok"><button class="item__ok--btn green"><ion-icon name="checkmark"></ion-icon></button></div><div class="item__cancel"><button class="item__cancel--btn red"><ion-icon name="close"></ion-icon></button></div></div>';
            } else {
                element = DOMclass.doneContainer;
                html = '<div class="item clearfix" id="done-%id%"><div class="item__task finished">%task%</div><div class="action clearfix"><div class="item__check"><button class="item__check--btn yellow"><ion-icon name="refresh"></ion-icon></button></div><div class="item__delete"><button class="item__delete--btn red"><ion-icon name="trash"></ion-icon></button></div></div></div>';
            }
            
            // Replace variables of the html to data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%task%', obj.task);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        editListTask: function(id, task) {
            var el = document.getElementById('todo-' + id);
            el.childNodes[0].textContent = task;
            el.childNodes[0].classList.toggle('on');
        },

        fetchEditBtn: function(id) {
            var el = document.getElementById('todo-' + id);
            return el.querySelector(DOMclass.editCheck)
        },

        delListTask: function(id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        editToggle: function(id) {
            var el = document.getElementById(id);
            el.childNodes[0].classList.toggle('off');
            el.childNodes[1].classList.toggle('on');
            el.childNodes[2].classList.toggle('off');
            el.childNodes[3].classList.toggle('on');
        },

        getTaskToInput: function(id, task) {
            var el = document.getElementById('todo-' + id);
            el.querySelector(DOMclass.taskEdit).value = task;
        },

        clearFields: function() {
            var field;
            field = document.querySelector(DOMclass.taskInput);
            field.value = "";
        },
 
        getDOMclass: function() {
            return DOMclass;
        }
    }
})();


// APP CONTROLLER
var appController = (function(taskCtrl, UICtrl) {

    // Restore the tasks when page loaded
    var restoreData = function() {
        window.addEventListener('load', function() {
            // Restore the data
            var data = taskCtrl.readStorage();

            // Render on the UI
            if (data.todo) {
                data.todo.forEach(function(element) {
                    UICtrl.addListTask('todo', element)
                });
            }
            if (data.done) {
                data.done.forEach(function(element) {
                    UICtrl.addListTask('done', element)
                });
            }
        });
    }
    
    // Setup the event listeners
    var setEventListener = function() {
        var DOM = UICtrl.getDOMclass();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddTask);
        document.querySelector(DOM.todoContainer).addEventListener('click', ctrlManageTask);
        document.querySelector(DOM.doneContainer).addEventListener('click', ctrlManageTask);
    };

    var ctrlAddTask = function() {
        var input, newTask;

        // 1. Get the task info from textbox
        input = UICtrl.getInput();

        if (input.task !== "") {
            // 2. Add the item to the task controller
            newTask = taskCtrl.addTask('todo', input.task);

            // 3. Add the item into the UI
            UICtrl.addListTask('todo', newTask);

            // 4. Clear the fields of textbox
            UICtrl.clearFields();
        }
    };

    var ctrlManageTask = function(event) {
        var itemID, splitID, type, ID, action, task;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        action = event.target.parentNode.parentNode.className;

        if (itemID) {
            // Getting ID and type info 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Actions
            if (action === 'item__delete') {
            // Getting rid of the task
                // 1. Delete from the data
                taskCtrl.delTask(type, ID);

                // 2. Delete from UI
                UICtrl.delListTask(itemID);

            } else if (action === 'item__check') {
            // Toggling the task done or todo
                var changeTask;

                // 1. Getting the task info
                task = taskCtrl.getTask(type, ID);

                // 2. Adding data into the counterpart
                type === 'todo' ? changeTask = taskCtrl.addTask('done', task.task) : changeTask = taskCtrl.addTask('todo', task.task);

                // 3. Adding data in UI
                type === 'todo' ? UICtrl.addListTask('done', changeTask) : UICtrl.addListTask('todo', changeTask);
                
                // 4. Delete the before one
                taskCtrl.delTask(type, ID);

                // 5. Delete from UI
                UICtrl.delListTask(itemID);

            } else {
            // Modifying the task
                // 1. Change contents into input(UI)
                UICtrl.editToggle(itemID)

                // 2. Getting the original data and putting into the input
                task = taskCtrl.getTask('todo', ID);
                UICtrl.getTaskToInput(task.id, task.task);

                // 3. Change the data when editing the item
                var okBtn = UICtrl.fetchEditBtn(ID);
                okBtn.addEventListener('click', function() {
                    // Fetching a task from the textbox
                    var changedTask = UICtrl.getEditInput(ID);

                    if (changedTask.task !== "") {
                        // Add the item to the task controller
                        taskCtrl.editTask('todo', ID, changedTask.task);
            
                        // Change the UI
                        UICtrl.editListTask(ID, changedTask.task);
                    }
                })
            }
        }
    }

    return {
        init: function() {
            restoreData();
            setEventListener();
        }
    }
})(taskController, UIController);

appController.init();