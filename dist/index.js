"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeList = exports.TreeListContext = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _reactWindow = require("react-window");

var _filter = require("./filter.svg");

var _filter2 = _interopRequireDefault(_filter);

var _sortAscending = require("./sort-ascending.svg");

var _sortAscending2 = _interopRequireDefault(_sortAscending);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var LINE_HEIGHT = 30;
var FILTER_BAR_HEIGHT = 45;

// Item Wrapper is the direct item render of react-window List. It does two
// things:

// 1. Skip the history items. Leave them blank over the scrollable views.
// 2. Render the remaining non-sticky items with the actual render we pass
//    into.

var ItemWrapper = function ItemWrapper(_ref) {
  var data = _ref.data,
      index = _ref.index,
      style = _ref.style;
  var ItemRenderer = data.ItemRenderer,
      entries = data.entries;


  if (entries[index] === undefined) {
    return null;
  }

  if (entries[index].filter) {
    return null;
  }

  if (entries[index].listIndex === undefined) {
    return null;
  }

  return _react2.default.createElement(ItemRenderer, { data: entries, index: index, style: style });
};

// TreeList 用来显示层级数据的重要部件
// ----------------------------------
// **props:**
// TreeList accepts a "data" prop, indicating the input tree-like
// data strcture besides other props of react-window. The data
// is in array-of-record form, of which the record should contain a
// children attribute that refers to another array-of-record form.
// 
// **inner attribute / state:**
// The TreeList contains three important attributes. Since they will be
// updated, they can also be seen as state.
// 
// history: the history / path to particular record / node.
// sublist: the children of the record that the history navigate to.
// displayList: the sublist applied with fitler and sort method.
// 
// methods:
// select: select the node from list (either the root nodes or childrens
//         of other node.)


var TreeListContext = (0, _react.createContext)({

  sublist: [],
  displayList: [],
  history: [],

  sort: function sort() {},
  filter: function filter() {},

  pop: function pop() {},
  select: function select() {}
});

