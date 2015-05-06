function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
}

function reselctNodes(event) {
  if (event.data.node.cNodes.length)
    event.data.node.mltm.mainNode = event.data.node;
  else if (event.data.node.pNode) {
    event.data.node.mltm.mainNode = event.data.node.pNode;
    if (rgb2hex(event.data.node.valueTag.css("background-color")) == "#ccffcc")
      event.data.node.valueTag.css("background-color", "#ccccff");
    else
      event.data.node.valueTag.css("background-color", "#ccffcc");
  }
}

var velocity_easings = new Array("ease", "ease-in", "ease-out", "ease-in-out");

function MLTM(tag) {
  this._mainNode = null;
  this._maxsize = 100;
  this._proportion = 0.8;
  this._limit = 3;
  this._angle = Math.PI * 2;
  this._extraSpace = 50;
  this._rotation = 0;
  this._duration = 400;
  this._easing = velocity_easings[3];
  this._zIndex = 100;
  this.node = null;
  this.distances = new Array();
  this.innersizes = new Array();
  this.proportions = new Array();
  this.controlsize = 0;
  this.velocityProps = {
    queue: false,
    duration: 400,
    easing: velocity_easings[3]
  }
  this.tag = $(tag);
}

MLTM.prototype = {
  get tag() {
    return this._tag;
  },
  set tag(value) {
    this._tag = value;
    this.tag.data("mltm", this);
    this._mainNode = this.node = new Node(this.tag, this, null);
    this.build();
  },
  get mainNode() {
    return this._mainNode;
  },
  set mainNode(value) {
    this._mainNode = value;
    this.build();
  },
  get maxsize() {
    return this._maxsize;
  },
  set maxsize(value) {
    if (value > 0) {
      this._maxsize = value;
      this.build();
    }
  },
  get proportion() {
    return this._proportion;
  },
  set proportion(value) {
    if (value <= 1 && value > 0) {
      this._proportion = value;
      this.build();
    }
  },
  get limit() {
    return this._limit;
  },
  set limit(value) {
    if (value >= 0) {
      this._limit = value;
      this.build();
    }
  },
  get angle() {
    return this._angle;
  },
  set angle(value) {
    if (value > 0 && value <= Math.PI * 2) {
      this._angle = value;
      this.build();
    }
  },
  get extraSpace() {
    return this._extraSpace;
  },
  set extraSpace(value) {
    if (value >= 0) {
      this._extraSpace = value;
      this.build();
    }
  },
  get rotation() {
    return this._rotation;
  },
  set rotation(value) {
    if (value >= 0 && value <= Math.PI * 2) {
      this._rotation = value;
      this.build();
    }
  },
  get duration() {
    return this._duration;
  },
  set duration(value) {
    if (value >= 0) {
      this._duration = value;
      this.velocityProps.duration = this.duration;
    }
  },
  get easing() {
    return this._easing;
  },
  set easing(value) {
    if (velocity_easings.indexOf(value) > -1) {
      this._easing = value;
      this.velocityProps.easing = this.easing;
    }
  },
  get zIndex() {
    return this._zIndex;
  },
  set zIndex(value) {
    this._zIndex = value;
    this.build();
  },
  get width() {
    return this.tag.width();
  },
  get height() {
    return this.tag.height();
  }
};

MLTM.prototype.build = function() {
  this.calc();
  if (this.mainNode)
    this.mainNode.build(null, 0);
}

MLTM.prototype.calc = function() {
  this.innersizes.length = 0;
  this.innersizes.push(this.maxsize + this.extraSpace);
  this.controlsize = 0;
  for (var i = 0; i < this.limit; i++) {
    this.controlsize += this.innersizes[i] * Math.pow(2, i);
    this.innersizes.push(this.innersizes[i] * this.proportion);
  }

  this.distances.length = 0;
  this.proportions.length = 0;
  this.proportions.push(1);
  for (var i = 0; i < this.limit - 1; i++) {
    this.distances.push((((i > 0) ? 2 * this.distances[i - 1] - this.innersizes[i - 1] : this.controlsize) - this.innersizes[i]) / 4 + this.innersizes[i] / 2)
    this.proportions.push(Math.pow(this.proportion, i + 1));
  }
};

