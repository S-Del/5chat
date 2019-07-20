let socketio = io();
$(function() {
  $("#message_form").submit(function() {
    let msg = $("#input_msg");
    socketio.emit("message", msg.val());
    msg.val("");
    return false;
  });

  socketio.on("message", function(msg) {
    $("#messages").append($("<li>").text(msg));
  });
});
