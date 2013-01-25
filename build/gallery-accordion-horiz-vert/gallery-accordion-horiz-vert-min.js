YUI.add("gallery-accordion-horiz-vert",function(e,t){"use strict";function s(t){t=t||{},e.Lang.isUndefined(t.tabIndex)&&(t.tabIndex=null),e.Lang.isUndefined(t.horizontal)&&(t.horizontal=!1),s.superclass.constructor.call(this,t)}function o(){return!e.Lang.isUndefined(e.Anim)}function u(t){return t&&r&&!e.Lang.isUndefined(e.Anim)}function l(t){e.Event.purgeElement(t,!0);while(t.hasChildNodes())t.removeChild(t.get("lastChild"))}function c(){c.superclass.constructor.apply(this,arguments)}function m(e){this.set(e,!1),this.modifyAttr(e,{readOnly:!0})}function g(){var t=this.get("host");this.init_fixed_size||(e.Array.each(h,m,t),t.get("rendered")||this.afterHostEvent("render",g,this),this.onHostEvent("insert",function(){e.later(1,this,g)},this),this.onHostEvent("remove",g,this),this.onHostEvent("open",g,this),this.onHostEvent("close",g,this),this.init_fixed_size=!0);var n=t.slide_style_name,r=t.get("boundingBox").parseDimensionStyle(n),i=t.getSectionCount(),s=[];for(var o=0;o<i;o++)r-=t.getTitle(o)[p[n]](),t.isSectionOpen(o)&&s.push(o);i=s.length;var u=Math.floor(r/i),a=r%i;for(o=0;o<i;o++){var f=t.getSection(s[o]),l=u-f[v[n]]();o===i-1&&(l+=a),f.setStyle(n,l+"px"),f.setStyle(d[n],"auto")}}var n=0<e.UA.ie&&e.UA.ie<8,r=!(0<e.UA.ie&&e.UA.ie<8),i=n?1:0;s.NAME="accordion",s.ATTRS={horizontal:{value:!1,writeOnce:!0},titles:{writeOnce:!0},replaceTitleContainer:{value:!0,validator:e.Lang.isBoolean},sections:{writeOnce:!0},replaceSectionContainer:{value:!0,validator:e.Lang.isBoolean},allowAllClosed:{value:!1,validator:e.Lang.isBoolean,setter:function(e){return this.allow_all_closed=e,e}},allowMultipleOpen:{value:!1,validator:e.Lang.isBoolean},animateRender:{value:!1,writeOnce:!0,validator:e.Lang.isBoolean,setter:u},animateInsertRemove:{valueFn:o,validator:e.Lang.isBoolean,setter:u},animateOpenClose:{valueFn:o,validator:e.Lang.isBoolean,setter:u},animateDuration:{value:null,validator:function(t){return t===null||e.Lang.isNumber(t)}},animateEasing:{value:null,validator:function(t){return t===null||e.Lang.isFunction(t)}}},s.HTML_PARSER={titles:function(e){return e.all("> li > div:nth-child(1)")},sections:function(e){return e.all("> li > div:nth-child(2)")}};var a=e.ClassNameManager.getClassName(s.NAME,"open"),f=e.ClassNameManager.getClassName(s.NAME,"closed");e.extend(s,e.Widget,{initializer:function(e){this.section_list=[],this.get("allowAllClosed"),this.get("horizontal")?(this.slide_style_name="width",this.slide_size_name="offsetWidth",this.fixed_style_name="height",this.fixed_size_name="offsetHeight"):(this.slide_style_name="height",this.slide_size_name="offsetHeight",this.fixed_style_name="width",this.fixed_size_name="offsetWidth"),this.after("allowMultipleOpenChange",function(e){this.section_list&&this.section_list.length>0&&!e.newVal&&this.closeAllSections()}),this.after("allowAllClosedChange",function(e){this.section_list&&this.section_list.length>0&&!e.newVal&&this.allSectionsClosed()&&this.toggleSection(0)})},renderUI:function(){this.get("boundingBox").addClass(this.getClassName(this.get("horizontal")?"horiz":"vert"));var t=this.get("titles");e.Lang.isString(t)&&(t=e.all(t));var n=this.get("sections");e.Lang.isString(n)&&(n=e.all(n));if(t instanceof e.NodeList&&n instanceof e.NodeList&&t.size()==n.size()){var r=this.get("animateInsertRemove");this.set("animateInsertRemove",this.get("animateRender"));var i=t.size();for(var s=0;s<i;s++)this.appendSection(t.item(s),n.item(s));this.set("animateInsertRemove",r)}else if(t instanceof Array&&n instanceof Array&&t.length==n.length){var r=this.get("animateInsertRemove");this.set("animateInsertRemove",this.get("animateRender"));var i=t.length;for(var s=0;s<i;s++)this.appendSection(t[s],n[s]);this.set("animateInsertRemove",r)}this.get("contentBox").all("> li").remove(!0)},getSectionCount:function(){return this.section_list.length},getTitle:function(e){return this.section_list[e].title},setTitle:function(t,r){var i=this.section_list[t].title;l(i);var s;if(e.Lang.isString(r)){var s=e.one(r);s||i.set("innerHTML",r)}else s=r;if(s&&this.get("replaceTitleContainer")){var o=i.get("parentNode"),u=i.get("nextSibling");o.removeChild(i),u?o.insertBefore(s,u):o.appendChild(s),this.section_list[t].title=s,s.addClass(this.getClassName("title")),s.addClass(this.section_list[t].open?a:f)}else s&&i.appendChild(s);n&&i.setStyle("display",i.get("innerHTML")?"":"none")},getSection:function(e){return this.section_list[e].content},setSection:function(t,n){var r=this.section_list[t].content;l(r);var i;if(e.Lang.isString(n)){var i=e.one(n);i||r.set("innerHTML",n)}else i=n;if(i&&this.get("replaceSectionContainer")){var s=r.getStyle("display"),o=r.get("parentNode"),u=r.get("nextSibling");o.removeChild(r),u?o.insertBefore(i,u):o.appendChild(i),this.section_list[t].content=i,i.addClass(this.getClassName("section")),i.addClass(this.section_list[t].open?a:f),i.setStyle("display",s)}else i&&r.appendChild(i)},_getClip:function(e){return this.section_list[e].clip},prependSection:function(e,t){return this.insertSection(0,e,t)},appendSection:function(e,t){return this.insertSection(this.section_list.length,e,t)},insertSection:function(t,n,r){this.fire("beforeInsert",t);var s=e.Node.create("<div/>");s.addClass(this.getClassName("title")),s.addClass(f);var o=e.Node.create("<div/>");o.addClass(this.getClassName("section-clip")),o.setStyle(this.slide_style_name,i+"px"),this.get("animateOpenClose")&&o.setStyle("opacity",0);var u=e.Node.create("<div/>");u.addClass(this.getClassName("section")),u.addClass(f),u.setStyle("display","none"),o.appendChild(u),this.section_list.splice(t,0,{title:s,clip:o,content:u,open:!1,anim:null}),t<this.section_list.length-1?this.get("contentBox").insertBefore(s,this.section_list[t+1].title):this.get("contentBox").appendChild(s),this.setTitle(t,n),s=this.section_list[t].title;var a=s.get(this.slide_size_name);if(this.get("animateInsertRemove")){s.setStyle(this.slide_style_name,i+"px");var l={node:s,from:{opacity:0},to:{opacity:1}};l.to[this.slide_style_name]=a;var c=this
._createAnimator(l);c.on("end",function(e,t){this.section_list[t].title.setStyle(this.slide_style_name,"auto")},this,t),c.run()}return r&&(this.setSection(t,r),u=this.section_list[t].content),t<this.section_list.length-1?this.get("contentBox").insertBefore(o,this.section_list[t+1].title):this.get("contentBox").appendChild(o),this.fire("insert",t,a),!this.allow_all_closed&&this.allSectionsClosed()&&this.toggleSection(0),{title:s,content:u}},removeSection:function(e){function t(t,n){n[0].removeChild(n[1]),n[0].removeChild(n[2]),n[3]&&this.fire("remove",e)}this.fire("beforeRemove",e);var n=[this.get("contentBox"),this.section_list[e].title,this.section_list[e].clip,!0];if(this.get("animateInsertRemove")){var r={node:this.section_list[e].clip,from:{opacity:1},to:{opacity:0}};r.to[this.slide_style_name]=i,this.section_list[e].open&&this._startAnimator(e,r),r.node=this.section_list[e].title;var s=this._createAnimator(r);s.on("end",t,this,n),s.run()}else n[3]=!1,t.call(this,null,n);this.section_list.splice(e,1),n[3]||this.fire("remove",e),!this.allow_all_closed&&this.allSectionsClosed()&&this.toggleSection(0)},findSection:function(t){t=e.Node.getDOMNode(e.one(t));var n=this.section_list.length;for(var r=0;r<n;r++){var i=e.Node.getDOMNode(this.section_list[r].title),s=e.Node.getDOMNode(this.section_list[r].content);if(t==i||e.DOM.contains(i,t)||t==s||e.DOM.contains(s,t))return r}return-1},isSectionOpen:function(e){return this.section_list[e].open},openSection:function(e){this.section_list[e].open||this.toggleSection(e)},closeSection:function(e){this.section_list[e].open&&this.toggleSection(e)},allSectionsOpen:function(){var e=this.section_list.length;for(var t=0;t<e;t++)if(!this.section_list[t].open)return!1;return!0},allSectionsClosed:function(){var e=this.section_list.length;for(var t=0;t<e;t++)if(this.section_list[t].open)return!1;return!0},toggleSection:function(e){function n(e,t){this.section_list[t].clip.setStyle(this.slide_style_name,"auto"),this.fire("open",t)}function r(e,t){this.section_list[t].content.setStyle("display","none"),this.fire("close",t)}if(!this.section_list[e].open&&!this.get("allowMultipleOpen")){var t=this.allow_all_closed;this.allow_all_closed=!0,this.closeAllSections(),this.allow_all_closed=t}else if(this.section_list[e].open&&!this.allow_all_closed){this.section_list[e].open=!1;if(this.allSectionsClosed()){this.section_list[e].open=!0;return}this.section_list[e].open=!0}if(!this.section_list[e].open){this.section_list[e].content.setStyle("display","block"),this.fire("beforeOpen",e),this.section_list[e].open=!0,this.section_list[e].title.replaceClass(f,a),this.section_list[e].content.replaceClass(f,a);var s=this.section_list[e].content.get(this.slide_size_name);if(this.get("animateOpenClose")){var o={node:this.section_list[e].clip,from:{opacity:0},to:{opacity:1}};o.to[this.slide_style_name]=s;var u=this._startAnimator(e,o);u.on("end",n,this,e)}else{var l=this.section_list[e].clip;l.getStyle("opacity")=="0"&&l.setStyle("opacity",1),n.call(this,null,e)}}else{this.fire("beforeClose",e),this.section_list[e].open=!1,this.section_list[e].title.replaceClass(a,f),this.section_list[e].content.replaceClass(a,f);if(this.get("animateOpenClose")){var o={node:this.section_list[e].clip,from:{opacity:1},to:{opacity:0}};o.to[this.slide_style_name]=i;var u=this._startAnimator(e,o);u.on("end",r,this,e)}else this.section_list[e].clip.setStyle(this.slide_style_name,i+"px"),r.call(this,null,e)}},openAllSections:function(){if(this.get("allowMultipleOpen")){var e=this.section_list.length;for(var t=0;t<e;t++)this.section_list[t].open||this.toggleSection(t)}},closeAllSections:function(){var e=this.section_list.length,t=!0;for(var n=0;n<e;n++)this.section_list[n].open&&(!this.allow_all_closed&&t?t=!1:this.toggleSection(n));!this.allow_all_closed&&t&&this.toggleSection(0)},_createAnimator:function(t){var n=this.get("animateDuration");n!==null&&(t.duration=n);var r=this.get("animateEasing");return r!==null&&(t.easing=r),new e.Anim(t)},_startAnimator:function(e,t){var n=this.section_list[e].anim;return n&&n.stop(!0),this.section_list[e].anim=n=this._createAnimator(t),n.on("end",function(e,t,n){t<this.section_list.length&&this.section_list[t].anim==n&&(this.section_list[t].anim=null)},this,e,n),n.run(),n}}),e.Accordion=s,c.NAME="FixedSizeAccordionPlugin",c.NS="fixedsize",c.ATTRS={};var h=["animateRender","animateInsertRemove","animateOpenClose"],p={width:"totalWidth",height:"totalHeight"},d={width:"overflowX",height:"overflowY"},v={width:"horizMarginBorderPadding",height:"vertMarginBorderPadding"};e.extend(c,e.Plugin.Base,{initializer:function(t){var n=this.get("host"),r=n.slide_style_name;this.init_fixed_size=!1,n.get(r)&&g.call(this),this.afterHostEvent(r+"Change",function(){e.later(1,this,g)},this)}}),e.namespace("Plugin"),e.Plugin.FixedSizeAccordion=c},"gallery-2013.01.16-21-05",{skinnable:"true",requires:["widget","selector-css3","plugin","gallery-dimensions"],optional:["anim-base"]});
