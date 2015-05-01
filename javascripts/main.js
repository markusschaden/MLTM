var mltms = new Array();

function MLTM(tag) {
  this.tag = tag;

  this.maxsize = 80;
  this.proportion = 0.25;
  this.limit = 3;
  this.usescaling = true;
  this.selectedNodes = new Array();
}

function Node(tag, mltm) {
  this.tag = tag;
  this.mltm = mltm;

  this.size = 1.0;
  this.collapsed = false;
}

function calculateSize(mltm, sub) {
  return mltm.maxsize-(sub-1)*mltm.maxsize*mltm.proportion;
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
      positionNodes(i, nodes[i], nodes.length);
  }

  function positionNodes(index, tag, count) {
    var node = $(tag).data("node");
    var x = Math.cos(((360/count)*(index+1))* Math.PI / 180.0)*100;
    var y = Math.sin(((360/count)*(index+1))* Math.PI / 180.0)*100;
    node.tag.velocity({
      top: y+"px",
      left: x+"px",
    });
    var nodes = node.tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      positionNodes(i, nodes[i], nodes.length);
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
    node.size = parent.size-node.mltm.proportion;
    if (node.mltm.usescaling) {
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
