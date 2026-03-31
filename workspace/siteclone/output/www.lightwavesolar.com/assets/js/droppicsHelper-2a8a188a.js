/** 
 * Droppics
 * 
 * We developed this code with our hearts and passion.
 * We hope you found it useful, easy to understand and to customize.
 * Otherwise, please feel free to contact us at contact@joomunited.com *
 * @package Droppics
 * @copyright Copyright (C) 2013 JoomUnited (http://www.joomunited.com). All rights reserved.
 * @copyright Copyright (C) 2013 Damien Barrère (http://www.crac-design.com). All rights reserved.
 * @license GNU General Public License version 2 or later; http://www.gnu.org/licenses/gpl-2.0.html
 */

/* Based on the work : http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml */

var filesadded = "";
var stylesadded = "";
window.droppicsHeadLoaded = true;

function loadHeadFiles(files){
    window.droppicsHeadLoaded = false;
    files = eval(files);
    for (var i = 0; i < files.length; ++i) {
        loadHeadFile(files[i][0],files[i][1]);
    }
    window.droppicsHeadLoaded = true;
}

function loadHeadFile(filename, filetype){
    if (filesadded.indexOf("["+filename+"]")>0){
        return 1;
    }
    if (filetype=="js"){
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }else if (filetype=="css"){
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!=="undefined"){
        document.getElementsByTagName("head")[0].appendChild(fileref);
        filesadded+="["+filename+"]";
        return true;
    }
    return false;
}

function unloadHeadFile(filename, filetype){
    if(typeof filename==='undefined') return;
    if(filename==='') return;
    if(typeof filetype==='undefined'){
        unloadHeadFile(filename,'css');
        unloadHeadFile(filename,'js');
    }else{
        var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none"; //determine element type to create nodelist from
        var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none"; //determine corresponding attribute to test for
        var allsuspects=document.getElementsByTagName(targetelement);
        for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1){
                allsuspects[i].parentNode.removeChild(allsuspects[i]); //remove element by calling parentNode.removeChild()
                filesadded = filesadded.replace("["+filename+"]","");
            }
        }
    }
}

function unloadHeadFiles(){
    if(filesadded==='') return;
    files = filesadded.split("][");
    for (var i=0; i < files.length; i++){
        files[i] = files[i].replace("[","");
        files[i] = files[i].replace("]","");
        unloadHeadFile(files[i]);
    }
}

function loadHeadStyle(content,id){
    var fileref=document.createElement("style");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("id", id);
        fileref.innerHTML =content;
        document.getElementsByTagName("head")[0].appendChild(fileref);
        stylesadded+="["+id+"]";
}

function unloadStyles(){
    files = str.split(stylesadded);
    for (var style in styles){
        style = style.replace("[","");
        style = style.replace("]","");
        unloadStyleId(style);
    }
}

function unloadStyleId(id){
    elem=document.getElementById(id);
    if(elem){
        elem.parentNode.removeChild(elem);
    }
}

function addParameter(parameterName, parameterValue) {
    var url = pathname;
    replaceDuplicates = true;
    if (url.indexOf('#') > 0) {
        var cl = url.indexOf('#');
        urlhash = url.substring(url.indexOf('#'), url.length);
        urlhash = parameterValue+'-'+ parameterName + "&"+urlhash;
    } else {
        urlhash = parameterValue+'-'+ parameterName;
        cl = url.length;
    }
    sourceUrl = url.substring(0, cl);

    return sourceUrl + '#'+ urlhash;

}

//if no ie support maybe see http://stackoverflow.com/questions/1184950/dynamically-loading-css-stylesheet-doesnt-work-on-ie