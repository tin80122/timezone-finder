/* Binary Search Tree */

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const a = new TreeNode("a");
const b = new TreeNode("b");
const c = new TreeNode("c");
const d = new TreeNode("d");
const e = new TreeNode("e");
const f = new TreeNode("f");

a.left = b;
a.right = c;
b.left = d;
b.right = e;
c.right = f;

//      a
//    /   \
//   b     c
//  / \     \
// d   e     f

//loop solution
const depthFirstSearch = (root) => {
  //stack and queue are different
  //stack is Last In First Out, so use push and pop
  //queue is First In First Out, so use push and shift
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    console.log("preorder print", current.value);
    //right need to push first, because stack is Last In First Out
    //so left will be pop first
    if (current.right) stack.push(current.right);
    if (current.left) stack.push(current.left);
  }
}; // O(n) time, O(n) space

//recursion solution
function traverse_dfs_left_preorder(node) {
  if (node === null) {
    return;
  }
  //立刻印出
  console.log(node.value + " ");
  traverse_dfs_left_preorder(node.left);
  traverse_dfs_left_preorder(node.right);
} // O(n) time, O(n) space

function traverse_dfs_left_inorder(node) {
  if (node === null) {
    return;
  }
  traverse_dfs_left_inorder(node.left);
  //左回來後印出
  console.log(node.value + " ");
  traverse_dfs_left_inorder(node.right);
}
function traverse_dfs_left_postorder(node) {
  if (node === null) {
    return;
  }
  traverse_dfs_left_postorder(node.left);
  traverse_dfs_left_postorder(node.right);
  //右回來後印出
  console.log(node.value + " ");
}

console.log("preorder");
traverse_dfs_left_preorder(a);
console.log("inorder");
traverse_dfs_left_inorder(a);
console.log("postorder");
traverse_dfs_left_postorder(a);

console.log("dfs loop preorder");
depthFirstSearch(a);
