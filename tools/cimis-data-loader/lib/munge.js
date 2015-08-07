/**
 * switch data format 'ring-buffer friendly' format
 */

 module.exports = function(data) {
   console.log('Munging data...');

   var munged = {};

   for( var key in data ) {
     var d = data[key].data;

     for( var id in d ) {
       if( !munged[id] ) {
          munged[id] = {};
       }
       munged[id][key] = d[id];
     }
   }

   return munged;
 };
