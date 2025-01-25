use std::cell::RefCell;
use std::io::{self, Write};
use std::rc::Rc;

/// Represents a node in the Binary Search Tree
#[derive(Debug)]
struct TreeNode {
    value: i32,
    left: Option<Rc<RefCell<TreeNode>>>,
    right: Option<Rc<RefCell<TreeNode>>>,
}

/// Binary Search Tree data structure
struct BinarySearchTree {
    root: Option<Rc<RefCell<TreeNode>>>,
    size: usize,
}

impl BinarySearchTree {
    /// Create a new empty Binary Search Tree
    fn new() -> Self {
        BinarySearchTree {
            root: None,
            size: 0,
        }
    }

    /// Insert a new value into the BST
    fn insert(&mut self, value: i32) {
        if self.root.is_none() {
            self.root = Some(Rc::new(RefCell::new(TreeNode {
                value,
                left: None,
                right: None,
            })));
        } else {
            self._insert_recursive(self.root.clone(), value);
        }
        self.size += 1;
    }

    fn _insert_recursive(&self, node: Option<Rc<RefCell<TreeNode>>>, value: i32) {
        if let Some(current_node) = node {
            let mut node_ref = current_node.borrow_mut();
            if value < node_ref.value {
                if node_ref.left.is_none() {
                    node_ref.left = Some(Rc::new(RefCell::new(TreeNode {
                        value,
                        left: None,
                        right: None,
                    })));
                } else {
                    drop(node_ref);
                    self._insert_recursive(current_node.borrow().left.clone(), value);
                }
            } else {
                if node_ref.right.is_none() {
                    node_ref.right = Some(Rc::new(RefCell::new(TreeNode {
                        value,
                        left: None,
                        right: None,
                    })));
                } else {
                    drop(node_ref);
                    self._insert_recursive(current_node.borrow().right.clone(), value);
                }
            }
        }
    }

    /// Search for a value in the BST
    fn search(&self, value: i32) -> bool {
        self._search_recursive(&self.root, value)
    }

    fn _search_recursive(&self, node: &Option<Rc<RefCell<TreeNode>>>, value: i32) -> bool {
        match node {
            Some(n) => {
                let node_ref = n.borrow();
                if node_ref.value == value {
                    true
                } else if value < node_ref.value {
                    drop(node_ref);
                    self._search_recursive(&node_ref.left, value)
                } else {
                    drop(node_ref);
                    self._search_recursive(&node_ref.right, value)
                }
            }
            None => false,
        }
    }

    /// Delete a value from the BST
    fn delete(&mut self, value: i32) {
        self.root = self._delete_recursive(self.root.clone(), value);
        self.size = self.size.saturating_sub(1);
    }

    fn _delete_recursive(&self, node: Option<Rc<RefCell<TreeNode>>>, value: i32) -> Option<Rc<RefCell<TreeNode>>> {
        if let Some(current_node) = node {
            let mut node_ref = current_node.borrow_mut();
            if value < node_ref.value {
                drop(node_ref);
                current_node.borrow_mut().left = self._delete_recursive(current_node.borrow().left.clone(), value);
                Some(current_node)
            } else if value > node_ref.value {
                drop(node_ref);
                current_node.borrow_mut().right = self._delete_recursive(current_node.borrow().right.clone(), value);
                Some(current_node)
            } else {
                // Node with only one child or no child
                if node_ref.left.is_none() {
                    return node_ref.right.clone();
                }
                if node_ref.right.is_none() {
                    return node_ref.left.clone();
                }

                // Node with two children
                let mut min_node = node_ref.right.clone().unwrap();
                while min_node.borrow().left.is_some() {
                    min_node = min_node.borrow().left.clone().unwrap();
                }
                
                node_ref.value = min_node.borrow().value;
                drop(node_ref);
                current_node.borrow_mut().right = 
                    self._delete_recursive(current_node.borrow().right.clone(), min_node.borrow().value);
                Some(current_node)
            }
        } else {
            None
        }
    }

    /// Perform in-order traversal
    fn inorder_traversal(&self) -> Vec<i32> {
        let mut result = Vec::new();
        self._inorder_recursive(&self.root, &mut result);
        result
    }

