// Project Handling
////////////////////////////////////////////////////////////////////
function loadFromJSON(text) {
  beadStack.length = 0;
  stackLength = -1;

  JSON.parse(text).forEach((obj) => {
    let current = createCorrectPattern(obj);
    beadStack.push(current);
    ++stackLength;
    current.displayBeads();
  });

  stackLength++;
  updateCanvas();
}

function createCorrectPattern(obj) {
  if (obj.pattern == "line")
    return new LinePattern(
      obj.initPoint || obj.start,
      obj.endPoint || obj.end,
      obj.initColor || obj.color,
      true
    );

  if (obj.pattern == "rectangle")
    return new RectanglePattern(
      obj.initPoint || obj.start,
      obj.endPoint || obj.end,
      obj.initColor || obj.color,
      true
    );

  if (obj.pattern == "triangle")
    return new TrianglePattern(
      obj.initPoint || obj.start,
      obj.topPoint || obj.mid,
      obj.endPoint || obj.end,
      obj.initColor || obj.color,
      true
    );

  if (obj.pattern == "linear-iteration")
    return new LinearIteration(
      obj.linearRowLength || obj.length,
      obj.initPoint || obj.start,
      obj.linearPreNum || obj.pre,
      obj.linearPostNum || obj.post,
      obj.rows || obj.rows,
      obj.direction || obj.direction,
      obj.initColor || obj.colorA,
      obj.iterColor || obj.colorB,
      true
    );

  if (obj.pattern == "triangle-iteration")
    return new TriangleIteration(
      obj.initPoint || obj.start,
      obj.triRowGroup || obj.group,
      obj.triRowPrePost || obj.extra,
      obj.rows || obj.rows,
      obj.direction || obj.direction,
      obj.initColor || obj.colorA,
      obj.iterColor || obj.colorB,
      true
    );

  return new Wampum(
    obj.initPoint || obj.start,
    obj.initColor || obj.color,
    true,
    obj.pattern
  );
}
