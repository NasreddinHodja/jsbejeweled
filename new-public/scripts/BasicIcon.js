class BasicIcon{
    /**
     * @constructor
     * @param {any[]} type
     */
    constructor(type){
        this._type = type;
    }

    /**
     * @method
     * @returns {any} - the icon type
     */
    get type(){
        return this._type;
    }

    /**
     * @method
     * @description check if two icons are equal (same type, with type not null)
     * @param {BasicIcon} other
     */
    equals(other){
        // if they are equal and not null
        if(this._type == other._type && other._type !== null)
            return true;

        return false;
    }

    /**
     * @method
     * @description returns a string representation of the Icon
     * @returns {string}
     */
    toString(){
        return this._type.toString();
    }
}

export default BasicIcon;
