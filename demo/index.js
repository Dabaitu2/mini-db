const DataBase = require('../index')
DataBase.init('/Users/tomokokawase/', 'hehe')
DataBase.set( {
    a: 1,
    b: 2
})

DataBase.get( 'slardar_web_id').then(data => {
    console.log(data)
})

DataBase.remove( 'a');
