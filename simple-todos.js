//simple-todos.js
Tasks = new Mongo.Collection("tasks");

if(Meteor.isClient){
  // This code only runs on the client
  Template.body.helpers({
    tasks: function (){
      //if hide completed tasks is checked, filter tasks
      if (Session.get('hideCompleted')){
        return Tasks.find({checked: {$ne:true}}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    //otherwise return all tasks
    hideCompleted: function(){
      return Session.get('hideCompleted');
    },
    incompleteCount: function (){
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task" : function(event){
      //this function is called when the new task form is submitted
      var text = event.target.text.value;

      Meteor.call("addTask", text);
      //clear form
      event.target.text.value="";

      //prevent default form submit
      return false;
    },
    "change .hide-completed input": function (){
      Session.set("hideCompleted", event.target.checked);
    }
  });


Template.task.events({
  "click .toggle-checked": function (){
    //set the checked property to the opposite of its current value
    Meteor.call("setChecked", this._id, ! this.checked);
  },
  "click .delete": function (){
    Meteor.call("deleteTask", this._id);
  }
});


Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
 });
}

Meteor.methods({
  addTask: function (text){
    //make sure user is logged in before inserting a task
    if(! Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId){
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked){
    Tasks.update(taskId, { $set: {checked: setChecked} });
  }
});
