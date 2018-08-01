'use strict';

let Datestore = require('nedb');
let Fiber = require('fibers');

let db = {
    tables: {}
};

class Table {
    constructor() {
        this._db = new Datestore();
    }

    execSync(f) {
        let result = null;
        let error = null;
        let fiber = Fiber.current;

        f(function(err, docs) {
            if ( err ) {
                error = err;
            }
            else {
                result = docs;
            }

            fiber.run();
        });

        Fiber.yield();

        if ( error ) {
            throw error;
        }

        return result;
    }

    insert(rows) {
        let insertFunc = this._db.insert.bind(this._db, rows);
        return this.execSync(insertFunc);
    }

    find(conditions) {
        let findFunc = this._db.find.bind(this._db, conditions);
        return this.execSync(findFunc);
    }

    update(conditions, updater) {
        let updateFunc = this._db.update.bind(this._db, conditions, updater);
        return this.execSync(updateFunc);
    }
    
    count(conditions) {
        let countFunc = this._db.count.bind(this._db, conditions);
        return this.execSync(countFunc);
    }
     
    remove(conditions) {
        let removeFunc = this._db.remove.bind(this._db, conditions, {
            multi: true
        });
        return this.execSync(removeFunc);
    }
}

function createModel(modelName, schema){
	class Model {
		constructor(values){
			Object.defineProperty(this,
				'id', {
					get(){
						return this._id;
					},
					set(id){
						this._id = id;
					},
					enumerable: true,
					configurable: false
				});
		}
	}
		
    Model._table = new Table(modelName);

	Model.create = function(object){
        let id = Model._table.insert(object)._id;
        let newObject = Model.findOne({'_id': id});
        newObject['id'] = newObject._id;
        Model.update(newObject, {'_id': id});
        return id;
	}
		
	Model.update = function(object, options){
        return Model._table.update(options, object);
	}
		
	Model.find = function(options){
        return Model._table.find(options);
	}
		
    Model.remove = function(options) {
        return Model._table.remove(options);
    }
    
    Model.count = function(options) {
        return Model._table.count(options);
    }

	Model.findOne = function(options){
		let result = Model._table.find(options);

		if (result.length > 0) {
			return result[0];
		} else {
			return null;
		}
	}
	
	return Model;
}

module.exports = {
    createModel: createModel
};
