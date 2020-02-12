import React, { useState, useEffect } from "react";

import {genCascadedNameEntries} from './nameGenerate';
import List from './TreeList';

import 'bootstrap/dist/css/bootstrap.min.css';

const entries = genCascadedNameEntries(20000);

// HistoryHodler is passed into as the innerElementType, which is div by normal.
// however, it doesn't affected by scrolling, and is the place where we are going
// to render sticky items.

const ColRenderer = ({children}) => 
  <div style={{margin:'0.5rem'}}>{children}</div>;

const HistColRenderer = ({children}) =>
  <div style={{margin:'0.5rem'}}>{children}</div>;

const HeaderColRenderer = ({children}) =>
  <div style={{margin:'0.5rem'}}>{children}</div>;

const colSpecs = {
  name: {desc: '名称', width: 2, isSortable: false, isFilterable: false, ColRenderer, HistColRenderer, HeaderColRenderer},
  desc: {desc: '描述', width: 7, isSortable:  true, isFilterable:  true, ColRenderer, HistColRenderer, HeaderColRenderer},
  key:  {desc: 'ID', width: 3, isSortable:  true, isFilterable:  true, ColRenderer, HistColRenderer, HeaderColRenderer}
}

const App = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(entries);
    }, 1000);
    return () => clearTimeout(timer);
  }, [])

  const titleStyle = {
    marginLeft:'10px',
    fontFamily: '"Avenir Next Condensed", "Helvetica Neue", sans-serif',
    lineHeight:'4.5rem',
    fontWeight:'700',
    fontSize:'4rem',
    letterSpacing:'-0.2rem'
  }

  const title = <h1 style={titleStyle}>Cascaded (Tree-like) Data</h1>

  return  <div style={{height:'100vh', width:'100vw'}}>
    {title}
    <List data={data} colSpecs={colSpecs} />
  </div>
};

export default App;