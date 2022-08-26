import patchVnode from './patchVnode.js';
import createElement from './createElement.js';

// 判断是否是同一个虚拟节点
function checkSameVnode(a, b) {
  return a.sel == b.sel && a.key == b.key;
};

export default function updateChildren(parentElm, oldCh, newCh) {
  console.log('我是updateChildren');
  console.log(oldCh, newCh);

  // 旧前
  let oldStartIdx = 0;
  // 新前
  let newStartIdx = 0;
  // 旧后
  let oldEndIdx = oldCh.length - 1;
  // 新后
  let newEndIdx = newCh.length - 1;
  // 旧前节点
  let oldStartVnode = oldCh[0];
  // 旧后节点
  let oldEndVnode = oldCh[oldEndIdx];
  // 新前节点
  let newStartVnode = newCh[0];
  // 新后节点
  let newEndVnode = newCh[newEndIdx];

  let keyMap = null;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    console.log('★');
    // 首先不是判断①②③④命中，而是要略过已经加undefined标记的东西
    if (oldStartVnode == null || oldCh[oldStartIdx] == undefined) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null || oldCh[oldEndIdx] == undefined) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null || newCh[newStartIdx] == undefined) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null || newCh[newEndIdx] == undefined) {
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldStartVnode, newStartVnode)) {
      // 新前和旧前
      console.log('①新前和旧前命中');
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (checkSameVnode(oldEndVnode, newEndVnode)) {
      // 新后和旧后
      console.log('②新后和旧后命中');
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldStartVnode, newEndVnode)) {
      // 新后和旧前
      console.log('③新后和旧前命中');
      patchVnode(oldStartVnode, newEndVnode);
      // 当③新后与旧前命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧后的后面
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldEndVnode, newStartVnode)) {
      // 新前和旧后
      console.log('④新前和旧后命中');
      patchVnode(oldEndVnode, newStartVnode);
      // 当④新前和旧后命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧前的前面
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 四种命中都没有命中
      // 制作keyMap一个映射对象，这样就不用每次都遍历老对象了。
      if (!keyMap) {
        keyMap = {};
        // 从oldStartIdx开始，到oldEndIdx结束，创建keyMap映射对象
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          const key = oldCh[i].key;
          if (key != undefined) {
            keyMap[key] = i;
          }
        }
      }
      console.log(keyMap);
      // 寻找当前这项（newStartIdx）这项在keyMap中的映射的位置序号
      const idxInOld = keyMap[newStartVnode.key];
      console.log(idxInOld);
      if (idxInOld == undefined) {
        // 判断，如果idxInOld是undefined表示它是全新的项
        // 被加入的项（就是newStartVnode这项)现不是真正的DOM节点
        parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.elm);
      } else {
        // 如果不是undefined，不是全新的项，而是要移动
        const elmToMove = oldCh[idxInOld];
        patchVnode(elmToMove, newStartVnode);
        // 把这项设置为undefined，表示我已经处理完这项了
        oldCh[idxInOld] = undefined;
        // 移动，调用insertBefore也可以实现移动。
        parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
      }
      // 指针下移，只移动新的头
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // 继续看看有没有剩余的。循环结束了start还是比old小
  if (newStartIdx <= newEndIdx) {
    console.log('new还有剩余节点没有处理，要加项。要把所有剩余的节点，都要插入到oldStartIdx之前');
    // 遍历新的newCh，添加到老的没有处理的之前
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // insertBefore方法可以自动识别null，如果是null就会自动排到队尾去。和appendChild是一致了。
      // newCh[i]现在还没有真正的DOM，所以要调用createElement()函数变为DOM
      parentElm.insertBefore(createElement(newCh[i]), oldCh[oldStartIdx] ? oldCh[oldStartIdx].elm : null );
    }
  } else if (oldStartIdx <= oldEndIdx) {
    console.log('old还有剩余节点没有处理，要删除项');
    // 批量删除oldStart和oldEnd指针之间的项
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldCh[i]) {
        parentElm.removeChild(oldCh[i].elm);
      }
    }
  }
};