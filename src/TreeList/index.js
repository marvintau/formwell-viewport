import React, { createContext, useState, forwardRef } from "react";
import { DynamicSizeList as List } from "react-window";

// Item Wrapper is the direct item render of react-window List. It does two
// things:

// 1. Skip the history items. Leave them blank over the scrollable views.
// 2. Render the remaining non-sticky items with the actual render we pass
//    into.

const ItemWrapper = forwardRef(({ data, index, style }, ref) => {
  const { ItemRenderer, entries } = data;

  if (entries[index] === undefined){
    return <div ref={ref}></div>
  }

  if(entries[index].filter){
    return <div ref={ref}><div style={{height:40}} /></div>;
  }

  if (entries[index].histIndex !== undefined) {
    return <div ref={ref}><div style={{height:30}} /></div>;
  }

  return <ItemRenderer ref={ref} data={entries} index={index} style={style} />;
});

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
  select:() => {},
});

const TreeList = function({data, children, historyRowHeight, historyRowRenderer, filterRowRenderer, ...rest}){
  
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
      innerElementType={HistoryContainer(historyRowRenderer, filterRowRenderer, historyRowHeight, history)}
    {...rest}
    >
      {ItemWrapper}
    </List>
  </TreeListContext.Provider>
}

const HistoryContainer = (HistRowRenderer, FilterRowRenderer, historyRowHeight, history) => {

  return ({children, ...rest }) => {

    return <div {...rest}>
      {history.map((elem, index) => {

        const style = {
          left: 0, 
          top: index * historyRowHeight,
          width: "100%", height: historyRowHeight
        }

        return <HistRowRenderer
          data={history}
          index={index}
          key={index}
          style={style}
        />
      })}
      <FilterRowRenderer topLength={history.length} />
      {children}
    </div>
  }
}

export {
  TreeListContext,
  TreeList
}