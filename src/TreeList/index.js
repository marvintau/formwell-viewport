import React, { createContext, useState, useContext } from "react";
import {Col, Input, Button} from 'reactstrap';
import { VariableSizeList as List } from "react-window";

import FilterIcon from './filter.svg';
import SortIcon from './sort-ascending.svg';

const LINE_HEIGHT = 30;
const FILTER_BAR_HEIGHT = 45;

// Item Wrapper is the direct item render of react-window List. It does two
// things:

// 1. Skip the history items. Leave them blank over the scrollable views.
// 2. Render the remaining non-sticky items with the actual render we pass
//    into.

const ItemWrapper = ({ data, index, style }) => {
  const { ItemRenderer, entries } = data;

  if (entries[index] === undefined){
    return null;
  }

  if(entries[index].filter){
    return null
  }

  if (entries[index].listIndex === undefined) {
    return null;
  }

  return <ItemRenderer data={entries} index={index} style={style} />;
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


const TreeListContext = createContext({

  sublist: [],
  displayList: [],
  history:[],

  sort:() => {},
  filter: () => {},

  pop:() => {},
  select:() => {}
});

const TreeList = function({data, children, itemSize, historyRowRender, ...rest}){
  
  const ProcessedData = data.map((e, i) => ({...e, listIndex:i}));

  const [history, setHistory] = useState([]);
  const [sublist, setSublist] = useState(ProcessedData);

  const [colSorts, setColSorts] = useState([]);
  const [colFilters, setColFilters] = useState({});

  const select = (ith) => {

    let newHistoryEntry = {...sublist[ith], histIndex:history.length};
    let newSublist = sublist[ith].children.map((e, i) => ({...e, listIndex:i}))

    setHistory([...history, newHistoryEntry]);
    setSublist(newSublist);
  }

  const pop = (ith) => {
    const newHistory = history.slice(0, ith);
    setHistory(newHistory);

    let newSublist;
    if (newHistory.length > 0){
      newSublist = newHistory[newHistory.length-1].children.map((e, i) => ({...e, listIndex:i}));
    } else {
      newSublist = data.map((e, i) => ({...e, listIndex:i}))
    }
    setSublist(newSublist);
  }

  const sort = (key) => {

    let sorts = [...colSorts];

    if(sorts.length > 0){
      let keyIndex = sorts.findIndex((e) => e.col === key);

      let iden = {col:key, order:'ascend'};
      if (keyIndex !== -1){
        [iden] = sorts.splice(keyIndex, 1);
        iden.order = iden.order === 'ascend' ? 'descend' : 'ascend';
      }
      sorts.push(iden);

    } else {
      sorts = [{col:key, order:'ascend'}];
    }

    setColSorts(sorts);
  }

  const filter = (key, pattern) => {
    console.log('filtered')
    setColFilters({...colFilters, [key]: pattern});
  }

  let displayed = [...sublist];
  for (let {col, order} of colSorts){
    displayed.sort((prev, next) => {
      const original = prev[col] < next[col] ? -1 : prev[col] > next[col] ? 1 : 0;
      const modifier = {
        'descend' : 1,
        'ascend'  : -1
      }[order];

      return original * modifier;
    })
  }

  for (let key in colFilters){
    const filtered = displayed.filter((elem) => {
      return elem[key].toString().includes(colFilters[key]);
    })

    if (filtered.length > 0){
      displayed = filtered;
    }
  }

  const entries = [...history, {filter:true}, ...displayed]

  return <TreeListContext.Provider value={{history, sublist, select, pop, sort, filter}}>
    <List
      itemData={{ ItemRenderer: children, entries}}
      estimatedItemSize={itemSize}
      itemSize={(index) => index === history.length ? FILTER_BAR_HEIGHT : LINE_HEIGHT}
      innerElementType={HistoryContainer(historyRowRender, history)}
    {...rest}
    >
      {ItemWrapper}
    </List>
  </TreeListContext.Provider>
}


const FilterContainer = ({children, topLength}) => {
  const style = {
    top: topLength * LINE_HEIGHT,
    height: FILTER_BAR_HEIGHT,
    backgroundColor:'#abcdef',
    display: 'flex',
    alignItems: 'center'
  }
  return <div className="sticky" style={style}>{children}</div>
}

const FilterCol = ({colKey, isFilterable, isSortable, ...colProps}) => {

  const [inputVal, setInputVal] = useState('');

  const {sort, filter} = useContext(TreeListContext);

  const colStyle = {
    display:'flex',
  }

  const FilterComp = <div style={{display:'flex'}}>
    <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
    <Button color="info" style={{marginLeft:'0.5rem'}} onClick={() => filter(colKey, inputVal)}>
      <img style={{height:'1.1rem'}} src={FilterIcon} />
    </Button>
  </div>

  return <Col style={colStyle} {...colProps} >
    {isFilterable && FilterComp}
    {isSortable && <div>
      <Button onClick={() => {sort(colKey)}} style={{marginLeft:'0.5rem'}} color="warning">
        <img style={{height:'1.1rem'}} src={SortIcon} />
      </Button>
    </div>}
  </Col>
}

const HistoryContainer = (RowRenderer, history) => {

  return ({children, ...rest }) => {

    return <div {...rest}>
      {history.map((elem, index) => {
        return <RowRenderer
          data={history}
          index={index}
          key={index}
          style={{ top: index * LINE_HEIGHT, left: 0, width: "100%", height: LINE_HEIGHT }}
        />
      })}
      <FilterContainer topLength={history.length}>
        <FilterCol md='3'/>
        <FilterCol md='6' colKey='desc' isSortable={true} isFilterable={true}/>
        <FilterCol md='3' colKey='key'  isSortable={true} isFilterable={true}/>
      </FilterContainer>
      {children}
    </div>
  }
}

export {
  TreeListContext,
  TreeList
}