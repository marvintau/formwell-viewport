'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _reactWindow = require('react-window');

var _reactVirtualizedAutoSizer = require('react-virtualized-auto-sizer');

var _reactVirtualizedAutoSizer2 = _interopRequireDefault(_reactVirtualizedAutoSizer);

require('./tree-list.css');

var _filter = require('./filter.svg');

var _filter2 = _interopRequireDefault(_filter);

var _sortAscending = require('./sort-ascending.svg');

var _sortAscending2 = _interopRequireDefault(_sortAscending);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_FILTER_HEIGHT = 3;

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

// Item Wrapper
// ------------
// the direct item render of react-window List.
// 
// Note:
// 1. Item Wrapper only displays the content of sublist.
// 
// 2. Through it doesn't render the history records and filter bar, however,
//    it reserves the room for them. For DynamicSizeList, the height of the
//    component returned from ItemWrapper cannot be directly assigned. It
//    depends on the height of inner component. So you could specify the height
//    in the inner component.
// 
// 3. Conceivably the calculation of row height utilizes the getBoundingClientRect(),
//    thus it requires the ref of the component inside the ItemRenderer. Thus,
//    both of ItemRenderer and ItemWrapper need to be wrapped with forwardRef, so that
//    to pass the ref from ItemMeasurer (the stuff actually measures height) to the
//    innermost component.

var ItemWrapper = (0, _react.forwardRef)(function (_ref, ref) {
  var data = _ref.data,
      index = _ref.index,
      style = _ref.style;

  var _useContext = (0, _react.useContext)(TreeListContext),
      _select = _useContext.select;

  var ItemRenderer = data.ItemRenderer,
      entries = data.entries;


  if (entries[index] === undefined) {
    return _react2.default.createElement('div', { ref: ref });
  }

  var filter = entries[index].filter;

  if (filter !== undefined) {
    return _react2.default.createElement(
      'div',
      { ref: ref },
      _react2.default.createElement('div', { style: { height: filter ? 40 : DEFAULT_FILTER_HEIGHT } })
    );
  }

  if (entries[index].histIndex !== undefined) {
    return _react2.default.createElement(
      'div',
      { ref: ref },
      _react2.default.createElement('div', { style: { height: 30 } })
    );
  }

  return _react2.default.createElement(ItemRenderer, { ref: ref, data: entries[index], style: style, select: function select() {
      return _select(entries[index].listIndex);
    } });
});

