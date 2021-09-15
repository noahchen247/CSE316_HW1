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
        initModel.view.updateToolbarButtons(initModel);
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
            //document.getElementById("add-list-button").disabled = true;
            //document.getElementById("close-button").disabled = false;
            document.getElementById("top5-statusbar").children[0].innerHTML = newList.getName();
            this.model.view.updateToolbarButtons(this.model);
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

                    item.draggable = false;

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            //document.getElementById("undo-button").classList.remove("disabled");
                            this.model.view.updateToolbarButtons(this.model);
                            item.draggable = true;
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        //document.getElementById("undo-button").classList.remove("disabled");
                        this.model.view.updateToolbarButtons(this.model);
                        //this.model.restoreList();
                        item.draggable = true;
                    }
                }
            }
            item.ondragstart = (ev) => {
                ev.dataTransfer.setData("Text", ev.target.innerHTML)
            }
            item.ondragover = (ev) => {
                ev.preventDefault();
            }
            item.ondrop = (ev) => {
                let newIndex = this.model.currentList.items.indexOf(ev.target.innerHTML);
                let oldIndex = this.model.currentList.items.indexOf(ev.dataTransfer.getData("Text"));
                this.model.addMoveItemTransaction(oldIndex, newIndex);
                this.model.saveLists();
                //document.getElementById("undo-button").classList.remove("disabled");
                this.model.view.updateToolbarButtons(this.model);
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

            //document.getElementById("add-list-button").disabled = true;
            this.model.view.updateToolbarButtons(this.model);
        }
        //FOR CHANGING THE LIST NAME
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            document.getElementById("list-card-text-" + id).readOnly = false;
            let listModel = this.model;
            let clickedList = document.getElementById("top5-list-" + id);
            clickedList.children[0].style.backgroundColor = "white";
            clickedList.children[0].style.color = "black";
            clickedList.children[0].addEventListener('keyup', function(event) {
                event.preventDefault();
                if (event.key === "Enter") {
                    listModel.changeListName(id, clickedList.children[0].value);
                    listModel.loadList(id);
                    listModel.saveLists();
                    document.getElementById("top5-statusbar").children[0].innerHTML = 
                        listModel.getList(listModel.getListIndex(id)).getName();
                    document.getElementById("list-card-text-" + id).readOnly = true;
                    clickedList.children[0].style.backgroundColor = "transparent";
                }
            })
            clickedList.children[0].addEventListener("blur", function(event) {
                event.preventDefault();
                listModel.changeListName(id, clickedList.children[0].value);
                listModel.loadList(id);
                listModel.saveLists();
                document.getElementById("top5-statusbar").children[0].innerHTML = 
                    listModel.getList(listModel.getListIndex(id)).getName();
                document.getElementById("list-card-text-" + id).readOnly = true;
                clickedList.children[0].style.backgroundColor = "transparent";
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
            let deletemodel = this.model;
            modal.classList.add("is-visible");
            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                modal.classList.remove("is-visible");
                if (document.getElementById("top5-list-" + id).classList.contains("selected-list-card")) {
                    deletemodel.unselectAll();
                    document.getElementById("top5-statusbar").children[0].innerHTML = "";
                    deletemodel.view.clearWorkspace();
                    //document.getElementById("add-list-button").disabled = false;
                }
                this.model.deleteList(id);
                this.model.saveLists();
                deletemodel.view.updateToolbarButtons(deletemodel);
            }
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.unselectAll();
            document.getElementById("top5-statusbar").children[0].innerHTML = "";
            this.model.view.clearWorkspace();
            //document.getElementById("add-list-button").disabled = false;
            this.model.view.updateToolbarButtons(this.model);
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}