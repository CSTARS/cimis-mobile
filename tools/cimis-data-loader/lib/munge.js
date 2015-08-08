/**
 * switch data format 'ring-buffer friendly' format
 */

 module.exports = function(data, index) {
   console.log('Munging data...');

   var munged = {};

   for( var key in data ) {
     var d = data[key].data;

     for( var id in d ) {
       if( !munged[id] ) {
          munged[id] = {};
       }
       //munged[id][index] = {};
       //munged[id][index][key] = d[id];
       munged[id][key] = d[id];
     }
   }

   return munged;
 };
