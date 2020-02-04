import React, { useContext, useState, forwardRef } from "react";
import {Button, Col} from 'reactstrap';
import AutoSizer from "react-virtualized-auto-sizer";
import {genCascadedNameEntries} from './nameGenerate';

import 'bootstrap/dist/css/bootstrap.min.css';

import { TreeListContext, TreeList} from "./TreeList";

const entries = genCascadedNameEntries(20000);
console.log(entries);

// HistoryHodler is passed into as the innerElementType, which is div by normal.
// however, it doesn't affected by scrolling, and is the place where we are going
// to render sticky items.


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
            historyRowRender={HistRow}
          >
            {Row}
          </TreeList>
        }}
      </AutoSizer>
    </div>
  </div>
};

export default App;