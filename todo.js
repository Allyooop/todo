Tasks = new Mongo.Collection("tasks");
Comments = new Mongo.Collection("comments");

// simple-todos.js
if (Meteor.isServer) {
  // This code only runs on the client
}

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {createdAt: 1}});
    },

    comments: function() {
      return Comments.find();
    }

  });

  Template.body.events({
    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted

      var text = event.target.text.value;


      //validation to check if the value is a string
      //Match returns true if so
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
    },

    "submit .comment": function (event){
      var name = event.target.name.value;
      var commentBody = event.target.thingy.value;

      Comments.insert({
        author: name,
        comment: commentBody,
        createdAt: new Date()
      });

    event.target.name.value = "";
    event.target.text.value = "";

    return false;
    }    
  });

  Template.task.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Tasks.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    Tasks.remove(this._id);
  }
});
}
