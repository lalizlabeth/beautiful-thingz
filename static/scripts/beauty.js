// page size
var windowHeight = 1700,
// var windowHeight = window.innerHeight,
    windowWidth = window.innerWidth;

// colors
var pink = '#ec469c',
    yellow = '#ffdb47',
    purple = '#a538e3',
    blue = '#1fcee5',
    orange = '#ff8000',
    green = '#1fcb58',
    darkBlue = '#fff';

// module aliases
var Bodies = Matter.Bodies,
    Body = Matter.Body,
    Engine = Matter.Engine,
    Common = Matter.Common,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Svg = Matter.Svg,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    World = Matter.World;

// create an engine
var engine = Engine.create(),
    world = engine.world;

engine.world.gravity.y = 0;
// give objects a lot of drag

world.bounds.min.x = 0;
world.bounds.min.y = 0;
world.bounds.max.x = innerWidth;
world.bounds.max.y = innerHeight;

// create a renderer
var render = Render.create({
    canvas: document.querySelector('#drawing'),
    engine: engine,
    options: {
      background: "black",
      height: windowHeight,
      width: windowWidth,
      wireframes: false
    }
});

var runner = Runner.create(); // to do: is this necessary?!?! what does this even do.
Runner.run(runner, engine);
Render.run(render, engine);

// draws walls
var wallOptions = { 
    isStatic: true,
    render: {
        fillStyle: 'black'
    }
};

var borderSize = 1;
World.add(engine.world, [
    Bodies.rectangle(0, windowHeight, windowWidth * 2-borderSize, borderSize, wallOptions),
    Bodies.rectangle(0, 0, windowWidth * 2-borderSize, borderSize, wallOptions),
    Bodies.rectangle(0, 0, borderSize, windowHeight * 2-borderSize, wallOptions),
    Bodies.rectangle(windowWidth, 0, borderSize, windowHeight * 2, wallOptions),
]);

// drawing objects
var objects = [];
var linesOff = { render: { visible: false } };

// creates circle grid
var circleSoftBody1 = Composites.softBody(
  0.2*windowWidth, 0.7*windowHeight, 3, 3, 0, 0, true, 75,
  {
    friction: 1.0,
    frictionAir: 1.0,
    render: {
      fillStyle: pink,
      visible: true
    } 
  },
  linesOff
);
objects.push(circleSoftBody1);

// creates linked circles
var circleSoftBody2 = Composites.softBody(
  0.9*windowWidth, windowHeight * 0.1, 1, 7, 10, 10, true, 60,
  {
    friction: 0.8,
    frictionAir: 0.8,
    density: 0.9,
    render: {       
      fillStyle: blue,
      visible: true
    } 
  },
  {
    render: {
      strokeStyle: 'white',
      lineWidth: 2
    }
  }
);

objects.push(circleSoftBody2);

// creates rectangle
var rectangle = Bodies.rectangle(
    0.6*windowWidth,
    0.2 * windowHeight,
    80,
    600,
    {
      angularVelocity: 0.2,
      frictionAir: 0.8,
      friction: 0.7,
      render: {
        fillStyle: green
      } 
    }
);

Body.rotate(rectangle, Math.random());
objects.push(rectangle);

var circle = Bodies.circle(
    0.7*windowWidth,
    Math.random() * windowHeight,
    90,
    {
      friction: 0.5,
      frictionStatic: 10,
      restitution: 1.0,
      speed: 0.3,
      render: {
        fillStyle: purple
      } 
    }
);
Body.applyForce(circle, { x: 0, y: 0 }, { x: 0.2, y: 0.3 });
objects.push(circle);

// Creating triangle
var triangle = Bodies.polygon(
    0.2*windowWidth,
    0.3 * windowHeight,
    3,
    50,
    {
      chamfer: { radius: 10 },
      friction: 1,
      render: {
        fillStyle: orange
    }
  });
Body.rotate(triangle, Math.random());
objects.push(triangle);

var size = 150;

var stackOptions = {
  friction: 1.0,
  rotate: Math.random(),
  render: {
    fillStyle: "white",
  }
}

