/**
 * Created by Pavel on 02.12.2016.
 */

function prepareNoteFormAndFillNotes(place_name) {
    //TODO zmenit na podminku jestli ma ten user place u sebe nebo ne .. takhle to bere i mista co pridali ostatni
    checkIfPlaceAlreadyExistsInDb(place_name, function (place_id) {
        if(place_id != null && place_id != undefined){
            document.getElementById('addNote').addEventListener("click", function () {
                var addNoteDiv = document.getElementById("addNoteDiv");
                addNoteDiv.style = "display: block";
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

function removeNote(note_id) {
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notes/"+note_id+"/user/"+user_id;
    makeCorsRequest("DELETE", url, null, function (response) {
        console.log(response);
        getAndShowNotesForPlace(place_id);//refresh notes
    })
}

function getAndShowNotesForPlace(place_id) {
    var user_id = localStorage.getItem("id");
    var url = "https://ivebeenthereapi-matyapav.rhcloud.com/notesForPlace/"+place_id+"/user/"+user_id;
    makeCorsRequest("GET", url, null, function (response) {
        console.log(response);
        var notes = JSON.parse(response);
        var notesElement = document.getElementById('myNotes');
        notesElement.innerHTML = "";
        var index = 0;
        notes.forEach(function (note) {
            notesElement.innerHTML+="<b>"+note.name+"</b> "+note.content+" <a id='deleteNote"+index+"' style='cursor: pointer'>x</a> <br>"
            document.getElementById("deleteNote"+index).addEventListener("click", function () {
                removeNote(note._id);
            });
            index++;
        })
    })
}
