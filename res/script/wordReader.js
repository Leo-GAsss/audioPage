/*eslint-env browser*/

window.wordL=[];
window.stopFlag=false;
window.playFlag=true;
window.Position={};

(function () {
    window.Position.getAbsolute = function (reference, target) {
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
    window.Position.getViewport = function (target) {
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

function getQueryString(name) {
    var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

function scrollWord(elem) {
    var rect=elem.getBoundingClientRect();
    var absoluteElementTop=rect.top+window.pageYOffset;
    window.scrollTo(0,absoluteElementTop-8-41*3);
}

function genEndEvent(maxTimes,delayTime,finalEndEvent) {
    var start=0;
    function endEvent() {
        if(window.stopFlag) {
            this.parentElement.className="word";
            window.stopFlag=false;
            window.playFlag=true;
            return;
        }
        start++;
        if(start<maxTimes) {
            setTimeout(function(elem) {
                return function() {
                    elem.play();
                }
            }(this),delayTime);
        }
        else {
            this.pause();
            this.removeEventListener("ended",endEvent);
            window.playFlag=true;
            if(finalEndEvent) {
                finalEndEvent(this);
            }
        }
    }
    return endEvent;
}

function loopAudioPlay(elem,maxTimes,delayTime,finalEndEvent){
    if(!window.playFlag) {
        return ;
    }
    window.playFlag=false;
    elem.play();
    elem.addEventListener("ended",genEndEvent(maxTimes,delayTime,finalEndEvent));
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
    if(window.stopFlag) {
        curElem.parentElement.className="word";
        window.stopFlag=false;
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
                loopAudioPlay(nextAudio,times,nextAudio.duration*1000*delay,autoContinue);
            },
            curElem.duration*1000*delay+100
        );
    }
    else {
        setTimeout(
            function() {
                curElem.parentElement.className="word";
                nextAudio.parentElement.className="js-item-hover word";
                loopAudioPlay(nextAudio,times,nextAudio.duration*1000*delay,function(lastElem) {
                    lastElem.parentElement.className="word";
                    var stopBtn=document.getElementById("stopBtn");
                    stopBtn.style.display="none";
                    window.stopFlag=false;
                    window.playFlag=true;
                });
            },
            curElem.duration*1000*delay+100
        );
    }
}

function autoStart(id) {
    if(!window.playFlag) {
        return ;
    }
    id=id.slice(4);
    var tgtAudio=document.getElementById("Audio"+id);
    var delay=Number(document.getElementById("delay").value);
    var wordContainer=document.getElementById("wordContainer").children;
    var times=Number(document.getElementById("rptTimes").value);
    scrollWord(tgtAudio.parentElement);
    tgtAudio.parentElement.className="word js-item-hover";
    if(tgtAudio.parentElement!=wordContainer[wordContainer.length-1]) {
        var stopBtn=document.getElementById("stopBtn");
        stopBtn.style.display="";
        stopBtn.addEventListener("click",function() {
            window.stopFlag=true;
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
        wordText.innerHTML=window.wordL[i].slice(0,1).toUpperCase()+window.wordL[i].slice(1);
        
        var wordAudio=wordT.content.querySelector("audio");
        wordAudio.id="Audio"+i.toString();
        wordAudio.src="https://dict.youdao.com/dictvoice?audio="+window.wordL[i];
        
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
        if (getFile.readyState==4 && getFile.status==200) {
            window.wordL=getFile.responseText.split("\n");
            for(var i=0;i<window.wordL.length;i++)
                window.wordL[i]=window.wordL[i].replace(/(^\s*)|(\s*$)/g, "");
            document.getElementById("begin").max=window.wordL.length
            document.getElementById("end").max=window.wordL.length
            document.getElementById("wordList").style.display="";
        }
        else if (getFile.readyState==4 && getFile.status==404) {
            alert("Invalid Word List!");
            window.location.href="index.html";
        }
    };
    getFile.send(null);
}

document.addEventListener("DOMContentLoaded", function() {    
    var selectedWordList=getQueryString("wordList");
    if(selectedWordList) {
        fileImport(selectedWordList);
    }
    else {
        alert("Please Select One First!");
        window.location.href="index.html";
        return;
    }
    document.getElementById("start").addEventListener("click",function() {
        initWordList();
    });
});