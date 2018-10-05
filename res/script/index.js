/*eslint-env browser*/

function changeClassName(nodeList,cName) {
    for(var i=0;i<nodeList.length;i++) {
        nodeList[i].className=cName;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    var selected=null;
    var optionList=document.getElementsByTagName("td");
    for(var i=0;i<optionList.length;i++) {    
        optionList[i].addEventListener("click",function(){
            if(selected==null) {
                selected=this;
                changeClassName(optionList,"");
                this.className="selected";
            }
            else if(selected==this) {
                this.className="";
                selected=null;
                changeClassName(optionList,"unclick");
            }
            else {
                changeClassName(optionList,"");
                selected=this;
                this.className="selected";
            }
        });
    }
    
    document.getElementById("goBtn").addEventListener("click",function() {
        if(!selected) {
            alert("Please Choose One!");
        }
        else {
            window.location.href="wordReader.html?wordList="+selected.id;
        }
    });
    
});