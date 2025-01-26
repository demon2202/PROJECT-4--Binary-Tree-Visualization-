import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.isNew = true;
    this.isVisited = false;
  }
}

class BaseBST {
  constructor() {
    this.root = null;
    this.nodeCount = 0;
    this.traversalOrder = [];
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  reset() {
    this.root = null;
    this.nodeCount = 0;
    this.traversalOrder = [];
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  clearVisited(node = this.root) {
    if (!node) return;
    node.isVisited = false;
    this.clearVisited(node.left);
    this.clearVisited(node.right);
  }

  inorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      traverse(current.left);
      this.traversalOrder.push(current);
      traverse(current.right);
    };
    traverse(node);
  }

  preorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      this.traversalOrder.push(current);
      traverse(current.left);
      traverse(current.right);
    };
    traverse(node);
  }

  postorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      traverse(current.left);
      traverse(current.right);
      this.traversalOrder.push(current);
    };
    traverse(node);
  }
}

class BST extends BaseBST {
  insert(value) {
    const newNode = new TreeNode(value);
    this.nodeCount++;

    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  delete(value) {
    const deleteNode = (node, val) => {
      if (!node) return null;

      if (val < node.value) {
        node.left = deleteNode(node.left, val);
      } else if (val > node.value) {
        node.right = deleteNode(node.right, val);
      } else {
        this.nodeCount--;
        if (!node.left && !node.right) return null;
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let temp = node.right;
        while (temp.left) temp = temp.left;
        node.value = temp.value;
        node.right = deleteNode(node.right, temp.value);
      }
      return node;
    };

    this.root = deleteNode(this.root, value);
  }
}

class AVLTree extends BaseBST {
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  insert(value) {
    const insertNode = (node, val) => {
      if (!node) {
        this.nodeCount++;
        return new TreeNode(val);
      }

      if (val < node.value) {
        node.left = insertNode(node.left, val);
      } else {
        node.right = insertNode(node.right, val);
      }

      this.updateHeight(node);
      const balance = this.getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && val < node.left.value) {
        return this.rotateRight(node);
      }

      // Right Right Case
      if (balance < -1 && val > node.right.value) {
        return this.rotateLeft(node);
      }

      // Left Right Case
      if (balance > 1 && val > node.left.value) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right Left Case
      if (balance < -1 && val < node.right.value) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = insertNode(this.root, value);
  }

  delete(value) {
    const deleteNode = (node, val) => {
      if (!node) return null;

      if (val < node.value) {
        node.left = deleteNode(node.left, val);
      } else if (val > node.value) {
        node.right = deleteNode(node.right, val);
      } else {
        this.nodeCount--;
        if (!node.left && !node.right) return null;
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let temp = node.right;
        while (temp.left) temp = temp.left;
        node.value = temp.value;
        node.right = deleteNode(node.right, temp.value);
      }

      if (!node) return null;

      this.updateHeight(node);
      const balance = this.getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        return this.rotateRight(node);
      }

      // Left Right Case
      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right Right Case
      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        return this.rotateLeft(node);
      }

      // Right Left Case
      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = deleteNode(this.root, value);
  }
}