var plus1 = Composites.stack(windowWidth*0.9, windowHeight*0.7, 1, 1, 0, 0, function(x, y) {
    var partA = Bodies.rectangle(x, y, size, size / 5, stackOptions),
        partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    return Body.create({
        parts: [partA, partB]
    });
});

var plus2 = Composites.stack(10, 20, 1, 1, 0, 0, function(x, y) {
    var partA = Bodies.rectangle(x, y, size, size / 5, stackOptions),
        partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    return Body.create({
        parts: [partA, partB]
    });
});

objects.push(plus1, plus2);

// Scaling things for large screen
for (var i = 0; i < objects.length; i +=1){
  var type = objects[i].type;
  if (type == "composite") {
    // console.log(objects[i]);
    // Composite.scale(objects[i], 2, 2);
  } else {
    Body.scale(objects[i], 2, 2);
  }  
};

$.get('../static/img/blob.svg').done(function(data) {
    var vertexSets = [],
        color = yellow;
    $(data).find('path').each(function(i, path) {
        var points = Svg.pathToVertices(path);
        vertexSets.push(Vertices.scale(points, 1.75, 1.6));
    });


    World.add(world, Bodies.fromVertices(windowWidth*0.2, 0.6 * windowHeight, vertexSets, {
        friction: 0,
        angularVelocity: 0.5,
        render: {
            fillStyle: color,
            strokeStyle: color,
            lineWidth: 1
        }
    }, true));
});

// adding objects to the world
World.add(world, objects);

var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.9,
            render: {
                visible: false
            }
        }
    });

var seconds = 1;
setInterval(function () {
  seconds++;
}, 1000);

var trail = [];

// Rendering
Events.on(render, 'afterRender', function() {
    trail.unshift({
        position: Vector.clone(circle.position),
        speed: circle.speed,
        shapeSize: circle.circleRadius
    });

    Render.startViewTransform(render);

    for (var i = 0; i < trail.length; i += 1) {
        render.context.globalAlpha = 0.3;

        var point = trail[i].position,
            speed = trail[i].speed,
            shapeSize = trail[i].shapeSize;
        
        render.context.fillStyle = purple;

        render.context.setLineDash([]);
        render.context.beginPath();
        render.context.ellipse(point.x, point.y, shapeSize/i, shapeSize/i, Math.PI / 4, 0, 2 * Math.PI);
        render.context.fill()
    }

    render.context.globalAlpha = 1.0;
    Render.endViewTransform(render);

    if (trail.length > 120) {
        trail.pop();
    }

    Body.scale(circle, 0.002 * Math.sin(seconds*2) + 1, 0.002 * Math.sin(seconds*2) + 1);
});


var triangle_trail = [];

Events.on(render, 'afterRender', function() {
    triangle_trail.unshift({
        position: Vector.clone(triangle.position),
        speed: triangle.speed,
        shapeSize: 50
    });

    Render.startViewTransform(render);
    

    for (var i = 0; i < triangle_trail.length; i += 1) {
        render.context.globalAlpha = 0.3;

        var point = triangle_trail[i].position,
            speed = triangle_trail[i].speed,
            shapeSize = triangle_trail[i].shapeSize;
        
        render.context.fillStyle = orange;
        // var hue = 30 + Math.round((1 - Math.min(1, speed / 10))*5);
        // var hue = 30;
        // render.context.globalCompositeOperation = 'multiply';
        // render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';

        render.context.setLineDash([]);
        render.context.beginPath();
        render.context.ellipse(point.x, point.y, shapeSize/i, shapeSize/i, Math.PI / 4, 0, 2 * Math.PI);
        render.context.fill()
    }

    render.context.globalAlpha = 1.0;
    Render.endViewTransform(render);

    if (triangle_trail.length > 120) {
        triangle_trail.pop();
    }

    Body.scale(triangle, 0.002 * Math.sin(seconds) + 1, 0.002 * Math.sin(seconds) + 1);
    

});

// add mouse constraint
World.add(engine.world, mouseConstraint);

$('#save').on('click', function(){
    var canvasElement = document.getElementById('drawing');
    var MIME_TYPE = "image/png";
    var imgURL = canvasElement.toDataURL(MIME_TYPE);

    $.post('/save', {imgdata: imgURL});
});

$('#reset').on('click', function(){
  engine.clear();
})