    fn _inorder_recursive(&self, node: &Option<Rc<RefCell<TreeNode>>>, result: &mut Vec<i32>) {
        if let Some(n) = node {
            let node_ref = n.borrow();
            self._inorder_recursive(&node_ref.left, result);
            result.push(node_ref.value);
            self._inorder_recursive(&node_ref.right, result);
        }
    }

    /// Perform pre-order traversal
    fn preorder_traversal(&self) -> Vec<i32> {
        let mut result = Vec::new();
        self._preorder_recursive(&self.root, &mut result);
        result
    }

    fn _preorder_recursive(&self, node: &Option<Rc<RefCell<TreeNode>>>, result: &mut Vec<i32>) {
        if let Some(n) = node {
            let node_ref = n.borrow();
            result.push(node_ref.value);
            self._preorder_recursive(&node_ref.left, result);
            self._preorder_recursive(&node_ref.right, result);
        }
    }

    /// Perform post-order traversal
    fn postorder_traversal(&self) -> Vec<i32> {
        let mut result = Vec::new();
        self._postorder_recursive(&self.root, &mut result);
        result
    }

    fn _postorder_recursive(&self, node: &Option<Rc<RefCell<TreeNode>>>, result: &mut Vec<i32>) {
        if let Some(n) = node {
            let node_ref = n.borrow();
            self._postorder_recursive(&node_ref.left, result);
            self._postorder_recursive(&node_ref.right, result);
            result.push(node_ref.value);
        }
    }

    /// Print tree structure (simple console representation)
    fn print_tree(&self) {
        self._print_recursive(&self.root, 0);
    }

    fn _print_recursive(&self, node: &Option<Rc<RefCell<TreeNode>>>, indent: usize) {
        if let Some(n) = node {
            let node_ref = n.borrow();
            
            // Print right subtree first (top of the visualization)
            if node_ref.right.is_some() {
                self._print_recursive(&node_ref.right, indent + 4);
            }

            // Print current node
            println!("{:width$}{}", " ", node_ref.value, width = indent);

            // Print left subtree
            if node_ref.left.is_some() {
                self._print_recursive(&node_ref.left, indent + 4);
            }
        }
    }
}

/// Interactive BST CLI
fn bst_cli() {
    let mut bst = BinarySearchTree::new();
    
    loop {
        print_menu();
        
        let mut input = String::new();
        io::stdin().read_line(&mut input).expect("Failed to read line");
        
        match input.trim() {
            "1" => {
                print!("Enter value to insert: ");
                io::stdout().flush().unwrap();
                let mut value = String::new();
                io::stdin().read_line(&mut value).expect("Failed to read line");
                if let Ok(num) = value.trim().parse() {
                    bst.insert(num);
                    println!("Inserted {} into the tree", num);
                }
            },
            "2" => {
                print!("Enter value to delete: ");
                io::stdout().flush().unwrap();
                let mut value = String::new();
                io::stdin().read_line(&mut value).expect("Failed to read line");
                if let Ok(num) = value.trim().parse() {
                    bst.delete(num);
                    println!("Deleted {} from the tree", num);
                }
            },
            "3" => {
                print!("Enter value to search: ");
                io::stdout().flush().unwrap();
                let mut value = String::new();
                io::stdin().read_line(&mut value).expect("Failed to read line");
                if let Ok(num) = value.trim().parse() {
                    println!("Search result: {}", bst.search(num));
                }
            },
            "4" => {
                println!("In-order traversal: {:?}", bst.inorder_traversal());
            },
            "5" => {
                println!("Pre-order traversal: {:?}", bst.preorder_traversal());
            },
            "6" => {
                println!("Post-order traversal: {:?}", bst.postorder_traversal());
            },
            "7" => {
                println!("Tree Structure:");
                bst.print_tree();
            },
            "8" => break,
            _ => println!("Invalid option"),
        }
    }
}

/// Print menu options
fn print_menu() {
    println!("\n--- Binary Search Tree Operations ---");
    println!("1. Insert");
    println!("2. Delete");
    println!("3. Search");
    println!("4. In-order Traversal");
    println!("5. Pre-order Traversal");
    println!("6. Post-order Traversal");
    println!("7. Print Tree");
    println!("8. Exit");
    print!("Choose an option: ");
    io::stdout().flush().unwrap();
}

fn main() {
    bst_cli();
}
