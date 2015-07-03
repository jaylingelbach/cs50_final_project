


Parse.initialize("9iJwPm0M4AeWLfLnuzbtP01wnmJfGRD7q3J1Ciyc", "Ho0Rh5AHSvjyXP1OnpSl4TXIqaWogf7xP2Af1LYc");

function showPage(pageId) {
  $(".page").hide();
  $(pageId).show();
}


showPage("#home");


$(window).on("hashchange", function(event){
  showPage(location.hash);
});

location.hash= "";
location.hash="#home";

// Globals ..extend("Table name")
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");
var userLoggedIn = Parse.User.current();
var userLoggedIn2 = userLoggedIn.get("username")
console.log(userLoggedIn2);
$("#user-logged-in").html("<small>Logged in as: </small> "+  userLoggedIn2);




/**
** Comment submit function
**/
$("#post-comment-form").submit(function(event){
  event.preventDefault();

  //at this point this is just a value from this field (postId/postComment) Needs to be modified into an object below.
  var postId= $("#post-comment-id").val();
  
  // make a new post object setting the id to the postId. This can be put into the post field on the comment table as a pointer.
  var post = new Post({id: postId});
  var output = "";
  var postComment = $("#post-comment").val();
  var comment = new Comment();
  var user = Parse.User.current();
  comment.set("content", postComment);
  comment.set("user", user);
  comment.set("post", post);
  comment.save({
    success: function(){
      //display comment
      console.log("Comment saved!");

    }, error: function(error){
        console.log("Comment save error: " + error.message);
    }

  });
  
});


/**
** Check Log in
**/

function checkLogin() {
  if(Parse.User.current()) {
     $("#current-user").html("User: " + Parse.User.current().get("username"));
  }
  else{
    $("#current-user").html(" ");
  }
    
}

checkLogin();
/**
** Log out
**/
$("#logout").click(function(event){
    Parse.User.logOut();
   console.log("Log out successful");
    checkLogin();
});

/**
** Sign up
**/
$("#signup").submit(function(event) {
  event.preventDefault();
  var user = new Parse.User();
  var name = $("#signup-username").val();
  var pass = $("#signup-password").val();
  var email = $("#email").val();
  var confirm = $("#signup-password2").val();
    
    if(pass === confirm){
      user.set("username", name);
      user.set("password", pass);
      user.set("email", email);
    }
    
    user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now..
      console.log("Sign up success");
      checkLogin();
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
  });
});


/**
** Log in
**/
$("#navbar").submit(function(event) {
  var name = $("#login-username").val();
  var pass = $("#login-password").val();
  Parse.User.logIn(name, pass, {
    success: function(user) {
      // Do stuff after successful login.
      var currentUser = Parse.User.current();
      checkLogin();
      console.log("Logged in");
    },
    error: function(user, error) {
      // The login failed. Check error to see why.
      console.log("Error: "+ error.message);
    }
  });
});

/**
** Post
**/    


$("#post-form").submit(function(event) {
  event.preventDefault();
  var title = $("#post-title").val();
  var content = $("#post-content").val();
  var user = Parse.User.current();
  if(user){
  var newPost = new Post();
  newPost.set("title", title);
  newPost.set("content", content);
  newPost.set("user", user);

  //get file from form input
  var fileElement = $("#post-file")[0];
  //filepath
  var filePath = $("#post-file").val();
  var fileName = filePath.split("\\").pop();
  //if there is a file to upload....
  if (fileElement.files.length > 0) {
    var file = fileElement.files[0] ;
    var newFile = new Parse.File(fileName, file);
    newFile.save({
      success: function(){
        checkLogin();
      },
      error: function(){
        console.log("File save error: " + error.message);
      } //.then is a parse function that after a function has run you can continue theFile is the saved file preceeding with an arbitrary name
      
      }).then(function(theFile){
        newPost.set("file", theFile);
        //save just like below
        newPost.save({
        success: function() {
        getPosts();
        },
        error: function(error) {
        console.log("Post save with file error: " + error.message);
        }  
      });
    });
} else {
      newPost.save({
      success: function() {
      console.log("Hooray!");
      getPosts();
      },
      error: function(error) {
      console.log("Post error: " + error.message);
      }  
    });
  }
}
  else{
    alert("You must be logged in to post!");
  }
  window.location.href = "#home";
});

/**
** function to get objectId to display ONE particular post and image.
**/

//when you click a post title it finds the id queries it and displays the title.
$("#list-posts").on("click", "a", function(event){
  event.preventDefault();
  var id = $(this).attr("href");
  
  var query = new Parse.Query(Post);
  query.equalTo("objectId", id);
  query.include("user");
  query.find({
    success: function(results) {
    //on success get the title, content, user,username and id.
    var title = results[0].get("title");
    var content = results[0].get("content");
    var user = results[0].get("user");
    var username = user.get("username");
    var id= results[0].id;
    var src = "";
    if(results[0].get("file")) {
      src = results[0].get("file").url();
      }

    //user jQuery to  insert
    $("#post-detail-title").html('Title: ' + title);
    $("#post-detail-author").html('Author: ' + username);
    $("#post-detail-content").html(content);
    //assign to attributed data-id in HTML
    $("#post-detail").attr("data-id",id);
    //inserting image and id
    $("#post-comment-id").val(id);
    $("#post-detail-image").attr("src", src);
       
    }, error: function(error){ 
      console.log(error.message);
      }
    });
});

/**
** function getPosts
**/

function getPosts(){
  var query = new Parse.Query(Post);
  query.include("user");
  query.include("post");
  query.descending("createdAt");
  query.find({
  success: function(results) {
    // results is an array of Parse.Object.
      var output = "";
      for(var i in results) {
        var title = results[i].get("title");
        var content = results[i].get("content");
        var user = results[i].get("user");
        var username = user.get("username");
        var id= results[i].id;
    //if there is a file save it to a var called file
    //add the file to the url
      var img ="";
      if(results[i].get("file")){
        var file = results[i].get("file");
        var url = file.url();
        img = "<img src='"+url+"'>";
      }
      if(results[i].get("username") === null){
        i++;
      }
      output += "<li>";
      output += "<h4>Title: "+ title+ "</h4>";
      output += "<small> Author: " + username +"</small>";
      output += "<br>"+"</br>";
      output += "<p>" + content +"</p>";
      output += img;
      output += "</li>";
      output += "<br/>" + "<br />";
    }
    $("#list-posts").html(output);

  },

    error: function(error) {
      // error is an instance of Parse.Error.
      console.log("Query error: " + error.message);
    }
  });

}

getPosts();

/**
** Function get comments things to fix. Show comments with associatedposts. Not all comments.
**/


function getComments(){
  

var query = new Parse.Query(Comment);
  query.include("user");
  query.include("post");
  var output = "";
  query.find({
    success: function(results) {

      // results is an array of Parse.Object.
      for(var i in results) {        
        var content = results[i].get("content");
        var user = results[i].get("user");
        var username = user.get("username");
        var id= results[i].id;
        


        output += "<li>";        
        output += "<small> Comment from: " + username +"</small>";
        output += "<p>" + content +"</p>";
        output += "</li>";
      }
      $("#list-comments").html(output);

    },

    error: function(error) {
      // error is an instance of Parse.Error.
      console.log("Query error: " + error.message);
    }
  });

}


