Tasks = new Mongo.Collection("tasks");
Comments = new Mongo.Collection("comments");

// simple-todos.js
if (Meteor.isServer) {
    Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });

    Meteor.publish("comments", function () {
    return Tasks.find();
  });
}

if (Meteor.isClient) {
  // This code only runs on the client

  Meteor.subscribe("tasks");


  Template.body.helpers({
   tasks: function () {
    if (Session.get("hideCompleted")) {
      // If hide completed is checked, filter tasks
      return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
    } else {
      // Otherwise, return all of the tasks
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  },
  hideCompleted: function () {
    return Session.get("hideCompleted");
  },

    comments: function() {
      return Comments.find();
    },

  incompleteCount: function () {
    return Tasks.find({checked: {$ne: true}}).count();
    }

  });

  Template.task.helpers({
  isOwner: function () {
    return this.owner === Meteor.userId();
  }
});

  Template.body.events({
    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted

      var text = event.target.text.value;


      //validation to check if the value is a string
      //Match returns true if so
      if (Match.test(text, String)){
        Meteor.call("addTask", text);
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
    },

    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }    
  });

  Template.task.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Meteor.call("setChecked", this._id, ! this.checked);
  },
  "click .delete": function () {
    Meteor.call("deleteTask", this._id);
  },
  "click .toggle-private": function () {
    Meteor.call("setPrivate", this._id, ! this.private);
  }
});

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
    }
});