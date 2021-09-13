/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    let thisModel = this.model;

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                    }
                }
            }
            item.ondragstart = (ev) => {
                //console.log(this.model.currentList.items.indexOf(ev.target.innerHTML));
                //console.log(ev.target.innerHTML);
                //let oldIndex = this.model.currentList.items.indexOf(ev.target.innerHTML);
                ev.dataTransfer.setData("Text", ev.target.innerHTML)
            }
            item.ondragover = (ev) => {
                ev.preventDefault();
            }
            item.ondrop = (ev) => {
                //console.log(ev.target.id);
                //console.log(this.model.currentList.items.indexOf(ev.target.innerHTML));
                let newIndex = this.model.currentList.items.indexOf(ev.target.innerHTML);
                let oldIndex = this.model.currentList.items.indexOf(ev.dataTransfer.getData("Text"));
                //console.log(oldIndex);
                //console.log(newIndex);
                //this.model.currentList.moveItem(oldIndex, newIndex);
                this.model.addMoveItemTransaction(oldIndex, newIndex);
                //this.model.loadList(this.model.currentList.id);
                //console.log(this.model.currentList);
                this.model.saveLists();
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);

            //Update status bar
            document.getElementById("top5-statusbar").children[0].innerHTML = 
                this.model.getList(this.model.getListIndex(id)).getName();

            document.getElementById("add-list-button").disabled = true;
        }
        //FOR CHANGING THE LIST NAME
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            //console.log("a")
            document.getElementById("list-card-text-" + id).readOnly = false;
            let listModel = this.model;
            let clickedList = document.getElementById("top5-list-" + id);
            clickedList.children[0].addEventListener('keyup', function(event) {
                event.preventDefault();
                if (event.key === "Enter") {
                    listModel.changeListName(id, clickedList.children[0].value);
                    listModel.loadList(id);
                    listModel.saveLists();
                    document.getElementById("top5-statusbar").children[0].innerHTML = 
                        listModel.getList(listModel.getListIndex(id)).getName();
                    document.getElementById("list-card-text-" + id).readOnly = true;
                }
            })
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(this.model.getListIndex(id)).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                //console.log("b");
                modal.classList.remove("is-visible");
                this.model.deleteList(id);
                this.model.saveLists();
            }
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                //console.log("c");
                modal.classList.remove("is-visible");
            }
        }
        document.getElementById("close-button").onmousedown = (event) => {
            //console.log("d");
            this.model.unselectAll();
            document.getElementById("top5-statusbar").children[0].innerHTML = "";
            this.model.view.clearWorkspace();

            document.getElementById("add-list-button").disabled = false;
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}