function Node(tag, mltm, parent) {
  this._level = 0;
  this._distance = "auto";
  this.distanceCalced = 0;
  this.valueTag = null;
  this.connector = null;
  this.mltm = mltm;
  this.pNode = parent;
  this.opNode = parent;
  this.cNodes = new Array();
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.width = 0;
  this.tag = $(tag);
}

Node.prototype = {
  get tag() {
    return this._tag;
  },
  set tag(value) {
    this._tag = value;
    this.tag.data("node", this);
    this.valueTag = $(this.tag.children("[nodevalue]")[0]);
    this.valueTag.click({
      node: this
    }, reselctNodes);
    var conn = this.tag.children("[nodeconnector]")[0];
    this.connector = new NodeConnector((conn) ? $(conn) : null, this);
    var nodes = this.tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      this.cNodes.push(new Node($(nodes[i]), this.mltm, this));
  },
  get level() {
    return this._level;
  },
  set level(value) {
    if (value >= 0) {
      this._level = value;
      this.valueTag.css("z-index", this.mltm.zIndex + this.mltm.limit + this.level * -1);
    }
  },
  get distance() {
    return this._distance;
  },
  set distance(value) {
    if (value === "auto" || value >= 0) {
      this._distance = value;
    }
  }
};

Node.prototype.build = function(opNode, level) {
  this.level = level;
  this.opNode = opNode;

  this.calc();
  this.draw();
  this.connector.build();

  if (this.pNode && this.pNode !== this.opNode)
    this.pNode.build(this, this.level + 1);

  for (var i = 0; i < this.cNodes.length; i++)
    if (this.cNodes[i] !== this.opNode)
      this.cNodes[i].build(this, this.level + 1);

}

Node.prototype.calc = function() {
  this.calcAngle();
  this.calcProportion();
  this.calcWidth();
  this.calcDistance();
  this.calcPosition();
}

Node.prototype.calcAngle = function() {
  this.angle = 0;
  if (this.pNode) {
    this.angle = (Math.PI * 2 - this.mltm.angle) + ((this.pNode.cNodes.indexOf(this) + 1) * this.mltm.angle / (this.pNode.cNodes.length + ((this.pNode.pNode) ? 1 : 0)));
    if (this.pNode.pNode) this.angle += this.pNode.angle - (Math.PI * 2 - this.mltm.angle) / 2 + Math.PI;
    else this.angle += this.mltm.rotation + (this.mltm.angle - this.mltm.angle / this.pNode.cNodes.length) / 2;
  }
}

Node.prototype.calcProportion = function() {
  this.proportion = 0;
  if (this.level < this.mltm.limit)
    this.proportion = this.mltm.proportions[this.level];
}

Node.prototype.calcWidth = function() {
  this.width = 0;
  if (this.level < this.mltm.limit)
    this.width = this.mltm.maxsize * this.proportion;
}

Node.prototype.calcDistance = function() {
  this.distanceCalced = 0;
  if (this.level && this.level < this.mltm.limit) {
    this.distanceCalced = this.distance;
    if (this.distance === "auto")
      this.distanceCalced = this.mltm.distances[this.level - 1];
  }
}

Node.prototype.calcPosition = function() {
  if (!this.level) {
    this.x = Math.round(this.mltm.width / 2 - this.mltm.maxsize / 2);
    this.y = Math.round(this.mltm.height / 2 - this.mltm.maxsize / 2);
  } else {
    this.x = this.opNode.x;
    this.y = this.opNode.y;
    if (this.level < this.mltm.limit) {
      if (this.pNode === this.opNode) {
        this.x += Math.cos(this.angle) * this.distanceCalced;
        this.y += Math.sin(this.angle) * this.distanceCalced;
      } else if (this.opNode.pNode === this) {
        this.x += Math.cos(this.opNode.angle + Math.PI) * this.distanceCalced;
        this.y += Math.sin(this.opNode.angle + Math.PI) * this.distanceCalced;
      }
    }
  }
}

