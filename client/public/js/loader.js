function addScript(src) {
  var ele = document.createElement('script');
  ele.src = src;
  document.head.appendChild(ele);
}

function load() {
  if( classSupport() ) addScript('/js/bundle.js');
  else addScript('/js/ie-bundle.js');
}

function classSupport() {
  try {
    eval("class Foo {}");
  } catch (e) { return false; }
  return true;
}

addScript('/webcomponentsjs/webcomponents-loader.js');

load();
// if( window.WebComponents && window.WebComponents.ready ) {
//   load();
// } else {
//   window.addEventListener('WebComponentsReady', function() {
//     load();
//   });
// }