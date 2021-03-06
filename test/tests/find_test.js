module("EIDB.find", {
  setup: function() {
    EIDB.delete('foo');
  },
  teardown: function() {
    EIDB.delete('foo');
  }
});

asyncTest('via param', function() {
  expect(3);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.open('foo', null, function(db) {
    var store = db.createObjectStore('kids', {keyPath: 'id'});
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

asyncTest('via chaining', function() {
  expect(17);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.open('foo', null, function(db) {
    var store = db.createObjectStore('kids', {keyPath: 'id'});
    store.createIndex('by_name', 'name', {unique: false});
    store.createIndex('by_name_color', ['name', 'color']);
    store.createIndex('by_color_id', ['color', 'id']);
  }).then(function() {

    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {

    return EIDB.find('foo', 'kids').match('name', /K/).run();
  }).then(function(res) {
    var expected = [{id: 1, name: "Kyle", color: "orange"},
                    {id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find can chain a #match call");

    return EIDB.find('foo', 'kids').match('asd', /K/).run();
  }).then(function(res) {

    equal(res.length, 0, '.find does not error if matching a non-existent attribute');

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

    return EIDB.find('foo', 'kids')
               .gte('name', 'Kenny')
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"}, {id: 1, name: "Kyle", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #gte call");

    return EIDB.find('foo', 'kids')
               .gt('name', 'Kenny')
               .run();
  }).then(function(res) {
    var expected = [{id: 1, name: "Kyle", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #gt call");

    return EIDB.find('foo', 'kids')
               .lt('name', 'Kenny')
               .run();
  }).then(function(res) {
    var expected = [{id: 3, name: "Eric", color: "red"},
                    {id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find accepts a #lt call");

    return EIDB.find('foo', 'kids')
               .lte('name', 'Kenny')
               .run();
  }).then(function(res) {
    var expected = [{id: 3, name: "Eric", color: "red"},
                    {id: 4, name: "Eric", color: "blue"},
                    {id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #lte call");

    return EIDB.find('foo', 'kids')
               .gte('name', 'Kenny')
               .equal('color', 'orange')
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"},
                    {id: 1, name: "Kyle", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #gte and a #equal call");

    return EIDB.find('foo', 'kids')
               .gte('id', 2)
               .equal('color', 'orange')
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #gte and a #equal call");

    return EIDB.find('foo', 'kids')
               .equal('color', 'orange')
               .lte('name', 'Kenny')
               .run();
  }).then(function(res) {
    var expected = [{id: 4, name: "Eric", color: "blue"},
                    {id: 3, name: "Eric", color: "red"},
                    {id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #lte and a #equal call");

    return EIDB.find('foo', 'kids')
               .lte('id', 1)
               .eq('color', 'orange')
               .run();
  }).then(function(res) {
    var expected = [{id: 1, name: "Kyle", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #lte and a #equal call");

    return EIDB.find('foo', 'kids')
               .lt('id', 2)
               .eq('color', 'orange')
               .run();
  }).then(function(res) {
    var expected = [{id: 1, name: "Kyle", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #lt (number) and a #equal call");

    return EIDB.find('foo', 'kids')
               .lt('color', 'red')
               .eq('name', 'Eric')
               .run();
  }).then(function(res) {
    var expected = [{id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find accepts a #lt (string) and a #equal call");

    return EIDB.find('foo', 'kids')
               .eq('color', 'orange')
               .gt('id', 1)
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"}];

    deepEqual(res, expected, ".find accepts a #gt (number) and a #equal call");

    return EIDB.find('foo', 'kids')
               .gt('color', 'blue')
               .eq('name', 'Eric')
               .run();
  }).then(function(res) {
    var expected = [{id: 3, name: "Eric", color: "red"}];

    deepEqual(res, expected, ".find accepts a #gt (string) and a #equal call");

    start();
  });
});

asyncTest('index generation', function() {
  expect(4);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.createObjectStore('foo', 'kids', {keyPath: 'id'}).then(function() {
    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {
    return EIDB.find('foo', 'kids')
               .lt('color', 'orange')
               .run();
  }).then(function(res) {
    var expected = [{id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find will create an index if one doesn't exist");

    return EIDB.open('foo');
  }).then(function(db) {
    var index = db.objectStore('kids').index('color');

    equal(index.keyPath, 'color', ".find creates the correct keyPath (single) on the index");

    return EIDB.find('foo', 'kids')
               .eq({name: 'Eric', color: 'blue'})
               .run();
  }).then(function(res) {
    var expected = [{id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find will create a compound index if one doesn't exist");

    return EIDB.open('foo');
  }).then(function(db) {
    var index = db.objectStore('kids').index('color_name');

    deepEqual(index.keyPath.length, 2, ".find creates the correct keyPath (compound) on the index");

    start();
  });
});

asyncTest('#filter', function() {
  expect(1);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.createObjectStore('foo', 'kids', {keyPath: 'id'}).then(function() {
    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {
    return EIDB.find('foo', 'kids')
               .filter(function(value) { return value.id > 3; })
               .filter(function(value) { return value.color === 'blue'; })
               .run();
  }).then(function(res) {
    var expected = [{id: 4, name: "Eric", color: "blue"}];

    deepEqual(res, expected, ".find accepts a #filter function");

    start();
  });
});

asyncTest('#first, #last and cursor direction', function() {
  expect(5);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.createObjectStore('foo', 'kids', {keyPath: 'id'}).then(function() {
    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {
    return EIDB.find('foo', 'kids')
               .first();
  }).then(function(res) {
    var expected = {id: 1, name: "Kyle", color: "orange"};

    deepEqual(res, expected, ".find accepts a #first call");

    return EIDB.find('foo', 'kids')
               .eq('name', 'Eric')
               .first();
  }).then(function(res) {
    var expected = {id: 3, name: "Eric", color: "red"};

    deepEqual(res, expected, ".find accepts a #first call in a chain");

    return EIDB.find('foo', 'kids')
               .last();
  }).then(function(res) {
    var expected = {id: 4, name: "Eric", color: "blue"};

    deepEqual(res, expected, ".find accepts a #last call in a chain");

    return EIDB.find('foo', 'kids')
               .match('color', /rang/)
               .last();
  }).then(function(res) {
    var expected = {id: 2, name: "Kenny", color: "orange"};

    deepEqual(res, expected, ".find accepts a #last with a #filter call");

    return EIDB.find('foo', 'kids')
               .run('prev');
  }).then(function(res) {
    var expected = {id: 4, name: "Eric", color: "blue"};

    deepEqual(res[0], expected, ".find accepts a cursor direction via #run");

    start();
  });
});

asyncTest('combined ranges', function() {
  expect(4);

  var records = [
    {id: 1, name: "Kyle", color: "orange"}, {id: 2, name: "Kenny", color: "orange"},
    {id: 3, name: "Eric", color: "red"}, {id: 4, name: "Eric", color: "blue"}
  ];

  EIDB.createObjectStore('foo', 'kids', {keyPath: 'id'}).then(function() {
    return EIDB.addRecord('foo', 'kids', records);
  }).then(function() {

    return EIDB.find('foo', 'kids')
               .gte('id', 2)
               .lte('id', 3)
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"},
                    {id: 3, name: "Eric", color: "red"}];

    deepEqual(res, expected, ".find accepts a #gte and #lte calls for the same property");

    return EIDB.find('foo', 'kids')
               .range('id', [2, 3])
               .run();
  }).then(function(res) {
    var expected = [{id: 2, name: "Kenny", color: "orange"},
                    {id: 3, name: "Eric", color: "red"}];

    deepEqual(res, expected, ".find accepts a #range call (equivalent to #gte + #lte)");

    return EIDB.find('foo', 'kids')
               .gt('id', 2)
               .lt('id', 4)
               .run();
  }).then(function(res) {
    var expected = [{id: 3, name: "Eric", color: "red"}];

    deepEqual(res, expected, ".find accepts a #gt and #lt calls for the same property");

    return EIDB.find('foo', 'kids')
               .lt('id', 2)
               .gt('id', 4)
               .run();
  }).then(function(res) {
    deepEqual(res, [], ".find gives an empty array for a range error");
    start();
  });
});
