asyncTest('EIDB.find via param', function() {
  expect(3);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.open('foo', null, function(db) {
    store = db.createObjectStore('kids', {keyPath: 'id'});
    store.createIndex('by_name', 'name', {unique: false});
    store.createIndex('by_name_color', ['name', 'color']);
  }).then(function() {

    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {

    return EIDB.find('foo', 'kids', {name: 'Eric'});
  }).then(function(res) {
    var expected = [{id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find performs a simple query using an existing index");

    return EIDB.find('foo', 'kids', {color: 'red', name: 'Eric'});
  }).then(function(res) {

    deepEqual(res, [{id: 3, name: "Eric", color: "red"}], ".find performs a multiple key query using an existing index");

    return EIDB.find('foo', 'kids', {id: 1});
  }).then(function(res) {

    deepEqual(res, [{id: 1, name: "Kyle", color: "orange"}], ".find will search the store if the required index does not exist");
    start();
  });
});

asyncTest('EIDB.find via chaining', function() {
  expect(4);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.open('foo', null, function(db) {
    store = db.createObjectStore('kids', {keyPath: 'id'});
    store.createIndex('by_name', 'name', {unique: false});
    store.createIndex('by_name_color', ['name', 'color']);
  }).then(function() {

    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {

    return EIDB.find('foo', 'kids').match('name', /K/).run();
  }).then(function(res) {
    var expected = [{id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find can chain a #match call");

    return EIDB.find('foo', 'kids')
               .match('name', /ric/)
               .match('color', /lu/)
               .run();
  }).then(function(res) {

    deepEqual(res, [{id: 4, name: "Eric", color: "blue"}], ".find can chain multiple #match calls");

    return EIDB.find('foo', 'kids')
               .equal('name', 'Eric')
               .match('color', /lu/)
               .run();
  }).then(function(res) {

    deepEqual(res, [{id: 4, name: "Eric", color: "blue"}], ".find can chain #equal and #match calls");

    return EIDB.find('foo', 'kids')
               .equal('color', 'blue')
               .equal({name: 'Eric'})
               .run();
  }).then(function(res) {

    deepEqual(res, [{id: 4, name: "Eric", color: "blue"}], ".find can chain multiple #equal calls");

    start();
  });
});