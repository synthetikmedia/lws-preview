/*
 * Copyright © 2024 Regular Labs - All Rights Reserved
 * GNU General Public License version 2 or later
 */
'use strict';import{Helper}from'./helper.min.js?2.5.6.p';export const Prototypes={hasData:function(name){return this.element.hasAttribute(`data-rlta-${name}`);},getData:function(name){const value=this.element.dataset[`rlta${Helper.pascalCase(name)}`];if(value==='true'){return true;}
if(value==='false'){return false;}
return value;},setData:function(name,value){this.element.dataset[`rlta${Helper.pascalCase(name)}`]=value;},removeData:function(name){this.element.removeAttribute(`data-rlta-${name}`);},getState:function(){return this.getData('state');}}
