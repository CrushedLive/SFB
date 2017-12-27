(function () {
    window.sfb = {
        Stacker: function (id) {
            this.id = id;
            var stack = [];
            this.add = function (item) {
                stack.push(item);
            };
            this.remove = function () {
                stack.forEach(function (item) {
                    item.remove();
                });
                stack = [];
            };
            this.tick = function (frame) {
                stack.forEach(function (item, key) {
                    item.tick(frame);
                    if (item.isTrash()) {
                        delete stack[key];
                    }
                });
            };
        },

        Timeline: function (stacker, id) {
            this.id = stacker.id + '-' + id;
            var queue = [];
            this.add = function (startFrame, endFrame, symbol) {
                if (typeof queue[startFrame] == 'undefined') {
                    queue[startFrame] = [];
                }
                symbol.shouldTrash = function (frame) {
                    return frame == endFrame
                };
                queue[startFrame].push(symbol);
            };
            this.tick = function (count) {
                if (typeof queue[count] == 'object') {
                    queue[count].forEach(function (item) {
                        stacker.add(item.create());
                    });
                    delete queue[count];
                }
            };
            this.isTrash = function () {
                return !queue.filter(function (n) {
                        return n != undefined
                    }).length > 0;
            };
            this.create = function (frame, siblings) {
                stacker.add(this);
                return this;
            };
            this.create();
        },

        Symbol: function (create, animate) {
            var item = null;
            this.create = function (frame, siblings) {
                item = create(frame, siblings);
                return this;
            };
            this.tick = function (frame) {
                if (!this.isTrash()) {
                    if (typeof item == 'object') {
                        animate(item, frame);
                        if (this.shouldTrash(frame)) {
                            item.remove();
                            item = null;
                        }
                    }
                }
            };
            this.remove = function () {
                item.remove();
                item = null;
            };
            this.isTrash = function () {
                return item === null;
            };
            this.shouldTrash = function (frame) {
                return false;
            };
        },

        Shapes: function (config, extra) {
            extra = typeof extra == 'undefined' ? {} : extra;
            return {
                circle: function (frame, siblings) {
                    var shape = Shape.Circle(config);
                    shape.extra = extra;
                    return shape;
                }
            };
        },

        Animations: {
            forwardAnimation: function (shape, frame) {
                shape.fillColor.hue += 1;
                if (Math.floor(1 - ((shape.fillColor.hue % 2) / 2))) {
                    shape.extra.rotation -= 1;
                    shape.position.y = shape.extra.offset - (Math.sin(shape.extra.rotation) * 5);
                }
            },
            backwardAnimation: function (shape, frame) {
                shape.fillColor.hue -= 1;
                if (Math.floor(1 - (((360 - shape.fillColor.hue) % 2) / 2))) {
                    shape.extra.rotation += 1;
                    shape.position.y = shape.extra.offset - (Math.sin(shape.extra.rotation) * 5);
                }
            },
            changeFillColour: function (shape, frame) {
                shape.fillColor.hue += 1;
            },
            expandEffect: function (shape) {
                if (shape.strokeColor === null) {
                    shape.strokeColor = new Color(1, 0, 0);
                    shape.strokeColor.hue = Math.floor(Math.random() * 360);
                    shape.position = new Point(Math.floor(Math.random() * 600), Math.floor(Math.random() * 600))
                }
                shape.scale(1.05);

            }
        },

        AutoSetup: function (canvas) {
            paper.install(window);
            stacker = new sfb.Stacker('root');
            window.onload = function () {
                paper.setup(canvas);
                view.onFrame = function (e) {
                    stacker.tick(e.count);
                };
            };
        }
    };
})();