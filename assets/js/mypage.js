(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCMg-FsPTzTeQ-ZwH2Dgc_evJ65m6RTbyg",
    authDomain: "my-blog-b629e.firebaseapp.com",
    databaseURL: "https://my-blog-b629e.firebaseio.com",
    projectId: "my-blog-b629e",
    storageBucket: "my-blog-b629e.appspot.com",
    messagingSenderId: "848407295598"
  };

  firebase.initializeApp(config);

  // Get a reference to the database service
  var database = firebase.database();

  // 테스트 완료!
  function testFirebase() {
    var postRefs = database.ref("posts/");
    postRefs.on('value', function(data) {
      console.log("firebase data: %o", data.val());

      var bData = data.val();

      // console.log(typeof bData[0] === "undefined")

      var totalCount = bData.length;
      if (typeof bData[0] === "undefined") {
        totalCount = totalCount - 1;
      }

      console.log("totalCount: ", totalCount);

      var html = "";
      bData.reverse().forEach(function(row, idx, arr) {
        if (typeof row !== "undefined") {
          html = html.concat("<tr>");
          html = html.concat("<td>" + (totalCount) + "</td>");
          html = html.concat("<td>" + row.title + "</td>");
          html = html.concat("<td>" + row.author + "</td>");
          html = html.concat("<td>" + row.hits + "</td>");
          html = html.concat("</tr>");
          totalCount -= 1;
        }
      });

      document.querySelector("#table-board").querySelector("tbody").innerHTML = html;

    });
  }

  testFirebase();

  alert('Hello!!!!!');
})();
