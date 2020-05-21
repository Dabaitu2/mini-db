## MINI DB
Naive Database which is based on Nodejs fs API and File Operation.<br>
Do not Support `Update` yet. 
## API

### init
```ts
const DataBase = require('../index')
DataBase.init('/path/to/your/dest/', 'xxx')
```
### set
```ts
// after init
// must be object
DataBase.set({
    a: 1,
    b: 2
})
.then()
.catch(err => {
 // ...
})
```
### get
```ts
DataBase.get('a')
.then(data => {
    console.log(data); // [1, ...]
}).catch(err => {
    // ...
})
```
### remove
```ts
DataBase.remove('a')
.then()
.catch(err => {
    // ...
})
```

### clear
```ts
DataBase.clear().then().catch()
```

## License
MIT
