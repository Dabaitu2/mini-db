const fs = require('fs');
const path = require('path');
const readline = require('readline');

let _dbDir = path.resolve(__dirname);
let _filename = 'electron';
let _customExtension = '.customdb';
let _filenameWithExtension = '';
let _fullPath = '';
let _hasInit = false;

const UNINIT_TIPS = 'DateBase Error: Please init Database first!';
const TYPE_MUST_BE_OBJECT = 'DateBase Error: Data must be object!';

const init = (dbDir, filename) => {
    _dbDir = dbDir;
    _filename = (filename || _filename);
    _filenameWithExtension = _filename + _customExtension;
    _fullPath = path.resolve(_dbDir, _filenameWithExtension);
    _hasInit = true;
}

const set = (data) => _set(_fullPath, data);
const _set = (path, data) => new Promise((resolve, reject) => {
    if (!_hasInit) {
        reject(UNINIT_TIPS);
        return;
    }
    if (typeof  data !== 'object') {
        reject(TYPE_MUST_BE_OBJECT);
        return;
    }
    // TODO 增加自增id
    fs.appendFile(path, JSON.stringify(data) + '\n', {}, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const recursivelyCheck = (data, target, resultList) => {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === target) {
                resultList.push(data[target]);
            } else if (typeof data[key] === 'object') {
                recursivelyCheck(data[key], target, resultList);
            }
        }
    }
};

const recursivelyDelete = (data, target) => {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === target) {
                delete data[target];
            } else if (typeof data[key] === 'object') {
                recursivelyDelete(data[key], target);
            }
        }
    }
};

const clear = () => new Promise((resolve, reject) => {
    if (!_hasInit) {
        reject(UNINIT_TIPS);
        return;
    }
    fs.unlink(_fullPath, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve(true);
        }
    });
});

const get = (key) => new Promise((resolve, reject) => {
    if (!_hasInit) {
        reject(UNINIT_TIPS);
        return;
    }
    const results = [];
    const readStream = fs.createReadStream(_fullPath);
    readStream.on('error', (err) => {
        reject(err);
    })
    readStream.on('open', () => {
        const reader = readline.createInterface({
            input: readStream,
            output: Infinity
        });
        reader.on('line', (line) => {
            const data = JSON.parse(line);
            recursivelyCheck(data, key, results);
        });
        reader.on('close', () => {
            resolve(results);
        });
        reader.on('error', (err) => {
            reject(err);
        })
    })
});


const remove = (key) => new Promise((resolve, reject) => {
    if (!_hasInit) {
        reject(UNINIT_TIPS);
        return;
    }
    const temp_target_name = 'temp_' + _filenameWithExtension;
    const temp_target = path.resolve(_dbDir, temp_target_name);
    const promiseTasks = [];
    const readStream = fs.createReadStream(_fullPath);
    readStream.on('error', (err) => {
        reject(err);
    })
    readStream.on('open', () => {
        const reader = readline.createInterface({
            input: readStream,
            output: Infinity
        });
        reader.on('line', (line) => {
            const data = JSON.parse(line);
            recursivelyDelete(data, key);
            if (Object.keys(data).length !== 0) {
                promiseTasks.push(_set(temp_target, data));
            }
        });
        reader.on('close', () => {
            Promise.all(promiseTasks).then(
                () => {
                    if (promiseTasks.length === 0) {
                        fs.appendFile(temp_target, '', {}, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            fs.rename(temp_target, _fullPath, (err) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve();
                                }
                            });
                        })
                    } else {
                        fs.rename(temp_target, _fullPath, (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve();
                            }
                        });
                    }
                }
            ).catch((e) => {
                reject(e);
            })
        });
    })
});

module.exports = {
    init,
    set,
    get,
    remove,
    clear
}
