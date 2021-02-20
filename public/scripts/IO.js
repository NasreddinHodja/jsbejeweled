class IO {
    /**
     * @constructor
     * @param {number} board_w
     * @param {number} board_h
     * @param {BasicIconGenerator} generator
     */
    constructor(grid_w, grid_h) {
        this.canvas = document.getElementById("bejeweled");
        this.context= this.canvas.getContext("2d");
        this.context.moveTo(0, 0);

        this.grid_w = grid_w;
        this.grid_h = grid_h;

        this.square_size =  this.canvas.width / grid_w;

        this.colors = [
            "#23001a",
            "#04ff00",
            "#0000ff",
            "#ff0000",
            "#05ffff",
            "#ff00c3",
            "#ffe100",
            "#0988ff",
            "#ffb4ad",
            "#005800"
        ];

        this.selected = [];

        // this.canvas.addEventListener("click", this.select.bind(this), false);
        this.canvas.addEventListener("click", this.select.bind(this), false);
    }

    /**
     * @method
     * @description
     * Transforms coordinates (x, y) on page to position in canvas.
     * @param {number} x
     * @param {number} y
     * @returns {x: number, y: number}
     */
    posPageToCanvas(x, y) {
        return {x: x - this.canvas.offsetLeft,
                y: y - this.canvas.offsetTop};
    }

    /**
     * @method
     * @description
     * Transforms coordinates (x, y) on canvas to position in game grid.
     * @param {number} x
     * @param {number} y
     * @returns {x: number, y: number}
     */
    posCanvasToGrid(x, y) {
        return {x: Math.floor(x / this.square_size),
                y: Math.floor(y / this.square_size)};
    }

    /**
     * @method
     * @description
     * Draws square at (x, y) and fill with color of icon.
     * @param {number} x
     * @param {number} y
     * @param {number} borderSize
     * @param {number} icon
     */
    square(x, y, borderSize, icon) {
        this.context.beginPath();
        this.context.rect(x + borderSize/2,
                          y + borderSize/2,
                          this.square_size - borderSize,
                          this.square_size - borderSize);
        this.context.fillStyle = this.colors[icon];
        this.context.fill();
    }

    /**
     * @method
     * @description        let canvasX = (e.pageX - this.canvas.offsetLeft);
        let canvasY = (e.pageY - this.canvas.offsetTop);
        let posX = Math.floor(canvasX / this.square_size);
        let posY = Math.floor(canvasY / this.square_size);

     * Draws game grid.
     * @param {number[][]} grid
     */
    draw(grid) {
        for(let i = 0; i < grid.length; i++) {
            for(let j = 0; j < grid[0].length; j++) {
                this.square(i * this.square_size, j * this.square_size, 10,
                            grid[i][j]);
            }
        }
        this.context.stroke();

        // this.highlightSelected();
    }

    /**
     * @method
     * @description
     * Highligts square at pos (x, y).
     * @param {number} x
     * @param {number} y
     */
    highlightSquare(x, y) {
        this.context.beginPath();
        let border = this.square_size / 1.5;
        this.context.rect(x + border / 2,
                          y + border / 2,
                          this.square_size - border,
                          this.square_size - border);
        this.context.fillStyle = "#282a36";
        this.context.fill();
    }

    /**
     * @method
     * @description
     * Highligts all squares in this.selected.
     */
    highlightSelected() {
        // console.log(this.selected);
        for(let i = 0; i < this.selected.length; i++){
            let {x, y} = this.selected[i];
            this.highlightSquare(x * this.square_size,
                                 y * this.square_size);
        }
    }

    /**
     * @method
     * @description
     * Adds (x, y) to this.selected. If (x, y) existis in this.selected, doesn't add.
     * Also removes first element so as to keel this.selected.length <= 2.
     * @param {number} x
     * @param {number} y
     */
    pushSelected(x, y) {
        for(let i = 0; i < this.selected.length; i++) {
            if(x == this.selected[i].x && y == this.selected[i].y) {
                this.selected.splice(i, 1);
                return;
            }
        }

        this.selected.push({x, y});
        if(this.selected.length > 2)
            this.popSelected();
    }

    /**
     * @method
     * @description
     * Removes and returns first element of this.selected.
     * @returns {x: number, y: number}
     */
    popSelected() {
        let {x, y} = this.selected[0];
        this.selected.shift();

        return {x, y};
    }

    selectedToString() {
        let s = "[\n";
        for(let i = 0; i < this.selected.length; i++) {
            s = s.concat("( " + this.selected[i].x + ", " + this.selected[i].y + " ) ");
        }

        s = s.concat("]");
        return s;
    }

    /**
     * @method
     * @description
     * Event listener funtion that selects clicked square.
     */
    select(e) {
        let {x, y} = this.posPageToCanvas(e.pageX, e.pageY);
        ({x, y} = this.posCanvasToGrid(x, y));

        this.pushSelected(x, y);
        document.getElementById("selected").textContent = this.selectedToString();
    }
}

export default IO;
