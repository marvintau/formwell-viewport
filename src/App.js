import React, { createContext, useContext, useState } from "react";
import { VariableSizeList as List } from "react-window";
import {Col, Input, Button} from 'reactstrap';
import AutoSizer from "react-virtualized-auto-sizer";
import {genCascadedNameEntries} from './nameGenerate';

import 'bootstrap/dist/css/bootstrap.min.css';


const entries = genCascadedNameEntries(20000);
const LINE_HEIGHT = 30;
const FILTER_BAR_HEIGHT = 45;
console.log(entries);


const TreeContext = createContext({
  history:[],
  list:[],
  pop:() => {},
  select:() => {}
});

const TreeList = function({data, children, itemSize, ...rest}){
  
  const [history, setHistory] = useState([]);
  const [sublist, setSublist] = useState(data.map((e, i) => ({...e, listIndex:i})));

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

  
  const entries = [...history, {filter:true}, ...sublist]

  return <TreeContext.Provider value={{history, sublist, select, pop}}>
    <List
      itemData={{ ItemRenderer: children, entries}}
      estimatedItemSize={itemSize}
      itemSize={(index) => index === history.length ? FILTER_BAR_HEIGHT : LINE_HEIGHT}
    {...rest}
    >
      {ItemWrapper}
    </List>
  </TreeContext.Provider>
}

// Item Wrapper is the direct item render of List. It does two things:

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

// HistoryHodler is passed into as the innerElementType, which is div by normal.
// however, it doesn't affected by scrolling, and is the place where we are going
// to render sticky items.

const FilterHolder = ({children, topLength}) => {
  const style = {
    top: topLength * LINE_HEIGHT,
    height: FILTER_BAR_HEIGHT,
    backgroundColor:'#abcdef',
    display: 'flex',
    alignItems: 'center'
  }
  return <div className="sticky" style={style}>{children}</div>
}

const FilterCol = ({...colProps}) => {

  const colStyle = {
    display:'flex',
    justifyContent:'space-between'
  }

  const buttonWrapStyle ={
    flex:'0 1 6rem',
  }

  return <Col style={colStyle} {...colProps} >
    <Input bsSize="sm"/>
    <div style={buttonWrapStyle}><Button style={{marginLeft:'0.5rem'}} size="sm" color="info">排序</Button></div>
  </Col>
}

const HistoryHolder = ({ children, ...rest }) => {
  const {history} = useContext(TreeContext);

  return <div {...rest}>
    {history.map((elem, index) => {
      return <HistRow
        data={history}
        index={index}
        key={index}
        style={{ top: index * LINE_HEIGHT, left: 0, width: "100%", height: LINE_HEIGHT }}
      />
    })}
    <FilterHolder topLength={history.length}>
      <FilterCol md='3'/>
      <FilterCol md='6'/>
      <FilterCol md='3'/>
    </FilterHolder>
    {children}
  </div>
}

const Row = ({ data, index, style }) => {
  
  const {select} = useContext(TreeContext);

  const {name, desc, key, listIndex} = data[index];
  
  let rowStyle = {
    display: 'flex',
    userSelect:'none',
    alignItems: 'center'
  }

  return <div style={{...style, ...rowStyle}} onClick={() => select(listIndex)}>
    <Col md='3'><div style={{margin:'0.5rem'}}>{name}</div></Col>
    <Col md='6'><div style={{margin:'0.5rem'}}>{desc}</div></Col>
    <Col md='3'><div style={{margin:'0.5rem'}}>{key}</div></Col>
  </div>
};

const HistRow = ({ data, index, style }) => {
  
  const {pop} = useContext(TreeContext);

  const {name, desc, key, histIndex} = data[index];
  
  let rowStyle = {
    display: 'flex',
    userSelect:'none',
    alignItems: 'center'
  }

  return <div className="sticky" style={{...style, ...rowStyle}} onClick={() => pop(histIndex)}>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>{name}</div></Col>
    <Col md='6'><div style={{margin:'0 0.5rem'}}>{desc}</div></Col>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>{key}</div></Col>
  </div>
};

const App = () => {
  return  <div style={{height:'100vh', width:'100vw'}}>
    <AutoSizer>
      {({height, width}) => {
        return <TreeList
          data={entries}
          height={height}
          width={width}
          itemSize={LINE_HEIGHT}
          itemCount={entries.length}
          innerElementType={HistoryHolder}
        >
          {Row}
        </TreeList>
      }}
    </AutoSizer>
  </div>
};

export default App;