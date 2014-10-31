Tasks = new Mongo.Collection("tasks");

// simple-todos.js
if (Meteor.isServer) {
  // This code only runs on the client
}

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {createdAt: 1}});
    }


  });

  Template.body.events({
    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted

      var text = event.target.text.value;

      if (Match.test(text, String)){
        Tasks.insert({
          text: text,
          createdAt: new Date() // current time
        });
      } else {
        return "FAIL"
      };

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });
}
