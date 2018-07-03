$(document).ready(function () {
  $(document).on("click", "#noted", function (event) {
    event.preventDefault();
    var id = $(this).data("id");

    console.log(id)
    var baseurl = window.location.origin;
    console.log("note text" + $("#" + id + "AA").val().trim())
    console.log("note id" + id);

    $.ajax({
      method: "POST",
      url: "/notes/" + id,
      data: {
        body: $("#" + id + "AA").val().trim()
      }
    })
      .done(function (data) {
        console.log(data)
        alert("Comment Added");
        $(".form-control").val("");
      })
  })
  $(document).on("click", "#viewNotes", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/notes/" + thisId
    })
      .then(function (data) {
        console.log(data);
        console.log(data);
        $(".noteDiv"+thisId).empty();

            if (data[0].note.length > 0) {
              data[0].note.forEach(element => {
                if(element.body.length > 0) {
                $(".noteDiv"+thisId).append(
                  "<li>"+element.body+"</li>"
                  )
                }
                console.log(element.body)
                
              });
              $('#myModal').modal('toggle')
          }
          else {
            $(".noteDiv"+thisId).append(
              "No notes for this article yet"
            );
            console.log("Second ran!");
          }
        

      });
  });
})