Node.prototype.draw = function() {
  this.valueTag.velocity({
    top: this.y + "px",
    left: this.x + "px",
    width: this.mltm.maxsize + "px",
    height: this.mltm.maxsize + "px",
    scaleX: this.proportion,
    scaleY: this.proportion
  }, this.mltm.velocityProps);
  if (this.level >= this.mltm.limit)
    this.valueTag.velocity("fadeOut", this.mltm.velocityProps);
  else if (!this.valueTag.is(":visible"))
    this.valueTag.velocity("fadeIn", this.mltm.velocityProps);
};

function NodeConnector(tag, node) {
  this._length = "auto";
  this.angle = 0;
  this.lengthCalced = 0;
  this.x = 0;
  this.y = 0;
  this.node = node;
  this.nodeToUse = null;
  this.mltm = node.mltm;
  this.tag = tag;
}

NodeConnector.prototype = {
  get tag() {
    return this._tag;
  },
  set tag(value) {
    this._tag = value;
    if (this.tag)
      this.tag.data("nodeconnector", this);
  },
  get length() {
    return this._length;
  },
  set length(value) {
    if (value === "auto" || (value >= 0 && value <= 0)) this._length = value;
  }
};

NodeConnector.prototype.build = function() {
  if (this.node.opNode) {
    this.nodeToUse = (this.node.opNode.pNode === this.node) ? this.node.opNode : this.node;

    this.calcAngle();
    this.calcLength();
    this.calcPosition();

    this.draw();
  }
};

NodeConnector.prototype.calcAngle = function() {
  this.angle = this.nodeToUse.angle * 360 / (2 * Math.PI);
};

NodeConnector.prototype.calcLength = function() {
  this.lengthCalced = 0;
  if (this.nodeToUse.level < this.mltm.limit) {
    this.lengthCalced = this.node.distanceCalced * this.length;
    if (this.length === "auto")
      this.lengthCalced = this.node.distanceCalced - (this.nodeToUse.width + this.nodeToUse.pNode.width) / 2;
  }
};

NodeConnector.prototype.calcPosition = function() {
  this.y = this.nodeToUse.y + this.mltm.maxsize / 2 + Math.sin(this.nodeToUse.angle + Math.PI) * this.lengthCalced / 2 + ((this.length === "auto") ? (Math.cos(this.nodeToUse.angle + Math.PI / 2) * this.nodeToUse.width / 2) : 0);
  this.x = this.nodeToUse.x + this.mltm.maxsize / 2 + ((Math.cos(this.nodeToUse.angle + Math.PI) * this.lengthCalced) - this.lengthCalced) / 2 - ((this.length === "auto") ? (Math.sin(this.nodeToUse.angle + Math.PI / 2) * this.nodeToUse.width / 2) : 0);
};

NodeConnector.prototype.draw = function() {
  if (this.nodeToUse.connector.tag) {
    this.nodeToUse.connector.tag.css("z-index", this.mltm.zIndex + this.mltm.limit + this.node.level * -1 - 1);
    this.nodeToUse.connector.tag.velocity({
      top: this.y + "px",
      left: this.x + "px",
      width: this.lengthCalced + "px",
      rotateZ: this.angle + "deg",
      scaleY: this.nodeToUse.pNode.proportion
    }, this.mltm.velocityProps);
    if (!this.lengthCalced)
      this.nodeToUse.connector.tag.velocity("fadeOut", this.mltm.velocityProps);
    else if (!this.nodeToUse.connector.tag.is(":visible"))
      this.nodeToUse.connector.tag.velocity("fadeIn", this.mltm.velocityProps);
  }
};

$(document).ready(function() {
  function initMLTM() {
    var mltm = new MLTM(this);
  }

  $.each($.find("[mltm]"), initMLTM);
});
