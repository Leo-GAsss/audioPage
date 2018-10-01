/*eslint-env browser*/
var wordL=[];
var globalPlayFlag=true;
var nowPlay=null;
var Position = {};
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
    rect=elem.getBoundingClientRect();
    absoluteElementTop=rect.top+window.pageYOffset;
    window.scrollTo(0,absoluteElementTop-8-41*3);
}

function loopAudioPlay(elem,maxTimes,delayTime,finalEndEvent){
    elem.play();
    var start = 0;
    elem.addEventListener("ended",function() {
        if(!globalPlayFlag) {
            elem.parentElement.className="word";
            globalPlayFlag=true;
            return;
        }
        start++;
        if( start<maxTimes ) {
            setTimeout(function(){elem.play();},delayTime);
        }
        else {
            elem.pause();
            elem.onended=null;
            if(finalEndEvent)
                finalEndEvent(elem);
        }
    });
}

function playOnce(id) {
    document.getElementById("Audio"+id.slice(4)).play();
}

function playLoop(id) {
    let tgtAudio=document.getElementById("Audio"+id.slice(4));
    let delay=Number(document.getElementById("delay").value);
    times=Number(document.getElementById("rptTimes").value);
    loopAudioPlay(tgtAudio,times,tgtAudio.duration*1000*delay,null);
}

function autoContinue(curElem) {
    if(!globalPlayFlag) {
        curElem.parentElement.className="word";
        globalPlayFlag=true;
        return;
    }
    
    let nextAudio=document.getElementById("Audio"+String(Number(curElem.id.slice(5))+1));
    let delay=Number(document.getElementById("delay").value);
    let wordContainer=document.getElementById("wordContainer").children;
    times=Number(document.getElementById("rptTimes").value);
    if(nextAudio.parentElement!=wordContainer[wordContainer.length-1]) {
        setTimeout(
            function() {
                scrollWord(nextAudio.parentElement);
                curElem.parentElement.className="word";
                nextAudio.parentElement.className="word js-item-hover";
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
    id=id.slice(4);
    let tgtAudio=document.getElementById("Audio"+id);
    let delay=Number(document.getElementById("delay").value);
    let wordContainer=document.getElementById("wordContainer").children;
    times=Number(document.getElementById("rptTimes").value);
    scrollWord(tgtAudio.parentElement);
    tgtAudio.parentElement.className="word js-item-hover";
    nowPlay=tgtAudio.parentElement;
    if(tgtAudio.parentElement!=wordContainer[wordContainer.length-1]) {
        stopBtn=document.getElementById("stopButton");
        stopBtn.style.display="";
        stopBtn.addEventListener("click",function() {
            globalPlayFlag=false;
            this.style.display="none";
        });
        loopAudioPlay(tgtAudio,times,tgtAudio.duration*1000*delay,autoContinue);
    }
    else {
        playLoop("loop"+id);
    }
}

function initWordList() {
    let wordCont=document.getElementById("wordContainer");
    let cNodes=wordCont.childNodes;
    for(i=cNodes.length-1;i>=0;i--) {
        wordCont.removeChild(cNodes[i]);
    }
    
    let begin=document.getElementById("begin").value;
    let end=document.getElementById("end").value;
    for(i=begin-1;i<end;i++) {
        let wordT=document.querySelector("#wordRow");
        
        wordText=wordT.content.querySelector(".wordText");
        wordText.innerHTML=wordL[i].slice(0,1).toUpperCase()+wordL[i].slice(1);
        
        wordAudio=wordT.content.querySelector("audio");
        wordAudio.id="Audio"+i.toString();
        wordAudio.src="http://dict.youdao.com/dictvoice?audio="+wordL[i];
        
        buttonPlay=wordT.content.querySelector(".Button.play");
        buttonPlay.id="Play"+i.toString();
            
        buttonLoop=wordT.content.querySelector(".Button.loop");
        buttonLoop.id="Loop"+i.toString();
        
        buttonDown=wordT.content.querySelector(".Button.down")
        buttonDown.id="Down"+i.toString();
        
        let clone=document.importNode(wordT.content,true);
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

function fileImport() {
    var selectedFile = document.getElementById('file').files[0];
    var reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = function () {
        wordL=this.result.split("\n");
        for(i=0;i<wordL.length;i++)
            wordL[i]=wordL[i].replace(/(^\s*)|(\s*$)/g, "");
        document.getElementById("begin").max=wordL.length
        document.getElementById("end").max=wordL.length
    
        document.getElementById("fileSelect").style.display="none";
        document.getElementById("wordList").style.display="";
    }
}