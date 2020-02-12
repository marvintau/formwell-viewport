import React, { useContext, useState, forwardRef } from "react";
import {Col, Input, Button} from 'reactstrap';
import AutoSizer from "react-virtualized-auto-sizer";

import {TreeList, TreeListContext} from './core';

import './tree-list.css';
import FilterIcon from './filter.svg';
import SortIcon from './sort-ascending.svg';

const HIST_LINE_HEIGHT = 30;

const Row = (colSpecs) => {

  return forwardRef(({ data, style, select}, ref) => {
  
    const cols = [];
    for (let key in colSpecs){
      const {width, ColRenderer} = colSpecs[key];
      cols.push(<Col md={width} key={key}><ColRenderer>{data[key]}</ColRenderer></Col>)
    }
    
    return <div ref={ref} className='treelist-row hovered' style={style} onClick={select}>
      {cols}
    </div>
  });
}

const HistoryRow = (colSpecs) => {

  return ({ data, style, pop}) => {
      
    const cols = [];
    for (let key in colSpecs){
      const {width, HistColRenderer} = colSpecs[key];
      cols.push(<Col md={width} key={key}><HistColRenderer>{data[key]}</HistColRenderer></Col>)
    }

    return <div className="treelist-history-row sticky hovered" style={style} onClick={pop}>
      {cols}
    </div>
  }
};

const FilterContainer = ({children, topLength}) => {
  
  const style = {
    top: topLength * HIST_LINE_HEIGHT,
    height: 40,
  }
  
  return <div className="treelist-filter-row sticky" style={style}>{children}</div>
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
      <img alt="filter-button" style={{height:'1rem'}} src={FilterIcon} />
    </Button>
  </div>

  return <Col style={colStyle} {...colProps} >
    {isFilterable && FilterComp}
    {isSortable && <Button color="dark" outline size="sm" onClick={() => {sort(colKey)}} style={{marginLeft:'0.5rem'}}>
        <img alt="sort-button" style={{height:'1rem'}} src={SortIcon} />
      </Button>}
  </Col>
}

const FilterRow = (colSpecs) => {

  let isNothing = Object.values(colSpecs).every(({isSortable, isFilterable}) => !(isSortable || isFilterable));
  if(isNothing){
    return undefined;
  }

  const cols = [];
  for (let key in colSpecs){
    const {width, isSortable, isFilterable} = colSpecs[key];
    cols.push(<FilterCol md={width} key={key} colKey={key} isSortable={isSortable} isFilterable={isFilterable} />)
  }

  return ({topLength}) => 
    <FilterContainer topLength={topLength}>
      {cols}
    </FilterContainer>
}

const Header = (colSpecs) => {

  const cols = [];
  for (let key in colSpecs){
    const {width, desc, HeaderColRenderer} = colSpecs[key];
    cols.push(<Col md={width} key={key}><HeaderColRenderer>{desc}</HeaderColRenderer></Col>)
  }

  return <div className="treelist-header">
    {cols}
  </div>

}

export default ({data, colSpecs}) => {

  return <div style={{display:'flex', flexDirection:"column", height:'100%', width:'100%'}}>
    {Header(colSpecs)}
    <div style={{flex:1, width:'100%'}}>
      <AutoSizer>
      {({height, width}) => {
        return <TreeList
          height={height}
          width={width}

          data={data}
          itemCount={data.length}
          
          historyRowRenderer={HistoryRow(colSpecs)}
          historyRowHeight={HIST_LINE_HEIGHT}
          filterRowRenderer={FilterRow(colSpecs)}
        >
          {Row(colSpecs)}
        </TreeList>
      }}
      </AutoSizer>
    </div>
  </div>
}