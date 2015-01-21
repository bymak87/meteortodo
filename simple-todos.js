//simple-todos.js
Tasks = new Mongo.Collection("tasks");

if(Meteor.isClient){
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({});
    }
  });

  Template.body.events({
    "submit .new-task" : function(event){
      //this function is called when the new task form is submitted
      var text = event.target.text.value;

      Tasks.insert({
        text: text,
        createdAt: new Date()
      });
      //clear form
      event.target.text.value="";

      //prevent default form submit
      return false;
    }
  });
  Template.body.helpers({
    tasks: function(){
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  });
}
