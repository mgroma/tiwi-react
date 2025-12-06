describe('findConnectedTreeNodes', () => {
  // Extract the function from the component for testing
  const findConnectedTreeNodes = (startNodeId, links) => {
    const visited = new Set();

    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);

      // Find all nodes that this node points to
      links.forEach(link => {
        if (link.sourceId === nodeId) {
          traverse(link.targetId);
        }
      });

      // Find all nodes that point to this node
      links.forEach(link => {
        if (link.targetId === nodeId) {
          traverse(link.sourceId);
        }
      });
    };

    traverse(startNodeId);
    return visited;
  };

  // Test cases
  test('should find single direct connection', () => {
    const links = [
      { sourceId: 1, targetId: 2 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2]));
  });

  test('should find connections in both directions', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 3, targetId: 1 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2, 3]));
  });

  test('should handle multiple levels of connections', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 2, targetId: 3 },
      { sourceId: 3, targetId: 4 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2, 3, 4]));
  });

  test('should handle circular connections', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 2, targetId: 3 },
      { sourceId: 3, targetId: 1 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2, 3]));
  });

  test('should handle complex graph with multiple paths', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 1, targetId: 3 },
      { sourceId: 2, targetId: 4 },
      { sourceId: 3, targetId: 4 },
      { sourceId: 4, targetId: 5 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  test('should handle isolated nodes', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 3, targetId: 4 } // Isolated from 1-2
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2]));
  });

  test('should handle the User Roles example scenario', () => {
    const links = [
      // Apps -> Components
      { sourceId: 1, targetId: 3 }, // Web App -> User Management
      { sourceId: 1, targetId: 4 }, // Web App -> Analytics
      { sourceId: 2, targetId: 4 }, // Mobile App -> Analytics

      // Components -> Modules
      { sourceId: 3, targetId: 5 }, // User Management -> Profile
      { sourceId: 3, targetId: 6 }, // User Management -> Dashboard
      { sourceId: 4, targetId: 6 }, // Analytics -> Dashboard

      // Modules -> Features
      { sourceId: 5, targetId: 7 }, // Profile -> User Roles
      { sourceId: 6, targetId: 7 }, // Dashboard -> User Roles
    ];

    const result = findConnectedTreeNodes(7, links); // Starting from User Roles
    expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6, 7]));
  });

  test('should handle empty links array', () => {
    const links = [];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1]));
  });

  test('should handle non-existent node ID', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 2, targetId: 3 }
    ];
    const result = findConnectedTreeNodes(999, links);
    expect(result).toEqual(new Set([999]));
  });

  test('should handle bidirectional connections', () => {
    const links = [
      { sourceId: 1, targetId: 2 },
      { sourceId: 2, targetId: 1 } // Bidirectional
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2]));
  });

  test('should handle complex branching paths', () => {
    const links = [
      // Main path
      { sourceId: 1, targetId: 2 },
      { sourceId: 2, targetId: 3 },
      // Branch 1
      { sourceId: 2, targetId: 4 },
      { sourceId: 4, targetId: 5 },
      // Branch 2
      { sourceId: 3, targetId: 6 },
      { sourceId: 6, targetId: 7 }
    ];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6, 7]));
  });

  test('should handle multiple entry points to same node', () => {
    const links = [
      { sourceId: 1, targetId: 3 },
      { sourceId: 2, targetId: 3 },
      { sourceId: 3, targetId: 4 }
    ];
    const result = findConnectedTreeNodes(4, links);
    expect(result).toEqual(new Set([1, 2, 3, 4]));
  });
});
