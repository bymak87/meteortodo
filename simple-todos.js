//simple-todos.js

Tasks = new Mongo.Collection("tasks");

if(Meteor.isClient){
  // This code only runs on the client
  Meteor.subscribe("tasks");

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

Template.task.helpers({
  //Checks to see if the current user is the task owner
  isOwner: function () {
    return this.owner === Meteor.userId();
  }
});

Template.task.events({
  "click .toggle-checked": function (){
    //set the checked property to the opposite of its current value
    Meteor.call("setChecked", this._id, ! this.checked);
  },
  "click .delete": function (){
    Meteor.call("deleteTask", this._id);
  },
  //add an event for the new button to Template.task.events
  "click .toggle-private" : function (){
    Meteor.call("setPrivate", this._id, ! this.private);
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
    var task = Tasks.findOne(taskId);
    if(task.private && task.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked){
    var task = Tasks.findOne(taskId);
      if(task.private && task.owner !== Meteor.userId()){
        throw new Meteor.Error("not-authorized");
      }

    Tasks.update(taskId, { $set: {checked: setChecked} });
  },
  //Add a method to Meteor.methods called setPrivate
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);

    //Make sure only the task owner can make a task private
    if(task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { private: setToPrivate}});
  }

});
if(Meteor.isServer){
  Meteor.publish("tasks", function (){
    return Tasks.find({
      $or: [
      {private: {$ne: true}},
      {owner: this.userId}
      ]
    });
  });
}
