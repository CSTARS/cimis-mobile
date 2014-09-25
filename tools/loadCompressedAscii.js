
exports.loadCompressedASCIIFile = function(request_url) {

    var req = new XMLHttpRequest();
    
    // You gotta trick it into downloading binary.
    req.open('GET', request_url, false);
    req.overrideMimeType('text\/plain; charset=x-user-defined');    
    req.send(null);
    
    // Check for any error....
    if (req.status != 200) {
        return '';
    }

    // Here's our raw binary.
    var rawfile = req.responseText;

    // Ok you gotta walk all the characters here, to remove the high-order values.

    // Create a byte array.
    bytes = [];

    // Walk through each character in the stream.
    for (var fileidx = 0; fileidx < rawfile.length; fileidx++) {
        var abyte = rawfile.charCodeAt(fileidx) & 0xff;
        bytes.push(abyte);
    }

    // Instantiate our zlib object, and gunzip it.    
    // Requires: https://github.com/imaya/zlib.js/blob/master/bin/gunzip.min.js
    // (remove the map instruction at the very end.)
    var  gunzip  =  new  Zlib.Gunzip ( bytes ); 
    var  plain  =  gunzip.decompress ();

    // Now go ahead and create an ascii string from all those bytes.
    // Seeing we've just got a big ole byte buffer, but, not an ASCII file.
    var asciistring = "";
    for (var i = 0; i < plain.length; i++) {
        asciistring += String.fromCharCode(plain[i]);
    }

    return asciistring;


}