/**
 * Custom Google Map overlay
 **/

 function EtoOverlay(bounds, map) {
   // Initialize all properties.
   this.bounds_ = bounds;
   this.map_ = map;

   // Define a property to hold the image's div. We'll
   // actually create this div upon receipt of the onAdd()
   // method so we'll leave it null for now.
   this.div_ = null;

   // Explicitly call setMap on this overlay.
   this.setMap(map);
 }

 EtoOverlay.prototype = new google.maps.OverlayView();

 EtoOverlay.prototype.onAdd = function() {
   var div = document.createElement('div');
   div.style.position = 'absolute';
   div.style.textAlign = 'center';

   var span = document.createElement('span');
   span.style.verticalAlign = 'middle';
   span.style.display = 'inline-block';
   span.style.paddingTop = '5px';
   div.appendChild(span);
   this.span_ = span;

   this.div_ = div;
   if( this.value ) this.setValue(this.value);

   // Add the element to the "overlayLayer" pane.
   var panes = this.getPanes();
   panes.overlayLayer.appendChild(div);
 };

 EtoOverlay.prototype.setValue = function(txt) {
   // Create the img element and attach it to the div.
   if( this.span_ ) {
     this.span_.innerHTML = txt;
     this.updateIconSize();
   }
   this.value = txt;
 }

 EtoOverlay.prototype.draw = function() {
   // We use the south-west and north-east
   // coordinates of the overlay to peg it to the correct position and size.
   // To do this, we need to retrieve the projection from the overlay.
   var overlayProjection = this.getProjection();

   // Retrieve the south-west and north-east coordinates of this overlay
   // in LatLngs and convert them to pixel coordinates.
   // We'll use these coordinates to resize the div.
   var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
   var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

   var fontSize = Math.floor((ne.x - sw.x) * .4);

   // Resize the image's div to fit the indicated dimensions.
   var div = this.div_;
   div.style.fontSize = fontSize+'px';
   div.style.lineHeight = (fontSize)+'px';
   div.style.left = sw.x + 'px';
   div.style.top = ne.y + 'px';

   this.width = (ne.x - sw.x);
   this.height = (sw.y - ne.y);

   div.style.width = this.width + 'px';
   div.style.height = this.height + 'px';

   this.updateIconSize();
 };

 EtoOverlay.prototype.updateIconSize = function() {
  if( !this.div_ ) return;

  setTimeout(function(){
    var ele = this.div_.querySelector('[set-size]');
    if( ele ) {
      ele.style.width = Math.floor(this.width) + 'px';
      ele.style.height = Math.floor(this.height) + 'px';
    }
  }.bind(this), 0);
 }

 EtoOverlay.prototype.onRemove = function() {
   this.div_.parentNode.removeChild(this.div_);
   this.div_ = null;
 };