var TreeList = function TreeList(_ref2) {
  var data = _ref2.data,
      children = _ref2.children,
      itemSize = _ref2.itemSize,
      historyRowRender = _ref2.historyRowRender,
      rest = _objectWithoutProperties(_ref2, ["data", "children", "itemSize", "historyRowRender"]);

  var ProcessedData = data.map(function (e, i) {
    return _extends({}, e, { listIndex: i });
  });

  var _useState = (0, _react.useState)([]),
      _useState2 = _slicedToArray(_useState, 2),
      history = _useState2[0],
      setHistory = _useState2[1];

  var _useState3 = (0, _react.useState)(ProcessedData),
      _useState4 = _slicedToArray(_useState3, 2),
      sublist = _useState4[0],
      setSublist = _useState4[1];

  var _useState5 = (0, _react.useState)([]),
      _useState6 = _slicedToArray(_useState5, 2),
      colSorts = _useState6[0],
      setColSorts = _useState6[1];

  var _useState7 = (0, _react.useState)({}),
      _useState8 = _slicedToArray(_useState7, 2),
      colFilters = _useState8[0],
      setColFilters = _useState8[1];

  var select = function select(ith) {

    var newHistoryEntry = _extends({}, sublist[ith], { histIndex: history.length });
    var newSublist = sublist[ith].children.map(function (e, i) {
      return _extends({}, e, { listIndex: i });
    });

    setHistory([].concat(_toConsumableArray(history), [newHistoryEntry]));
    setSublist(newSublist);
  };

  var pop = function pop(ith) {
    var newHistory = history.slice(0, ith);
    setHistory(newHistory);

    var newSublist = void 0;
    if (newHistory.length > 0) {
      newSublist = newHistory[newHistory.length - 1].children.map(function (e, i) {
        return _extends({}, e, { listIndex: i });
      });
    } else {
      newSublist = data.map(function (e, i) {
        return _extends({}, e, { listIndex: i });
      });
    }
    setSublist(newSublist);
  };

  var sort = function sort(key) {

    var sorts = [].concat(_toConsumableArray(colSorts));

    if (sorts.length > 0) {
      var keyIndex = sorts.findIndex(function (e) {
        return e.col === key;
      });

      var iden = { col: key, order: 'ascend' };
      if (keyIndex !== -1) {
        var _sorts$splice = sorts.splice(keyIndex, 1);

        var _sorts$splice2 = _slicedToArray(_sorts$splice, 1);

        iden = _sorts$splice2[0];

        iden.order = iden.order === 'ascend' ? 'descend' : 'ascend';
      }
      sorts.push(iden);
    } else {
      sorts = [{ col: key, order: 'ascend' }];
    }

    setColSorts(sorts);
  };

  var filter = function filter(key, pattern) {
    console.log('filtered');
    setColFilters(_extends({}, colFilters, _defineProperty({}, key, pattern)));
  };

  var displayed = [].concat(_toConsumableArray(sublist));

  var _loop = function _loop(_ref3) {
    var col = _ref3.col,
        order = _ref3.order;

    displayed.sort(function (prev, next) {
      var original = prev[col] < next[col] ? -1 : prev[col] > next[col] ? 1 : 0;
      var modifier = {
        'descend': 1,
        'ascend': -1
      }[order];

      return original * modifier;
    });
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = colSorts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref3 = _step.value;

      _loop(_ref3);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _loop2 = function _loop2(key) {
    var filtered = displayed.filter(function (elem) {
      return elem[key].toString().includes(colFilters[key]);
    });

    if (filtered.length > 0) {
      displayed = filtered;
    }
  };

  for (var key in colFilters) {
    _loop2(key);
  }

  var entries = [].concat(_toConsumableArray(history), [{ filter: true }], _toConsumableArray(displayed));

  return _react2.default.createElement(
    TreeListContext.Provider,
    { value: { history: history, sublist: sublist, select: select, pop: pop, sort: sort, filter: filter } },
    _react2.default.createElement(
      _reactWindow.VariableSizeList,
      _extends({
        itemData: { ItemRenderer: children, entries: entries },
        estimatedItemSize: itemSize,
        itemSize: function itemSize(index) {
          return index === history.length ? FILTER_BAR_HEIGHT : LINE_HEIGHT;
        },
        innerElementType: HistoryContainer(historyRowRender, history)
      }, rest),
      ItemWrapper
    )
  );
};

var FilterContainer = function FilterContainer(_ref4) {
  var children = _ref4.children,
      topLength = _ref4.topLength;

  var style = {
    top: topLength * LINE_HEIGHT,
    height: FILTER_BAR_HEIGHT,
    backgroundColor: '#abcdef',
    display: 'flex',
    alignItems: 'center'
  };
  return _react2.default.createElement(
    "div",
    { className: "sticky", style: style },
    children
  );
};

var FilterCol = function FilterCol(_ref5) {
  var colKey = _ref5.colKey,
      isFilterable = _ref5.isFilterable,
      isSortable = _ref5.isSortable,
      colProps = _objectWithoutProperties(_ref5, ["colKey", "isFilterable", "isSortable"]);

  var _useState9 = (0, _react.useState)(''),
      _useState10 = _slicedToArray(_useState9, 2),
      inputVal = _useState10[0],
      setInputVal = _useState10[1];

  var _useContext = (0, _react.useContext)(TreeListContext),
      sort = _useContext.sort,
      filter = _useContext.filter;

  var colStyle = {
    display: 'flex'
  };

  var FilterComp = _react2.default.createElement(
    "div",
    { style: { display: 'flex' } },
    _react2.default.createElement(_reactstrap.Input, { value: inputVal, onChange: function onChange(e) {
        return setInputVal(e.target.value);
      } }),
    _react2.default.createElement(
      _reactstrap.Button,
      { color: "info", style: { marginLeft: '0.5rem' }, onClick: function onClick() {
          return filter(colKey, inputVal);
        } },
      _react2.default.createElement("img", { style: { height: '1.1rem' }, src: _filter2.default })
    )
  );

  return _react2.default.createElement(
    _reactstrap.Col,
    _extends({ style: colStyle }, colProps),
    isFilterable && FilterComp,
    isSortable && _react2.default.createElement(
      "div",
      null,
      _react2.default.createElement(
        _reactstrap.Button,
        { onClick: function onClick() {
            sort(colKey);
          }, style: { marginLeft: '0.5rem' }, color: "warning" },
        _react2.default.createElement("img", { style: { height: '1.1rem' }, src: _sortAscending2.default })
      )
    )
  );
};

var HistoryContainer = function HistoryContainer(RowRenderer, history) {

  return function (_ref6) {
    var children = _ref6.children,
        rest = _objectWithoutProperties(_ref6, ["children"]);

    return _react2.default.createElement(
      "div",
      rest,
      history.map(function (elem, index) {
        return _react2.default.createElement(RowRenderer, {
          data: history,
          index: index,
          key: index,
          style: { top: index * LINE_HEIGHT, left: 0, width: "100%", height: LINE_HEIGHT }
        });
      }),
      _react2.default.createElement(
        FilterContainer,
        { topLength: history.length },
        _react2.default.createElement(FilterCol, { md: "3" }),
        _react2.default.createElement(FilterCol, { md: "6", colKey: "desc", isSortable: true, isFilterable: true }),
        _react2.default.createElement(FilterCol, { md: "3", colKey: "key", isSortable: true, isFilterable: true })
      ),
      children
    );
  };
};

exports.TreeListContext = TreeListContext;
exports.TreeList = TreeList;