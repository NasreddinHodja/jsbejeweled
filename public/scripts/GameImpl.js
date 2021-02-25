import BasicIcon from "./BasicIcon.js";
import BasicIconGenerator from "./BasicIconGenerator.js";
import Cell from "./Cell.js";
import IO from "./IO.js";


class GameImpl {
    /**
     * @constructor
     * @param {number} width
     * @param {number} height
     * @param {BasicIconGenerator} generator
     * @param {IO} io
     */
    constructor(width, height, generator, io){
        this.Base_SCORE = 10;

        this._debug = false;

        // initialize a 2d array
        this.grid = Array.from(Array(height), () => new Array(width));
        this.grid = generator.initialize(this.grid);

        this._score = 0;
        this.generator = generator;
        this.io = io;
    }

    set debug(debug){
        this._debug = debug;
    }

    get debug(){
        return this._debug;
    }

    /**
     * @method
     * @description Returns the Icon at the given location in the game grid
     * @param {number} row row in the grid
     * @param {number} col col in the grid
     */
    getIcon(row,col){
        return this.grid[row][col];
    }

    /**
     * @method
     * @description Sets the Icon at the given location in the game grid
     * @param {number} row row in the grid
     * @param {number} col col in the grid
     * @param {BasicIcon} Icon icon to be set in (row,col)
     */
    setIcon(row,col,Icon){
        this.grid[row][col] = Icon;
    }

    /**
     * @method
     * @description Returns the number of columns in the grid
     * @returns {number} the width of the grid
     */
    get width(){
        return this.grid[0].length;
    }

     /**
      * @method
     * @description Returns the number of rows in the grid
     * @returns {number} the height of the grid
     */
    get height(){
        return this.grid.length;
    }

    /**
     * @method
     * @description Returns the current score
     * @returns {number} current score of the game
     *
     */
    get score(){
        return this._score;
    }

    /**
      * @method
      * @description Receives array of cells and modifies grid according to it.
      * @param {Cell[]} cells
      */
    applyCells(cells) {
        for(let i = 0; i < cells.length; i++) {
            this.grid[cells[i].row][cells[i].col] = cells[i].icon;
        }
    }

    /**
     * @method
     * @description Swap the icons contained in two cells
     * @param {Cell[]} cells cells array with two cells
     * @see swapIcons(i,j,k,l)
     */
    swapCells(cells){
        this.swapIcons(cells[0].row, cells[0].col,
                       cells[1].row, cells[1].col);
    }

    /**
     * @method
     * @description Swap the positions of two icons
     * @param i row of first icon
     * @param j col of first icon
     * @param k row of second icon
     * @param l col of second icon
     */
    swapIcons(i, j, k, l){
        let temp = this.grid[i][j];
        this.grid[i][j] = this.grid[k][l];
        this.grid[k][l] = temp;
    }

