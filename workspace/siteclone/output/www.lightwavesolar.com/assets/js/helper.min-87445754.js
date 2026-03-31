/*
 * Copyright © 2024 Regular Labs - All Rights Reserved
 * GNU General Public License version 2 or later
 */
'use strict';export const Helper={createElementFromHTML:function(htmlString,element_type){var div=document.createElement('div');div.innerHTML=htmlString.trim();const element=div.firstChild;element.dataset.rltaElement=element_type||'';return element;},getData:function(element,name){const value=element.dataset[`rlta${this.pascalCase(name)}`];if(value==='true'){return true;}
if(value==='false'){return false;}
return value;},pascalCase:function(string){return string.replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ').toLowerCase().trim().replace(/\s(.)/g,function(match){return match.toUpperCase();}).replace(/\s/g,'').replace(/^(.)/g,function(match){return match.toUpperCase();});},getValueByFixedDurationEffect:function(start_value,end_value,time_diff,duration){if(!time_diff){return{value:start_value,};}
duration=parseFloat(duration);const total_movement=end_value-start_value;const position=Math.min(1,time_diff/duration);const value=start_value+(total_movement*position);return parseFloat(value);},getValueByConstantSpeedEffect:function(previous_value,time_diff,speed,step,base_duration=500){const time_ratio=time_diff/base_duration;const increment=step*time_ratio*speed;const value=previous_value+increment;return parseFloat(value);},getParentByMixed:function(parent){parent=parent||document;if(typeof parent==='string'){let id=this.cleanId(parent);parent=document.querySelector(`#${id}`);}
return parent;},cleanId:function(string){string=string.split('&')[0];string=string.replace(/[^a-z0-9]/g,'-');string=string.replace(/-+/g,'-');return string.toLowerCase();},cleanHash:function(string){string=string.split('&')[0];string=string.replace(/[^-A-Za-z0-9_:.]/g,'-');return string.toLowerCase();},getButtonByMixed:function(button){if(typeof button==='string'){let id=this.cleanId(button);if(id.indexOf('rlta-')===-1){id=`rlta-${id}`;}
button=document.querySelector(`#${id}`);}
if(!button){return false;}
return button;},getItemByMixed:function(button){button=this.getButtonByMixed(button);if(!button){return null;}
if(button.rlta===undefined){return false;}
return button.rlta.item;},debounce:function(func,wait=20,immediate=true){let timeout;return function(){const context=this,args=arguments;const later=function(){timeout=null;if(immediate){return;}
return func.apply(context,args);};var callNow=immediate&&!timeout;clearTimeout(timeout);timeout=setTimeout(later,wait);if(!callNow){return;}
return func.apply(context,args);};},getInterval:function(amount,speed,step=10){speed=parseFloat(speed);const duration=(11-speed)*step;const increment_per_ms=amount/duration;return{amount:amount,speed:speed,step:step,duration:duration,increment_per_ms:increment_per_ms,};},};