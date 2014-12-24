onload = function() {
  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');

  var img = new Image();
  img.onload = function() {
    context.drawImage(img, 0, 0, img.width, img.height);
  };

  img.src = /*@*/ 'zswang.png';

  var img2 = new Image();
  img2.onload = function() {
    context.drawImage(img2, 100, 100, img.width, img.height);
  };
  img2.src = /*@*/ "zswang.png";
};