    /**
    * @method
    * @description
    *  In this implementation, the only possible move is a swap
    * of two adjacent cells.  In order for move to be made, the
    * following must be True.<br>
    *  - The given array has length 2<br>
    *  - The two given cell positions must be adjacent<br>
    *  - The two given cell positions must have different icon types<br>
    *  - Swapping the two icons must result in at least one run.<br>
    *
    * If the conditions above are satisfied, the icons for the two<br>
    * positions are exchanged and the method returns True otherwise,<br>
    * the method returns False.  No other aspects of the game state<br>
    * are modified.<br>
    *
    * @param {Cell[]} cells cells to select.
    * @returns {boolean} True if the selected cells were modified, False otherwise.
    **/
    select(cells){
        if(cells.length == 2 && cells[0].isValid() && cells[1].isValid() &&
           cells[0].isAdjacent(cells[1]) &&
           !(cells[0].sameIcon(cells[1]))){
            this.swapCells(cells);

            //if after the swap there are no runs, swap back and return false
            if(this.findRuns().length <= 0){
                this.swapCells(cells);
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * @method
     * @description
     * Returns a list of all cells forming the first run in given array of cells.
     * @param {Cell[]} cells array of cells
     * @returns {Cell[]} list of all cells forming first run
     **/
    _findRunsInCells(cells){
        var start = 0;
        let run_cells = [];

        var last_start = cells.length - 3;

        while(start <= last_start) {
            var count = 1;

            while(start + count < cells.length && cells[start].sameIcon(cells[start + count]))
                count++;

            if(count > 2){
                run_cells = run_cells.concat(cells.slice(start, start + count));
            }

            start += count;
        }

        return run_cells;
    }

    /**
    * @method
    * @description
    * Returns a list of all cells forming part of a vertical or horizontal run.
    * The list is in no particular order and may contain duplicates.
    * If the argument is False, no modification is made to the game state;
    * if the argument is True, grid locations for all cells in the list are
    * nulled, and the score is updated.
    *
    * @param {bool} doMarkAndUpdateScore if False, game state is not modified.
    * @returns {Cell[]} list of all cells forming runs, in the form:
     **/
    findRuns(DoMarkAndUpdateScore){
        let run_cells = [];

        // check rows

        for(var row = 0; row < this.height; row++){
            run_cells = run_cells.concat(
                this._findRunsInCells(this.cellsFromRow(row))
            );
        }


        // check cols
        for(var col = 0; col < this.width; col++){
            run_cells = run_cells.concat(
                this._findRunsInCells(this.cellsFromCollumn(col))
            );
        }

        if(DoMarkAndUpdateScore){
            for(let i = 0; i < run_cells.length; i++){
                if(!run_cells[i]) continue;

                this._score += 1;
                let c = run_cells[i];
                // this.grid[c.row][c.col] = new BasicIcon(null);
                // this.removeAndShiftDown(c.row, c.col);
            }

        }


        return run_cells;
    }

    /**
     * @method
     * @description
     * Removes an element at position (row,col) from the grid.
     * All elements above the given position are shifted down, and the first
     * cell of the column is set to null.
     * @param {number} row row of the element that should be removed
     * @param {number} col col of the element that should be removed
     */
    removeAndShiftDown(row, col){
        this.grid[row][col] = new BasicIcon(null);
        this.io.draw(this.grid);
        let cells = this.collapseColumn(col);
        this.applyCells(cells);
        this.sleep(1000);
    }

    /**
     * @method
     * @description
     * Collapses the icons in the given column of the current game grid
     *  such that all null positions, if any, are at the top of the column
     *  and non-null icons are moved toward the bottom (i.e., as if by gravity).
     *  The returned list contains Cells representing icons that were moved
     *  (if any) in their new locations. Moreover, each Cell's previousRow property
     *  returns the original location of the icon. The list is in no particular order.
     * @param {number} col  collumn to be collapsed
     * @returns {Cell[]} list of cells for moved icons
     */
    collapseColumn(col){
        let non_nulls = [];
        let new_col = [];


        for(let i = 0; i < this.grid.length; i++){
            if(this.grid[i][col].type == null)
                new_col.push(new Cell(i, col, new BasicIcon(null)));
            else
                // non_nulls.push(new Cell(i, col, this.grid[i][col]));
                non_nulls.push(new Cell(i, col, this.grid[i][col]));
        }

        for(let i = 0; i < non_nulls.length; i++)
            non_nulls[i].row = new_col.length + i;
        for(let i = 0; i < new_col.length; i++)
            new_col[i].row = i;

        return new_col.concat(non_nulls);
    }

    /**
     * @method
     * @description
     * Fills the null locations (if any) at the top of the given column in the current game grid.
     * The returned list contains Cells representing new icons added to this column in
     * their new locations.
     * The list is in no particular order.
     * @param {number} col column to be filled
     * @returns {Cell[]} list of new cells for icons added to the column
     */
    fillCollumn(col){
        let new_cells = [];

        for(let i = 0; i < this.height; i++){
            if(this.getIcon(i,col).type == null){
                let new_icon = this.generator.generate();

                this.grid[i][col] = new_icon;
                new_cells.push(new Cell(i, col, new_icon));
            }
        }

        if(this.debug) console.log(new_cells);

        return new_cells;
    }

    /**
     * @method
     * @description Remove all runs from the grid
     * @returns {boolean} true if removed at least one run
     */
    removeAllRuns(){
        let removed = false;
        let run_cells = this.findRuns(true);
        while(run_cells.length != 0){
            if(this.debug) console.log(this.toString());
            removed = true;
            for(let i = 0; i < run_cells.length; i++)
                this.removeAndShiftDown(run_cells[i].row, run_cells[i].col);
            // for(let i = 0; i < this.grid.width; i++){
            //     this.collapseColumn(i);
            // }

            run_cells = this.findRuns(true);
        }

        return removed;
    }

    /**
     * @method
     * @description Creates array of cells from given row.
     * @param {number} row row of grid
     * @returns {Cell[]} array of cells from given row
     */
    cellsFromRow(row){
        let cells = [];
        for(let i = 0; i < this.width; i++)
            cells.push(new Cell(row, i, this.grid[row][i]));
        return cells;
    }

    /**
     * @method
     * @description Creates array of cells from given collumn.
     * @param {number} col collumns of grid
     * @returns {Cell[]} array of cells from given collumn
     */
    cellsFromCollumn(col){
        let cells = [];
        for(let i = 0; i < this.height; i++)
            cells.push(new Cell(i, col, this.grid[i][col]));
        return cells;
    }

    /**
     * @method
     * @description
     * Draws board.
     */
    draw() {
        this.io.draw(this.grid);
    }

    /**
     * @method
     * @description
     * Returns a String representation of the grid for this game,
     * with rows delimited by newlines.
     * @returns {string}
     */
    toString(){
        let s = "";

        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                if(!this.grid[i][j]) s = s.concat("-1");
                else s = s.concat(this.grid[i][j].toString());
            }
            s = s.concat("\n");
        }

        return s;
    }

    /**
     * @method
     * @description
     *
     * Return a string representation of the grid, with 8 symbols:
     * - `01234567`
     * - `!@+*$%#.`
     *
     * @returns {string}
     */
    repr(){
        let s = "";

        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                s = s.concat("!@+*$%#.".charAt(parseInt(this.grid[i][j].toString())));
            }
            s = s.concat("\n");
        }

        return s;
    }

    /**
     * @method
     * @description
     * Returns a string representation of a list of cells
     * @param {Cell[]} cells list of cells
     * @returns {string}
     */
    cellsToString(cells){
        let s = "{\n";
        for(let i = 0; i < cells.length; i++)
            s = s.concat(cells[i].toString()).concat(",\n");
        s = s.concat("}");
        return s;
    }

    /**
     * @method
     * @description
     * Sleep for specified milliseconds.
     * @param {number} milliseconds
     */
    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++)
            if ((new Date().getTime() - start) > milliseconds)
                break;
    }
}

export default GameImpl;
