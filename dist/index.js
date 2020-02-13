"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _reactVirtualizedAutoSizer = require("react-virtualized-auto-sizer");

var _reactVirtualizedAutoSizer2 = _interopRequireDefault(_reactVirtualizedAutoSizer);

var _core = require("./core");

require("./tree-list.css");

var _filter = require("./filter.svg");

var _filter2 = _interopRequireDefault(_filter);

var _sortAscending = require("./sort-ascending.svg");

var _sortAscending2 = _interopRequireDefault(_sortAscending);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var HIST_LINE_HEIGHT = 30;

var Row = function Row(colSpecs) {

  return (0, _react.forwardRef)(function (_ref, ref) {
    var data = _ref.data,
        style = _ref.style,
        select = _ref.select;


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
      "div",
      { ref: ref, className: "treelist-row hovered", style: style, onClick: select },
      cols
    );
  });
};

var HistoryRow = function HistoryRow(colSpecs) {

  return function (_ref2) {
    var data = _ref2.data,
        style = _ref2.style,
        pop = _ref2.pop;


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
      "div",
      { className: "treelist-history-row sticky hovered", style: style, onClick: pop },
      cols
    );
  };
};

var FilterContainer = function FilterContainer(_ref3) {
  var children = _ref3.children,
      topLength = _ref3.topLength;


  var style = {
    top: topLength * HIST_LINE_HEIGHT,
    height: 40
  };

  return _react2.default.createElement(
    "div",
    { className: "treelist-filter-row sticky", style: style },
    children
  );
};

var FilterCol = function FilterCol(_ref4) {
  var colKey = _ref4.colKey,
      isFilterable = _ref4.isFilterable,
      isSortable = _ref4.isSortable,
      colProps = _objectWithoutProperties(_ref4, ["colKey", "isFilterable", "isSortable"]);

  var _useState = (0, _react.useState)(''),
      _useState2 = _slicedToArray(_useState, 2),
      inputVal = _useState2[0],
      setInputVal = _useState2[1];

  var _useContext = (0, _react.useContext)(_core.TreeListContext),
      sort = _useContext.sort,
      filter = _useContext.filter;

  var colStyle = {
    display: 'flex'
  };

  var FilterComp = _react2.default.createElement(
    "div",
    { style: { display: 'flex' } },
    _react2.default.createElement(_reactstrap.Input, { bsSize: "sm", value: inputVal, onChange: function onChange(e) {
        return setInputVal(e.target.value);
      } }),
    _react2.default.createElement(
      _reactstrap.Button,
      { color: "dark", outline: true, size: "sm", style: { marginLeft: '0.5rem' }, onClick: function onClick() {
          return filter(colKey, inputVal);
        } },
      _react2.default.createElement("img", { alt: "filter-button", style: { height: '1rem' }, src: _filter2.default })
    )
  );

  return _react2.default.createElement(
    _reactstrap.Col,
    _extends({ style: colStyle }, colProps),
    isFilterable && FilterComp,
    isSortable && _react2.default.createElement(
      _reactstrap.Button,
      { color: "dark", outline: true, size: "sm", onClick: function onClick() {
          sort(colKey);
        }, style: { marginLeft: '0.5rem' } },
      _react2.default.createElement("img", { alt: "sort-button", style: { height: '1rem' }, src: _sortAscending2.default })
    )
  );
};

var FilterRow = function FilterRow(colSpecs) {

  var isNothing = Object.values(colSpecs).every(function (_ref5) {
    var isSortable = _ref5.isSortable,
        isFilterable = _ref5.isFilterable;
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

  return function (_ref6) {
    var topLength = _ref6.topLength;
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
    "div",
    { className: "treelist-header" },
    cols
  );
};

exports.default = function (_ref7) {
  var data = _ref7.data,
      colSpecs = _ref7.colSpecs;


  return _react2.default.createElement(
    "div",
    { style: { display: 'flex', flexDirection: "column", height: '100%', width: '100%' } },
    Header(colSpecs),
    _react2.default.createElement(
      "div",
      { style: { flex: 1, width: '100%' } },
      _react2.default.createElement(
        _reactVirtualizedAutoSizer2.default,
        null,
        function (_ref8) {
          var height = _ref8.height,
              width = _ref8.width;

          return _react2.default.createElement(
            _core.TreeList,
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