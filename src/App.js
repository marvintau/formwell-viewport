import React, { useContext, useState, forwardRef } from "react";
import {Col, Input, Button} from 'reactstrap';
import AutoSizer from "react-virtualized-auto-sizer";
import {genCascadedNameEntries} from './nameGenerate';

import FilterIcon from './filter.svg';
import SortIcon from './sort-ascending.svg';

import 'bootstrap/dist/css/bootstrap.min.css';

import { TreeListContext, TreeList} from "./TreeList";

const entries = genCascadedNameEntries(20000);
console.log(entries);

// HistoryHodler is passed into as the innerElementType, which is div by normal.
// however, it doesn't affected by scrolling, and is the place where we are going
// to render sticky items.

const HIST_LINE_HEIGHT = 30;

const Row = forwardRef(({ data, index, style }, ref) => {
  
  const {select} = useContext(TreeListContext);

  const {name, desc, key, listIndex} = data[index];
  
  let rowStyle = {
    display: 'flex',
    userSelect:'none',
    alignItems: 'center'
  }

  return <div ref={ref} className='hovered' style={{...style, ...rowStyle}} onClick={() => select(listIndex)}>
    <Col md='3'><div style={{margin:'0.5rem'}}>{name}</div></Col>
    <Col md='6'><div style={{margin:'0.5rem'}}>{desc}</div></Col>
    <Col md='3'><div style={{margin:'0.5rem'}}>{key}</div></Col>
  </div>
});

const HistRow = ({ data, index, style }) => {
  
  const {pop} = useContext(TreeListContext);

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

const FilterContainer = ({children, topLength}) => {
  
  const style = {
    top: topLength * HIST_LINE_HEIGHT,
    height: 40,
    backgroundColor:'lightgray',
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
    <Input bsSize="sm" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
    <Button color="dark" outline size="sm" style={{marginLeft:'0.5rem'}} onClick={() => filter(colKey, inputVal)}>
      <img alt="filter-button" style={{height:'1.1rem'}} src={FilterIcon} />
    </Button>
  </div>

  return <Col style={colStyle} {...colProps} >
    {isFilterable && FilterComp}
    {isSortable && <Button color="dark" outline size="sm" onClick={() => {sort(colKey)}} style={{marginLeft:'0.5rem'}}>
        <img alt="sort-button" style={{height:'1.1rem'}} src={SortIcon} />
      </Button>}
  </Col>
}

const FilterRow = ({topLength}) => {

  return <FilterContainer topLength={topLength}>
    <FilterCol md='3'/>
    <FilterCol md='6' colKey='desc' isSortable={true} isFilterable={true}/>
    <FilterCol md='3' colKey='key'  isSortable={true} isFilterable={true}/>
  </FilterContainer>
}


const App = () => {

  let headerStyle = {
    height:'3rem',
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
    fontFamily: '"Arial Narrow", "Helvetica Neue", sans-serif',
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
            itemCount={entries.length}
            historyRowRenderer={HistRow}
            historyRowHeight={HIST_LINE_HEIGHT}
            filterRowRenderer={FilterRow}
          >
            {Row}
          </TreeList>
        }}
      </AutoSizer>
    </div>
  </div>
};

export default App;