var TreeList = function TreeList(_ref2) {
  var data = _ref2.data,
      children = _ref2.children,
      historyRowHeight = _ref2.historyRowHeight,
      historyRowRenderer = _ref2.historyRowRenderer,
      filterRowRenderer = _ref2.filterRowRenderer,
      rest = _objectWithoutProperties(_ref2, ['data', 'children', 'historyRowHeight', 'historyRowRenderer', 'filterRowRenderer']);

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

  (0, _react.useEffect)(function () {
    var ProcessedData = data.map(function (e, i) {
      return _extends({}, e, { listIndex: i });
    });
    setSublist(ProcessedData);
    setColSorts([]);
    setColFilters({});
  }, [data]);

  var select = function select(ith) {

    console.log('select', ith);

    if (sublist[ith] && sublist[ith].children !== undefined) {
      var newHistoryEntry = _extends({}, sublist[ith], { histIndex: history.length });
      var newSublist = sublist[ith].children.map(function (e, i) {
        return _extends({}, e, { listIndex: i });
      });

      setHistory([].concat(_toConsumableArray(history), [newHistoryEntry]));
      setSublist(newSublist);
    }
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

  var entries = [].concat(_toConsumableArray(history), [{ filter: filterRowRenderer !== undefined }], _toConsumableArray(displayed));

  return _react2.default.createElement(
    TreeListContext.Provider,
    { value: { history: history, sublist: sublist, select: select, pop: pop, sort: sort, filter: filter } },
    _react2.default.createElement(
      _reactWindow.DynamicSizeList,
      _extends({
        itemData: { ItemRenderer: children, entries: entries },
        innerElementType: HistoryContainer(historyRowRenderer, filterRowRenderer, historyRowHeight, history, pop)
      }, rest),
      ItemWrapper
    )
  );
};

var HistoryContainer = function HistoryContainer(HistRowRenderer, FilterRowRenderer, historyRowHeight, history, _pop) {

  if (FilterRowRenderer === undefined) {
    FilterRowRenderer = function FilterRowRenderer(_ref4) {
      var topLength = _ref4.topLength;

      var style = {
        top: topLength * historyRowHeight,
        height: DEFAULT_FILTER_HEIGHT,
        backgroundColor: 'lightgray'
      };

      return _react2.default.createElement('div', { style: style });
    };
  }

  return function (_ref5) {
    var children = _ref5.children,
        rest = _objectWithoutProperties(_ref5, ['children']);

    return _react2.default.createElement(
      'div',
      rest,
      history.map(function (elem, index) {

        var style = {
          left: 0,
          top: index * historyRowHeight,
          width: "100%", height: historyRowHeight
        };

        return _react2.default.createElement(HistRowRenderer, {
          data: history[index],
          key: index,
          style: style,
          pop: function pop() {
            return _pop(history[index].histIndex);
          }
        });
      }),
      _react2.default.createElement(FilterRowRenderer, { topLength: history.length }),
      children
    );
  };
};

var HIST_LINE_HEIGHT = 30;

var Row = function Row(colSpecs) {

  return (0, _react.forwardRef)(function (_ref6, ref) {
    var data = _ref6.data,
        style = _ref6.style,
        select = _ref6.select;


    var cols = [];
    for (var key in colSpecs) {
      var _colSpecs$key = colSpecs[key],
          width = _colSpecs$key.width,
          ColRenderer = _colSpecs$key.ColRenderer;

      cols.push(_react2.default.createElement(
        _reactstrap.Col,
        { md: width, key: key },
        _react2.default.createElement(
          ColRenderer,
          null,
          data[key]
        )
      ));
    }

    return _react2.default.createElement(
      'div',
      { ref: ref, className: 'treelist-row hovered', style: style, onClick: select },
      cols
    );
  });
};

var HistoryRow = function HistoryRow(colSpecs) {

  return function (_ref7) {
    var data = _ref7.data,
        style = _ref7.style,
        pop = _ref7.pop;


    var cols = [];
    for (var key in colSpecs) {
      var _colSpecs$key2 = colSpecs[key],
          width = _colSpecs$key2.width,
          HistColRenderer = _colSpecs$key2.HistColRenderer;

      cols.push(_react2.default.createElement(
        _reactstrap.Col,
        { md: width, key: key },
        _react2.default.createElement(
          HistColRenderer,
          null,
          data[key]
        )
      ));
    }

    return _react2.default.createElement(
      'div',
      { className: 'treelist-history-row sticky hovered', style: style, onClick: pop },
      cols
    );
  };
};

var FilterContainer = function FilterContainer(_ref8) {
  var children = _ref8.children,
      topLength = _ref8.topLength;


  var style = {
    top: topLength * HIST_LINE_HEIGHT,
    height: 40
  };

  return _react2.default.createElement(
    'div',
    { className: 'treelist-filter-row sticky', style: style },
    children
  );
};

var FilterCol = function FilterCol(_ref9) {
  var colKey = _ref9.colKey,
      isFilterable = _ref9.isFilterable,
      isSortable = _ref9.isSortable,
      colProps = _objectWithoutProperties(_ref9, ['colKey', 'isFilterable', 'isSortable']);

  var _useState9 = (0, _react.useState)(''),
      _useState10 = _slicedToArray(_useState9, 2),
      inputVal = _useState10[0],
      setInputVal = _useState10[1];

  var _useContext2 = (0, _react.useContext)(TreeListContext),
      sort = _useContext2.sort,
      filter = _useContext2.filter;

  var colStyle = {
    display: 'flex'
  };

  var FilterComp = _react2.default.createElement(
    'div',
    { style: { display: 'flex' } },
    _react2.default.createElement(_reactstrap.Input, { bsSize: 'sm', value: inputVal, onChange: function onChange(e) {
        return setInputVal(e.target.value);
      } }),
    _react2.default.createElement(
      _reactstrap.Button,
      { color: 'dark', outline: true, size: 'sm', style: { marginLeft: '0.5rem' }, onClick: function onClick() {
          return filter(colKey, inputVal);
        } },
      _react2.default.createElement('img', { alt: 'filter-button', style: { height: '1rem' }, src: _filter2.default })
    )
  );

  return _react2.default.createElement(
    _reactstrap.Col,
    _extends({ style: colStyle }, colProps),
    isFilterable && FilterComp,
    isSortable && _react2.default.createElement(
      _reactstrap.Button,
      { color: 'dark', outline: true, size: 'sm', onClick: function onClick() {
          sort(colKey);
        }, style: { marginLeft: '0.5rem' } },
      _react2.default.createElement('img', { alt: 'sort-button', style: { height: '1rem' }, src: _sortAscending2.default })
    )
  );
};

var FilterRow = function FilterRow(colSpecs) {

  var isNothing = Object.values(colSpecs).every(function (_ref10) {
    var isSortable = _ref10.isSortable,
        isFilterable = _ref10.isFilterable;
    return !(isSortable || isFilterable);
  });
  if (isNothing) {
    return undefined;
  }

  var cols = [];
  for (var key in colSpecs) {
    var _colSpecs$key3 = colSpecs[key],
        width = _colSpecs$key3.width,
        isSortable = _colSpecs$key3.isSortable,
        isFilterable = _colSpecs$key3.isFilterable;

    cols.push(_react2.default.createElement(FilterCol, { md: width, key: key, colKey: key, isSortable: isSortable, isFilterable: isFilterable }));
  }

  return function (_ref11) {
    var topLength = _ref11.topLength;
    return _react2.default.createElement(
      FilterContainer,
      { topLength: topLength },
      cols
    );
  };
};

var Header = function Header(colSpecs) {

  var cols = [];
  for (var key in colSpecs) {
    var _colSpecs$key4 = colSpecs[key],
        width = _colSpecs$key4.width,
        desc = _colSpecs$key4.desc,
        HeaderColRenderer = _colSpecs$key4.HeaderColRenderer;

    cols.push(_react2.default.createElement(
      _reactstrap.Col,
      { md: width, key: key },
      _react2.default.createElement(
        HeaderColRenderer,
        null,
        desc
      )
    ));
  }

  return _react2.default.createElement(
    'div',
    { className: 'treelist-header' },
    cols
  );
};

exports.default = function (_ref12) {
  var data = _ref12.data,
      colSpecs = _ref12.colSpecs;


  return _react2.default.createElement(
    'div',
    { style: { display: 'flex', flexDirection: "column", height: '100%', width: '100%' } },
    Header(colSpecs),
    _react2.default.createElement(
      'div',
      { style: { flex: 1, width: '100%' } },
      _react2.default.createElement(
        _reactVirtualizedAutoSizer2.default,
        null,
        function (_ref13) {
          var height = _ref13.height,
              width = _ref13.width;

          return _react2.default.createElement(
            TreeList,
            {
              height: height,
              width: width,

              data: data,
              itemCount: data.length,

              historyRowRenderer: HistoryRow(colSpecs),
              historyRowHeight: HIST_LINE_HEIGHT,
              filterRowRenderer: FilterRow(colSpecs)
            },
            Row(colSpecs)
          );
        }
      )
    )
  );
};