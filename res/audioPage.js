/*eslint-env browser*/
var wordL=[];
var stopFlag=true;
var playFlag=true;
var nowPlay;
var Position={};

(function () {
    Position.getAbsolute = function (reference, target) {
        var result = {
            left: -target.clientLeft,
            top: -target.clientTop
        }
        var node = target;
        while(node != reference && node != document){
            result.left = result.left + node.offsetLeft + node.clientLeft;
            result.top = result.top + node.offsetTop + node.clientTop;
            node = node.parentNode;
        }
        if(isNaN(reference.scrollLeft)){
            result.right = document.documentElement.scrollWidth - result.left;
            result.bottom = document.documentElement.scrollHeight - result.top;
        }else {
            result.right = reference.scrollWidth - result.left;
            result.bottom = reference.scrollHeight - result.top;
        }
        return result;
    }
    Position.getViewport = function (target) {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        var absolutePosi = this.getAbsolute(document, target);
        var Viewport = {
            left: absolutePosi.left - scrollLeft,
            top: absolutePosi.top - scrollTop,
        }
        return Viewport;
    }
})();

function scrollWord(elem) {
    var rect=elem.getBoundingClientRect();
    var absoluteElementTop=rect.top+window.pageYOffset;
    window.scrollTo(0,absoluteElementTop-8-41*3);
}

function loopAudioPlay(elem,maxTimes,delayTime,finalEndEvent){
    if(!playFlag) {
        return ;
    }
    playFlag=false;
    elem.play();
    var start = 0;
    elem.addEventListener("ended",function() {
        if(!stopFlag) {
            elem.parentElement.className="word";
            stopFlag=true;
            playFlag=true;
            return;
        }
        start++;
        if( start<maxTimes ) {
            setTimeout(function(){elem.play();},delayTime);
        }
        else {
            elem.pause();
            elem.onended=null;
            playFlag=true;
            if(finalEndEvent) {
                finalEndEvent(elem);
            }
        }
    });
}

function playOnce(id) {
    var tgtAudio=document.getElementById("Audio"+id.slice(4));
    loopAudioPlay(tgtAudio,1,0,null);
}

function playLoop(id) {
    var tgtAudio=document.getElementById("Audio"+id.slice(4));
    var delay=Number(document.getElementById("delay").value);
    var times=Number(document.getElementById("rptTimes").value);
    loopAudioPlay(tgtAudio,times,tgtAudio.duration*1000*delay,null);
}

function autoContinue(curElem) {
    if(!stopFlag) {
        curElem.parentElement.className="word";
        stopFlag=true;
        return;
    }
    
    var nextAudio=document.getElementById("Audio"+String(Number(curElem.id.slice(5))+1));
    var delay=Number(document.getElementById("delay").value);
    var wordContainer=document.getElementById("wordContainer").children;
    var times=Number(document.getElementById("rptTimes").value);
    if(nextAudio.parentElement!=wordContainer[wordContainer.length-1]) {
        setTimeout(
            function() {
                scrollWord(nextAudio.parentElement);
                curElem.parentElement.className="word";
                nextAudio.parentElement.className="js-item-hover word";
                nowPlay=nextAudio.parentElement;
                loopAudioPlay(nextAudio,times,nextAudio.duration*1000*delay,autoContinue);
            },
            curElem.duration*1000*delay+100
        );
    }
    else {
        loopAudioPlay(nextAudio,times,nextAudio.duration*1000*delay,null);
    }
}

function autoStart(id) {
    if(!playFlag) {
        return ;
    }
    id=id.slice(4);
    var tgtAudio=document.getElementById("Audio"+id);
    var delay=Number(document.getElementById("delay").value);
    var wordContainer=document.getElementById("wordContainer").children;
    var times=Number(document.getElementById("rptTimes").value);
    scrollWord(tgtAudio.parentElement);
    tgtAudio.parentElement.className="word js-item-hover";
    nowPlay=tgtAudio.parentElement;
    if(tgtAudio.parentElement!=wordContainer[wordContainer.length-1]) {
        var stopBtn=document.getElementById("stopBtn");
        stopBtn.style.display="";
        stopBtn.addEventListener("click",function() {
            stopFlag=false;
            this.style.display="none";
        });
        
        loopAudioPlay(tgtAudio,times,tgtAudio.duration*1000*delay,autoContinue);
    }
    else {
        playLoop("loop"+id);
    }
}

function initWordList() {
    var wordCont=document.getElementById("wordContainer");
    var cNodes=wordCont.childNodes;
    for(var i=cNodes.length-1;i>=0;i--) {
        wordCont.removeChild(cNodes[i]);
    }
    
    var begin=document.getElementById("begin").value;
    var end=document.getElementById("end").value;
    for(i=begin-1;i<end;i++) {
        var wordT=document.querySelector("#wordRow");
        
        var wordText=wordT.content.querySelector(".wordText");
        wordText.innerHTML=wordL[i].slice(0,1).toUpperCase()+wordL[i].slice(1);
        
        var wordAudio=wordT.content.querySelector("audio");
        wordAudio.id="Audio"+i.toString();
        wordAudio.src="https://dict.youdao.com/dictvoice?audio="+wordL[i];
        
        var buttonPlay=wordT.content.querySelector(".Button.play");
        buttonPlay.id="Play"+i.toString();
            
        var buttonLoop=wordT.content.querySelector(".Button.loop");
        buttonLoop.id="Loop"+i.toString();
        
        var buttonDown=wordT.content.querySelector(".Button.down")
        buttonDown.id="Down"+i.toString();
        
        var clone=document.importNode(wordT.content,true);
        document.querySelector("#wordContainer").appendChild(clone);        
    }
    
    for(i=begin-1;i<end;i++) {

        
        buttonPlay=document.getElementById("Play"+i.toString());
        buttonPlay.addEventListener("click",function() {
            playOnce(this.id);
        });
        
        buttonLoop=document.getElementById("Loop"+i.toString());
        buttonLoop.addEventListener("click",function() {
            playLoop(this.id);
        });
        
        buttonDown=document.getElementById("Down"+i.toString());
        buttonDown.addEventListener("click",function() {
            autoStart(this.id);
        });
    }
}

function fileImport(listName) {
    listName=listName+".txt";
    var getFile=new XMLHttpRequest;
    getFile.open("GET","res/wordList/"+listName,true);
    getFile.onreadystatechange=function() {
        wordL=getFile.responseText.split("\n");
        for(var i=0;i<wordL.length;i++)
            wordL[i]=wordL[i].replace(/(^\s*)|(\s*$)/g, "");
        document.getElementById("begin").max=wordL.length
        document.getElementById("end").max=wordL.length

        document.getElementById("fileSelect").style.display="none";
        document.getElementById("wordList").style.display="";
    }
    getFile.send(null);
}

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
    
    document.getElementById("start").addEventListener("click",function() {
        initWordList();
    });
    
    document.getElementById("goBtn").addEventListener("click",function() {
        if(!selected) {
            alert("Please Choose One!");
        }
        else {
            fileImport(selected.id);
        }
    });
    
});