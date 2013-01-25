YUI.add("gallery-datatable-paginator",function(e,t){function n(){}n.ATTRS={paginator:{value:null,setter:"_setPaginator"},serverPaginationMap:{valueFn:"_defPagMap",setter:"_setPagMap",validator:e.Lang.isObject},paginationState:{valueFn:null,setter:"_setPagState",getter:"_getPagState"},requestStringTemplate:{value:"",validator:e.Lang.isString},paginatorResize:{value:!1,validator:e.Lang.isBoolean},paginationSource:{value:"client",validator:e.Lang.isString}},e.mix(n.prototype,{_mlistArray:null,_pagDataSrc:null,_evtHandlesPag:null,paginator:null,pagModel:null,initializer:function(){return this.get("paginator")&&(this.paginator=this.get("paginator"),this._evtHandlesPag=[],this.paginator.get("model")&&(this.pagModel=this.get("paginator").get("model"),this._evtHandlesPag.push(this.pagModel.after("pageChange",e.bind(this._pageChangeListener,this)),this.pagModel.after("itemsPerPageChange",e.bind(this._pageChangeListener,this)),this.pagModel.after("totalItemsChange",e.bind(this._totalItemsListener,this)))),this._evtHandlesPag.push(this.data.after(["reset","add","remove"],e.bind(this._afterDataReset,this))),this._evtHandlesPag.push(e.Do.after(this._afterSyncUI,this,"_syncUI",this)),this._evtHandlesPag.push(this.after("sort",this._afterSortPaginator)),this._evtHandlesPag.push(this.after("renderView",this._notifyRender))),this},destructor:function(){e.Array.each(this._evtHandlesPag,function(t){if(!t)return;e.Lang.isArray(t)?e.Array.each(t,function(e){e.detach()}):t.detach()}),this._mlistArray=null,this._evtHandlesPag=null,delete this.pagModel,delete this.paginator},processPageRequest:function(t,n){var r=this._mlistArray,i=this.get("paginator"),s=i.get("model"),o=s.get("itemsPerPage"),u=this.get("sortBy")||{},a,f,l,c,h,p,d,v;n?(a=n.itemIndexStart,f=n.itemIndexEnd||a+o):(a=(t-1)*o,f=a+o-1,f=r&&f>r.length?r.length:f),l={},c=this._srvPagMapObj("itemIndexStart"),h=this._srvPagMapObj("itemsPerPage"),d=this._srvPagMapObj("page"),p=this._srvPagMapObj("itemIndexEnd"),l[d]=t,l[c]=a,l[p]=f,l[h]=o,l.sortBy=e.JSON.stringify(u),l=e.merge(this.get("paginationState"),l);switch(this._pagDataSrc){case"ds":v=this.get("requestStringTemplate")||"",this.paginatorDSRequest(e.Lang.sub(v,l));break;case"mlist":this.paginatorMLRequest(l);break;case"local":this.paginatorLocalRequest(l)}this.resizePaginator(),this.fire("pageUpdate",{state:n,view:i,urlObj:l})},refreshPaginator:function(){this.processPageRequest(this.pagModel.get("page"))},paginatorMLRequest:function(e){this.data.load(e)},paginatorDSRequest:function(e){this.datasource.load({request:e})},paginatorLocalRequest:function(e){var t=e.itemIndexStart,n=e.itemIndexEnd,r=this._mlistArray||[],i;i=r.slice(t,n+1),this.data.reset(i,{silent:!0}),this.syncUI()},resizePaginator:function(){if(this.get("paginatorResize")!==!0)return;e.later(25,this,function(){this._syncPaginatorSize()})},resetLocalData:function(t){return t instanceof e.ModelList?(this._mlistArray=[],t.each(function(e){this._mlistArray.push(e.toJSON())},this)):e.Lang.isArray(t)&&(this._mlistArray=[].concat(t)),this.pagModel.set("totalItems",this._mlistArray.length),this.refreshPaginator(),this},paginatorSortLocalData:function(){var t=[],n=this.get("sortBy"),r,i,s;e.Lang.isArray(n)&&(e.Array.each(this._mlistArray,function(e){t.push(e)}),r=n[0],i=e.Object.keys(r)[0],s=r[i],t.sort(function(t,n){var r,o,u;return e.Lang.isNumber(t[i])?r=t[i]-n[i]<0?-s:s:e.Lang.isString(t[i])?r=t[i]<n[i]?-s:s:e.Lang.isDate(t[i])&&(o=t[i],u=n[i],r=s===-1?u-o:o-u),r}),this._mlistArray=t),this.refreshPaginator()},getLocalData:function(){return this._mlistArray},addLocalData:function(e,t){var n=e&&e.model&&e.model.toJSON?e.model.toJSON():null,r,i,s,o;n&&(n.id&&delete n.id,r=this._mlistArray,i=[],t===0?i=i.concat(n,r):(s=r.slice(0,t),o=r.slice(t),i=i.concat(s,n,o)),this.resetLocalData(i))},removeLocalData:function(e,t){var n=e&&e.model&&e.model.toJSON?e.model.toJSON():null,r=[];n&&t!==null&&(r=this._mlistArray,r.splice(t,1),this.resetLocalData(r))},addRemoteData:function(e,t){this.fire("addRemoteRecord",{oPayload:e,pagIndex:t})},removeRemoteData:function(e,t){this.fire("removeRemoteRecord",{oPayload:e,pagIndex:t})},_afterSyncUI:function(){this._pagDataSrc||this._afterDataReset({})},_afterDataReset:function(t){if(this._pagDataSrc!==null)return;var n="";!this.datasource&&this.data.url&&this._pagDataSrc===null?n="mlist":this.datasource&&!this.data.url&&this._pagDataSrc===null?n="ds":n="local";switch(n){case"mlist":this._evtHandlesPag.push(this.data.after("response",this._afterMLResponse,this)),/client/i.test(this.get("paginationSource"))?this._pagDataSrc="local":this._pagDataSrc="mlist";break;case"ds":this._evtHandlesPag.push(this.datasource.get("datasource").after("response",e.bind(this._afterDSResponse,this))),/client/i.test(this.get("paginationSource"))?this._pagDataSrc="local":this._pagDataSrc="ds";break;case"local":this._setLocalData(t)}},_setLocalData:function(t){var n=this.get("data");t&&(e.Lang.isArray(t)||t instanceof e.ModelList)&&(n=t),this._pagDataSrc="local",this.resetLocalData(n),this._set("paginationState",this._defPagState())},_afterDataAdd:function(e){var t=this.pagModel.get("itemIndexStart"),n=e.index||null,r=n!==null?t+n:null;this._pagDataSrc==="local"?this.addLocalData(e,r):this.addRemoteData(e,r),this.fire("afterDataAdd",{oPayload:e,pagIndex:r})},_afterDataRemove:function(e){var t=this.pagModel.get("itemIndexStart"),n=e.index||null,r=n!==null?t+n:null;this._pagDataSrc==="local"?this.removeLocalData(e,r):this.removeRemoteData(e,r),this.fire("afterDataRemove",{oPayload:e,pagIndex:r})},_afterSortByChange:function(){this._setSortBy(),this._sortBy.length&&(this.get("paginator")&&this._pagDataSrc?(delete this.data.comparator,this.data.sort=function(){return this}):(this.data.comparator||(this.data.comparator=this._sortComparator),this.data.sort()))},_initSortFn:function(){if(this.get("paginator")&&this._pagDataSrc)delete this.data.comparator;else{var e=this;this.data._compare=function(t,n){var r=0,i,s,o,u,a,f;for(i=0,s=e._sortBy.length
;!r&&i<s;++i)o=e._sortBy[i],u=o.sortDir,o.sortFn?r=o.sortFn(t,n,u===-1):(a=t.get(o.key)||"",f=n.get(o.key)||"",r=a>f?u:a<f?-u:0);return r},this._sortBy.length?(this.data.comparator=this._sortComparator,this.data.sort()):delete this.data.comparator}},_afterSortPaginator:function(){if(!this._pagDataSrc)return;switch(this._pagDataSrc){case"mlist":case"ds":this.processPageRequest(this.pagModel.get("page"));break;case"local":this.paginatorSortLocalData()}},_afterRemoteResponse:function(e,t){var n=t==="ds"?e.response:e,r=this.get("serverPaginationMap").totalItems||null,i=r&&n.meta&&n.meta[r]!==undefined?n.meta[r]:null;n.results&&(r&&i!==null?i===0?(this.pagModel.set("totalItems",0),this.pagModel.set("page",1),this.data.reset(null,{silent:!0}),this.syncUI(),this.paginator.render()):this.pagModel.set("totalItems",i):this._setLocalData(n.results)),this.resizePaginator()},_afterDSResponse:function(e){this._afterRemoteResponse(e,"ds")},_afterMLResponse:function(e){this._afterRemoteResponse(e,"mlist")},_pageChangeListener:function(e){var t=+e.newVal||1;t=this.pagModel.get("page"),this.processPageRequest(t,this.get("paginationState"))},_totalItemsListener:function(e){e.newVal===0&&this.fire("paginatorZeroItems")},_syncPaginatorSize:function(){var e=this.get("boundingBox").one("."+this.getClassName("columns"));return e?(this.paginator.get("container").setStyle("width",e.getComputedStyle("width")),this.fire("paginatorResize"),!0):!1},_srvPagMapObj:function(e,t){var n=this.get("serverPaginationMap")||{},r=n[e];return t=t||"to",r&&t==="to"&&r.toServer&&(r=r.toServer),r&&t!=="to"&&r.fromServer&&(r=r.fromServer),r},_defPagMap:function(){return{page:"page",totalItems:"totalItems",itemsPerPage:"itemsPerPage",itemIndexStart:"itemIndexStart",itemIndexEnd:"itemIndexEnd"}},_setPagMap:function(t){var n=this._defPagMap();return e.merge(n,t)},_defPagState:function(){var e={};return this.get("paginator")&&this.get("paginator").model&&(e=this.get("paginator").model.getAttrs(["page","totalItems","itemsPerPage","itemIndexStart","itemIndexEnd","totalPages"]),e.sortBy=this.get("sortBy")),e},_getPagState:function(){if(!this.get("paginator"))return null;var e=this.pagModel?this.pagModel.getAttrs(["page","totalItems","itemsPerPage","itemIndexStart","itemIndexEnd","totalPages"]):{};return e.sortBy=this.get("sortBy"),e},_setPagState:function(e){return this.get("paginator")?(e.initialized!==undefined&&delete e.initialized,e.sortBy!==undefined&&this.set("sortBy",e.sortBy),this.pagModel&&this.pagModel.setAttrs(e),e):null},_setPaginator:function(e){if(!e)return;return this.paginator=e,this.initializer(),e},_notifyRender:function(){this.get("paginatorResize")===!0&&this.resizePaginator(),this.fire("render")}}),e.DataTable.Paginator=n,e.Base.mix(e.DataTable,[e.DataTable.Paginator])},"gallery-2013.01.16-21-05",{requires:["datatable-base","base-build","datatype","json"]});
