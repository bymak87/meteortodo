//simple-todos.js
Tasks = new Mongo.Collection("tasks");

if(Meteor.isClient){
  // This code only runs on the client
  Template.body.helpers({

  });
}