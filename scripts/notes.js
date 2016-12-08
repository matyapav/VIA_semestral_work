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
                    "<label for='note_name'>Name</label>" +
                    "<input id='note_name' type='text' class='form-control' required><br>" +
                    "<label for='note_content'>Content</label>" +
                    "<textarea id='note_content' class='form-control' rows='5' required></textarea><br>" +
                    "<button class='btn btn-primary' id='add-note-submit-btn'>Add note</button>";
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
            "<h3>My notes for this place</h3>"+
            "<table id='myNotesTable' class='table table-striped'>"+
            "<thead>" +
            "<tr>" +
            "<th>Note name</th>" +
            "<th>Content</th>" +
            "<th>Actions</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>"+
            "</tbody></table>";
        var index = 0;

        var tableRef = document.getElementById('myNotesTable').getElementsByTagName('tbody')[0];
        notes.forEach(function (note) {
            // Insert a row in the table at row index 0
            var newRow   = tableRef.insertRow(tableRef.rows.length);
            var nameCell  = newRow.insertCell(0);
            var nameText  = document.createTextNode(note.name);
            var contentCell  = newRow.insertCell(1);
            var contentText  = document.createTextNode(note.content);
            var actionsCell  = newRow.insertCell(2);
            var deleteLink = document.createElement('a');
            deleteLink.setAttribute("id", "deleteNote"+index);
            deleteLink.setAttribute("style", "cursor: pointer");
            var actionsText  = document.createTextNode("Delete");
            nameCell.appendChild(nameText);
            contentCell.appendChild(contentText);
            deleteLink.appendChild(actionsText);
            actionsCell.appendChild(deleteLink);
            document.getElementById("deleteNote"+index).addEventListener("click", function () {
                removeNote(note._id, place_id);
            });
            index++;
        })
    })
}
