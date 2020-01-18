import React, { createContext, useContext, useState } from "react";
import { VariableSizeList as List } from "react-window";
import {InputGroup, InputGroupAddon, InputGroupText, Col, Input, Button} from 'reactstrap';
import AutoSizer from "react-virtualized-auto-sizer";
import {genCascadedNameEntries} from './nameGenerate';

import 'bootstrap/dist/css/bootstrap.min.css';

import FilterIcon from './filter.svg';
import SortIcon from './sort-ascending.svg';

const entries = genCascadedNameEntries(20000);
const LINE_HEIGHT = 30;
const FILTER_BAR_HEIGHT = 45;
console.log(entries);


const TreeContext = createContext({

  // Original sublist comes from the original data, and
  // copied to the displayed list, and then apply the sorting
  // and filtering method over it.
  sublist: [],
  displayList: [],
  history:[],

  sort:() => {},
  filter: () => {},

  pop:() => {},
  select:() => {}
});

const TreeList = function({data, children, itemSize, ...rest}){
  
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

  return <TreeContext.Provider value={{history, sublist, select, pop, sort, filter}}>
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

const FilterCol = ({colKey, isFilterable, isSortable, ...colProps}) => {

  const {sort, filter} = useContext(TreeContext);

  const colStyle = {
    display:'flex',
    justifyContent:'space-between'
  }

  const buttonWrapStyle ={
    flex:'0 1 6rem',
  }

  const FilterComp = <InputGroup size='sm'>
    <Input onKeyUp={(e) => filter(colKey, e.target.value)} />
    <InputGroupAddon color="warning" addonType="prepend">
      <InputGroupText><img style={{height:'1.1rem'}} src={FilterIcon} /></InputGroupText>
    </InputGroupAddon>
  </InputGroup>

  return <Col style={colStyle} {...colProps} >
    {isFilterable && FilterComp}
    {isSortable && <div style={buttonWrapStyle}>
      <Button onClick={() => {sort(colKey)}} style={{marginLeft:'0.5rem', lineHeight:'1.25rem'}} size="sm" color="warning">
        <img style={{height:'1.1rem'}} src={SortIcon} />
      </Button>
    </div>}
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
      <FilterCol md='6' colKey='desc' isSortable={true} isFilterable={true}/>
      <FilterCol md='3' colKey='key'  isSortable={true} isFilterable={true}/>
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

  return <div className='hovered' style={{...style, ...rowStyle}} onClick={() => select(listIndex)}>
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

  return <div className="sticky hovered" style={{...style, ...rowStyle}} onClick={() => pop(histIndex)}>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>{name}</div></Col>
    <Col md='6'><div style={{margin:'0 0.5rem'}}>{desc}</div></Col>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>{key}</div></Col>
  </div>
};

const App = () => {

  let headerStyle = {
    display: 'flex',
    userSelect:'none',
    alignItems:'center',
    backgroundColor:'#343a40',
    color:'#f8f9fa'
  }

  const header = <div className="header" style={headerStyle}>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>Name (Random path-like text)</div></Col>
    <Col md='6'><div style={{margin:'0 0.5rem'}}>Description (Random name-like text)</div></Col>
    <Col md='3'><div style={{margin:'0 0.5rem'}}>Index (Random integer)</div></Col>
  </div>

  const titleStyle = {
    marginLeft:'10px',
    fontFamily: '"Avenir Next", "Helvetica Neue", sans-serif',
    fontWeight:'700',
    fontSize:'4.5rem',
    letterSpacing:'-0.3rem'
  }

  const title = <h1 style={titleStyle}>Cascaded (Tree-like) Data</h1>

  return  <div style={{height:'100vh', width:'100vw'}}>
    {title}
    {header}
    <div style={{height:'80vh', width:'100%'}}>
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
  </div>
};

export default App;