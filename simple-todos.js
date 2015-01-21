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

      Tasks.insert({
        text: text,
        createdAt: new Date(),               //current time
        owner: Meteor.userId(),             //_id of logged in user
        username: Meteor.user().username    //username of logged in user
      });
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
    Tasks.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function (){
    Tasks.remove(this._id);
  }
});


Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});
}
