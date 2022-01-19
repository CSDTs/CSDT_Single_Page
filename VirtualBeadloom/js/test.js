// if (this._direction == "-y") {
//   for (let i = 0; i < this._rows * scale; i = i + scale) {
//     if (i % (this._group * scale) == 0 && i != 0) {
//       inc = inc + this._extra;
//       counter++;
//     }

//     for (let j = 0; j <= inc; j++) {
//       forward = { x: start.x + inc * scale, y: start.y + i };
//       back = { x: start.x - inc * scale, y: start.y + i };
//       if (inc == 0)
//         createAndStamp(start.x, start.y + i, this.gradient[counter], true);
//       else this.line(back, forward, this.gradient[counter]);
//     }
//   }
// } else if (this._direction == "-x") {
//   for (let i = 0; i < this._rows * scale; i = i + scale) {
//     if (i % (this._group * scale) == 0 && i != 0) {
//       inc = inc + this._extra;
//       counter++;
//     }

//     for (let j = 0; j <= inc; j++) {
//       forward = { x: start.x - i, y: start.y + inc * scale };
//       back = { x: start.x - i, y: start.y - inc * scale };
//       if (inc == 0)
//         createAndStamp(start.x - i, start.y, this.gradient[counter], true);
//       else this.line(back, forward, this.gradient[counter]);
//     }
//   }
// } else if (this._direction == "+y") {
//   for (let i = 0; i < this._rows * scale; i = i + scale) {
//     if (i % (this._group * scale) == 0 && i != 0) {
//       inc = inc + this._extra;
//       counter++;
//     }
//     for (let j = 0; j <= inc; j++) {
//       forward = { x: start.x + inc * scale, y: start.y - i };
//       back = { x: start.x - inc * scale, y: start.y - i };

//       if (inc == 0)
//         createAndStamp(start.x, start.y - i, this.gradient[counter], true);
//       else this.line(back, forward, this.gradient[counter]);
//     }
//   }
// } else {
//   for (let i = 0; i < this._rows * scale; i = i + scale) {
//     if (i % (this._group * scale) == 0 && i != 0) {
//       inc = inc + this._extra;
//       counter++;
//     }

//     for (let j = 0; j <= inc; j++) {
//       forward = { x: start.x + i, y: start.y + inc * scale };
//       back = { x: start.x + i, y: start.y - inc * scale };

//       if (inc == 0)
//         createAndStamp(start.x + i, start.y, this.gradient[counter], true);
//       else this.line(back, forward, this.gradient[counter]);
//     }
//   }
// }
