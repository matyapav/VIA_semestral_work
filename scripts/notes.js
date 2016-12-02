/**
 * Created by Pavel on 02.12.2016.
 */

function prepareNoteForm(place_name) {
    checkIfPlaceAlreadyExistsInDb(place_name, function (place_id) {
        if(place_id != null && place_id != undefined){
            document.getElementById('addNote').addEventListener("click", function () {
                var addNoteDiv = document.getElementById("addNoteDiv");
                addNoteDiv.innerHTML =
                    "<label for='note_name'>Název</label>" +
                    "<input id='note_name' type='text'><br>" +
                    "<label for='note_content'>Obsah</label>" +
                    "<input id='note_content' type='text'><br>" +
                    "<button id='add-note-submit-btn'>Přidat</button>";
                document.getElementById("add-note-submit-btn").addEventListener("click", function () {
                    var noteObj = {name: document.getElementById("note_name").value, content: document.getElementById("note_content").value}
                    console.log(noteObj);
                    addNoteToPlace(place_id, noteObj);
                })
            })
        }
    });
}
function addNoteToPlace(place_id, note) {
    var data = "&name="+note.name+"&content="+note.content;
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notesForPlace/"+place_id+"/user/"+user_id;
    makeCorsRequest("POST", url, data, function (response) {
        console.log(response);
    })
}

function removeNote(note_id) {
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notes/"+note_id+"/user/"+user_id;
    makeCorsRequest("DELETE", url, null, function (response) {
        console.log(response);
    })
}

function getNotesForPlace(place_id) {
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notesForPlace/"+place_id+"/user/"+user_id;
    makeCorsRequest("GET", url, null, function (response) {
        console.log(response);
        //TODO show notes
    })
}
