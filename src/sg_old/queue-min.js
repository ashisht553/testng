function Queue(){function e(){var e={},i={high:[],medium:[],low:[]};this.add=function(u,t,h){t=void 0==t||null==t?"high":t,void 0==e[h]&&(e[h]=h,u.queueid=h,i[t].push(u))},this.empty=function(){e={},i={high:[],medium:[],low:[]}},this.get=function(){return $.extend(!0,{},i)},this.hasNext=function(){return i.high.length>0||i.medium.length>0||i.low.length>0},this.next=function(){var u=null;if(i.high.length?u=i.high.shift():i.medium.length?u=i.medium.shift():i.low.length&&(u=i.low.shift()),u){var t=u.queueid;delete u.queueid,delete e[t]}return u}}return new e}Queue.HIGH_PRIORITY="high",Queue.MEDIUM_PRIORITY="medium",Queue.LOW_PRIORITY="low";