const TreeVisualizer = () => {
  const [treeType, setTreeType] = useState('bst');
  const [bst, setBst] = useState(new BST());
  const [avl, setAvl] = useState(new AVLTree());
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [traversalResult, setTraversalResult] = useState('');
  const [nodeCount, setNodeCount] = useState(0);
  const svgRef = useRef(null);
  const traversalIntervalRef = useRef(null);
  const [currentTraversalIndex, setCurrentTraversalIndex] = useState(0);

  const currentTree = treeType === 'bst' ? bst : avl;

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const updateTree = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const treeGroup = svgElement.querySelector('#treeGroup');
    if (!treeGroup) return;

    treeGroup.innerHTML = '';
    setNodeCount(currentTree.nodeCount);

    if (!currentTree.root) return;

    const drawNode = (node, x, y, level = 1) => {
      if (!node) return;

      if (node.left) {
        const childX = x - (200 / level);
        const childY = y + 60;
        treeGroup.innerHTML += `
          <line 
            x1="${x}" y1="${y}"
            x2="${childX}" y2="${childY}"
            stroke="#94a3b8"
            stroke-width="2"
          />
        `;
      }

      if (node.right) {
        const childX = x + (200 / level);
        const childY = y + 60;
        treeGroup.innerHTML += `
          <line
            x1="${x}" y1="${y}"
            x2="${childX}" y2="${childY}"
            stroke="#94a3b8"
            stroke-width="2"
          />
        `;
      }

      let color = '#ffffff';
      if (node.isVisited) color = '#93c5fd';
      else if (node.isNew) color = '#86efac';

      treeGroup.innerHTML += `
        <circle
          cx="${x}" cy="${y}" r="20"
          fill="${color}"
          stroke="#475569"
          stroke-width="2"
        />
        <text
          x="${x}" y="${y}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="14"
          font-weight="bold"
        >${node.value}</text>
      `;

      if (node.left) {
        drawNode(node.left, x - (200 / level), y + 60, level + 1);
      }
      if (node.right) {
        drawNode(node.right, x + (200 / level), y + 60, level + 1);
      }
    };

    drawNode(currentTree.root, 0, 0);
  };

  const insertNode = () => {
    const value = parseInt(inputValue);
    
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    if (treeType === 'bst') {
      bst.insert(value);
      setBst(new BST());
      bst.root = currentTree.root;
    } else {
      avl.insert(value);
      setAvl(new AVLTree());
      avl.root = currentTree.root;
    }

    setInputValue('');
    updateTree();
    showMessage(`Inserted ${value}`, 'success');
  };

  const deleteNode = () => {
    const value = parseInt(inputValue);
    
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    if (treeType === 'bst') {
      bst.delete(value);
      setBst(new BST());
      bst.root = currentTree.root;
    } else {
      avl.delete(value);
      setAvl(new AVLTree());
      avl.root = currentTree.root;
    }

    setInputValue('');
    updateTree();
    showMessage(`Deleted ${value}`, 'success');
  };

  const searchNode = () => {
    const value = parseInt(inputValue);
    
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    const found = currentTree.search(value);
    showMessage(found ? `Found ${value}!` : `${value} not found`, found ? 'success' : 'error');
  };

  const resetTree = () => {
    if (traversalIntervalRef.current) {
      clearInterval(traversalIntervalRef.current);
    }

    if (treeType === 'bst') {
      bst.reset();
      setBst(new BST());
    } else {
      avl.reset();
      setAvl(new AVLTree());
    }

    updateTree();
    setTraversalResult('');
    showMessage('Tree reset', 'success');
  };

  const traverse = (type) => {
    if (traversalIntervalRef.current) {
      clearInterval(traversalIntervalRef.current);
    }
    currentTree.clearVisited();

    switch(type) {
      case 'inorder':
        currentTree.inorderTraversal();
        setTraversalResult(`In-order: ${currentTree.traversalOrder.map(node => node.value).join(' → ')}`);
        break;
      case 'preorder':
        currentTree.preorderTraversal();
        setTraversalResult(`Pre-order: ${currentTree.traversalOrder.map(node => node.value).join(' → ')}`);
        break;
      case 'postorder':
        currentTree.postorderTraversal();
        setTraversalResult(`Post-order: ${currentTree.traversalOrder.map(node => node.value).join(' → ')}`);
        break;
    }

    setCurrentTraversalIndex(0);
    traversalIntervalRef.current = setInterval(() => {
      if (currentTraversalIndex < currentTree.traversalOrder.length) {
        currentTree.traversalOrder[currentTraversalIndex].isVisited = true;
        updateTree();
        setCurrentTraversalIndex(prev => prev + 1);
      } else {
        clearInterval(traversalIntervalRef.current);
        setTimeout(() => {
          currentTree.clearVisited();
          updateTree();
        }, 1000);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      insertNode();
    }
  };

  useEffect(() => {
    updateTree();
  }, [treeType]);

{/* [Previous code remains the same] */}

return (
  <Card className="w-full max-w-4xl">
    <CardHeader>
      <CardTitle>Advanced Tree Visualizer</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-center flex-wrap items-center">
          <Select value={treeType} onValueChange={setTreeType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Tree Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bst">Binary Search Tree</SelectItem>
              <SelectItem value="avl">AVL Tree</SelectItem>
            </SelectContent>
          </Select>

          <Input 
            type="number" 
            placeholder="Enter a number" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-40"
          />
          <Button onClick={insertNode}>Insert</Button>
          <Button onClick={deleteNode} variant="destructive">Delete</Button>
          <Button onClick={searchNode} variant="secondary">Search</Button>
          <Button onClick={resetTree} variant="outline">Reset</Button>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button onClick={() => traverse('inorder')} variant="secondary">In-order</Button>
          <Button onClick={() => traverse('preorder')} variant="secondary">Pre-order</Button>
          <Button onClick={() => traverse('postorder')} variant="secondary">Post-order</Button>
        </div>

        {message.text && (
          <div className={`p-2 text-center rounded ${
            message.type === 'success' ? 'bg-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-200 text-red-800' :
            'bg-blue-200 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {traversalResult && (
          <div className="p-2 text-center bg-gray-100 rounded">
            {traversalResult}
          </div>
        )}

        <div className="text-center">
          Total nodes: {nodeCount} 
          {treeType === 'avl' && (
            <span className="ml-4 text-blue-600">
              AVL Tree Height: {currentTree.getHeight(currentTree.root)}
            </span>
          )}
        </div>

        <div className="w-full h-[500px] border rounded overflow-auto">
          <svg ref={svgRef} width="100%" height="100%">
            <g id="treeGroup" transform="translate(500,40)"></g>
          </svg>
        </div>
      </div>
    </CardContent>
  </Card>
);
};

export default TreeVisualizer;
