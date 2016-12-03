/**
 * Created by Pavel on 02.12.2016.
 */

function prepareNoteFormAndFillNotes(place_name) {
    checkIfPlaceIsInUserPlaces(place_name, function (place_id) {
        if(place_id != null && place_id != undefined){
            document.getElementById('addNote').addEventListener("click", function () {
                var addNoteDiv = document.getElementById("addNoteDiv");
                addNoteDiv.style = "display: block; text-align: center;";
                addNoteDiv.innerHTML =
                    "<h3>Nová poznámka</h3>"+
                    "<label for='note_name'>Název</label>" +
                    "<input id='note_name' type='text' class='form-control'><br>" +
                    "<label for='note_content'>Obsah</label>" +
                    "<textarea id='note_content' class='form-control' rows='5'></textarea><br>" +
                    "<button class='btn btn-primary' id='add-note-submit-btn'>Přidat</button>";
                document.getElementById("add-note-submit-btn").addEventListener("click", function () {
                    var noteObj = {name: document.getElementById("note_name").value, content: document.getElementById("note_content").value}
                    console.log(noteObj);
                    addNoteToPlace(place_id, noteObj);
                    //clear form
                    document.getElementById("note_name").value = "";
                    document.getElementById("note_content").value = "";
                })
                document.getElementById("note_name").focus();
            })
            getAndShowNotesForPlace(place_id);
        }
    });
}

function addNoteToPlace(place_id, note) {
    var data = "name="+note.name+"&content="+note.content;
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notesForPlace/"+place_id+"/user/"+user_id;
    makeCorsRequest("POST", url, data, function (response) {
        console.log(response);
        getAndShowNotesForPlace(place_id);//refresh notes
    })
}

function removeNote(note_id, place_id) {
    if(confirm("Do you really want to delete this note?")) {
        var user_id = localStorage.getItem("id");
        var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notes/" + note_id + "/user/" + user_id;
        makeCorsRequest("DELETE", url, null, function (response) {
            console.log(response);
            getAndShowNotesForPlace(place_id);//refresh notes
        })
    }
}

function getAndShowNotesForPlace(place_id) {
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notesForPlace/"+place_id+"/user/"+user_id;
    makeCorsRequest("GET", url, null, function (response) {
        console.log(response);
        var notes = JSON.parse(response);
        var notesElement = document.getElementById('myNotes');
        notesElement.innerHTML =
            "<h3>Moje poznámky</h3>"+
            "<table class='table table-striped'>"+
            "<thead>" +
            "<tr>" +
            "<th>Název</th>" +
            "<th>Obsah</th>" +
            "<th>Akce</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody id='myNotesTableBody'>"+
            "</tbody></table>";
        var index = 0;
        var tableBody = document.getElementById('myNotesTableBody');
        notes.forEach(function (note) {
            tableBody.innerHTML +=
                "<tr>"
                "<td>"+note.name+"</td>" +
                "<td>"+note.content+"</td>"+
                "<td><a id='deleteNote"+index+"' style='cursor: pointer'><span class='glyphicon glyphicon-remove'></span></a></td>"+
                "</tr>"
            document.getElementById("deleteNote"+index).addEventListener("click", function () {
                removeNote(note._id, place_id);
            });
            index++;
        })
    })
}
