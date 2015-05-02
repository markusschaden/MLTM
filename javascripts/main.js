var mltms = new Array();

function MLTM(tag) {
  this.tag = tag;

  this.usescaling = true;
  this.selectedNodes = new Array();

  var maxsize;
  this.__defineGetter__("maxsize", function() { return maxsize; });
  this.__defineSetter__("maxsize", function(value) {
    if (value > 0) {
      maxsize = value;
      recalcValues();
    }
  });

  var proportion;
  this.__defineGetter__("proportion", function() { return proportion; });
  this.__defineSetter__("proportion", function(value) {
    if (value < 1 && value >= 0) {
      proportion = value;
      recalcValues();
    }
  });

  var limit;
  this.__defineGetter__("limit", function() { return limit; });
  this.__defineSetter__("limit", function(value) {
    if (value > maxlimit)
      console.log("limit can't be bigger than "+maxlimit+" with current settings.");
    else {
      limit = value;
      recalcValues();
    }
  });

  var maxlimit;
  this.__defineGetter__("maxlimit", function() { return maxlimit; });

  var sizes;
  this.__defineGetter__("sizes", function() {
    return sizes;
  });

  var distances;
  this.__defineGetter__("distances", function() {
    return distances;
  });

  var maxControlSize;
  this.__defineGetter__("maxControlSize", function() {
    return maxControlSize;
  });

  function init() {
    maxsize = 100;
    proportion = 0.20;
    limit = 3;
    recalcValues();
  }

  function recalcValues() {
    maxlimit = 0;
    sizes = new Array();
    maxControlSize = 0;
    while ((size = calcSize(maxlimit)) > 0 && maxlimit < 100) {
      sizes.push(size);
      if (maxlimit < limit)
        maxControlSize += Math.pow(2,maxlimit)*size;
      maxlimit++;
    }

    distances = [maxControlSize];
    for (var i = 0; i < limit; i++)
      distances.push(distances[i]/2);

    console.log("maxsize: "+maxsize);
    console.log("proportion: "+proportion);
    console.log("limit: "+limit);
    console.log("maxlimit: "+maxlimit);
    console.log("maxControlSize: "+maxControlSize);
    console.log("sizes: "+sizes);
    console.log("distances: "+distances);
  }

  function calcSize(sub) {
    return maxsize-sub*maxsize*proportion;
  }

  init();
}

function Node(tag, mltm) {
  this.tag = tag;
  this.mltm = mltm;

  this.size = 1.0;
  this.collapsed = false;
}

function positionSelectedNode(index, mltm) {
  var node = mltm.selectedNodes[0];
  if (!node) node = $(mltm.tag.children("[node]")[0]).data("node");
  var height = mltm.tag.height();
  var width = mltm.tag.width();
  node.tag.velocity({
    top: Math.round(height/2-mltm.maxsize/2)+"px",
    left: Math.round(width/2-mltm.maxsize/2)+"px",
  });
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    positionNodes(i, nodes[i], nodes.length, 1);
}

function positionNodes(index, tag, count, sub) {
  var node = $(tag).data("node");
  var x = Math.cos(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[sub];
  var y = Math.sin(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[sub];
  node.tag.velocity({
    top: y+"px",
    left: x+"px",
  });
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    positionNodes(i, nodes[i], nodes.length, sub+1);
}

function sizeSelectedNode(index, mltm) {
  var node = mltm.selectedNodes[0];
  if (!node) node = $(mltm.tag.children("[node]")[0]).data("node");
  var maxsize = mltm.maxsize;
  node.size = 1;
  if (mltm.usescaling) {
    node.tag.velocity({
      width: maxsize+"px",
      height: maxsize+"px",
      scaleX: node.size,
      scaleY: node.size
    });
  }
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    sizeNodes(i, nodes[i], nodes.length, node);
}

function sizeNodes(index, tag, count, parent) {
  var node = $(tag).data("node");
  var maxsize = node.mltm.maxsize;
  node.size = parent.size;
  if (node.mltm.usescaling) {
    node.tag.velocity({
      width: maxsize+"px",
      height: maxsize+"px",
      scaleX: node.size-node.mltm.proportion,
      scaleY: node.size-node.mltm.proportion
    });
  }
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    sizeNodes(i, nodes[i], nodes.length, node);
}

$(document).ready(function() {
  function initMLTMs() {
      var tag = $(this);
      var mltm = new MLTM(tag);
      mltms.push(mltm);
      if (tag.data("mltm") === undefined) tag.data("mltm", mltm);
      var nodes = tag.children("[node]");
      for (var i = 0; i < nodes.length; i++)
        initNodes(nodes[i], mltm);
  }

  function initNodes(object, mltm) {
    var tag = $(object);
    var node = new Node(tag, mltm);
    if (tag.data("node") === undefined) tag.data("node", node);
    var nodes = tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      initNodes(nodes[i], mltm);
  }

  /*function nodeSearch(index, object) {
    var nodeTag = $(object);
    var parent = $(nodeTag.parent());
    nodeTag.data("mltm", parent.data("mltm"));
    nodeTag.data("sub", parent.data("sub")+1);
    if (nodeTag.data("node") === undefined) nodeTag.data("node", new Node(nodeTag));
    nodeTag.css("position", "absolute");
    if (parent) {

    } else {
    var height = parent.height();
    var width = parent.width();
    nodeTag.velocity({
      top: Math.round(height/2-size/2)+"px",
      left: Math.round(width/2-size/2)+"px",
    });
    var size = calculateSize(nodeTag.data("mltm"), nodeTag.data("sub"));
    nodeTag.velocity({
      width: size+"px",
      height: size+"px",
    });
    var nodes = nodeTag.children("[node]");
    $.each(nodes,nodeSearch);
  }*/

  $.each($.find("[mltm]"),initMLTMs);
  $.each(mltms, positionSelectedNode);
  $.each(mltms, sizeSelectedNode);
});
