import React, {useEffect, useState, useCallback} from 'react';
import './FMEAHierarchy.css'
import FMEASearch from './FMEASearch';
import SLOManagement from '../SLO/SLOManagement';
import { ChevronRight, Settings } from 'react-feather';

// Find all connected nodes recursively starting from the selected node
export const findConnectedTreeNodes = (startNodeId, links) => {
    const visited = new Set();
    const toVisit = [{id: startNodeId, direction: 'both'}];

    while (toVisit.length > 0) {
        const {id: currentId, direction} = toVisit.pop();
        if (!visited.has(currentId)) {
            visited.add(currentId);

            if (direction === 'both' || direction === 'up') {
                // Find all nodes that point to current node (going up)
                links.forEach(link => {
                    if (link.targetId === currentId && !visited.has(link.sourceId)) {
                        toVisit.push({id: link.sourceId, direction: 'up'});
                    }
                });
            }

            if (direction === 'both' || direction === 'down') {
                // Find all nodes that current node points to (going down)
                links.forEach(link => {
                    if (link.sourceId === currentId && !visited.has(link.targetId)) {
                        toVisit.push({id: link.targetId, direction: 'down'});
                    }
                });
            }
        }
    }

    return visited;
};
const Graph = ({objects, links, levelDefinitions}) => {
    const [connections, setConnections] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' or 'slo'

    // Find all links between connected nodes
    const findRelevantLinks = (connectedNodes) => {
        return links.filter(link =>
            connectedNodes.has(link.sourceId) && connectedNodes.has(link.targetId)
        );
    };

    const calculateConnections = useCallback(() => {
        let relevantLinks = links;

        if (selectedNode) {
            const connectedNodes = findConnectedTreeNodes(selectedNode, links);
            relevantLinks = findRelevantLinks(connectedNodes);
        }

        const newConnections = relevantLinks.map((link, index) => {
            const sourceElement = document.getElementById(`node-${link.sourceId}`);
            const targetElement = document.getElementById(`node-${link.targetId}`);

            if (!sourceElement || !targetElement) return null;

            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const graphRect = document.querySelector('.graph').getBoundingClientRect();

            const x1 = sourceRect.right - graphRect.left;
            const y1 = sourceRect.top - graphRect.top + sourceRect.height / 2;
            const x2 = targetRect.left - graphRect.left;
            const y2 = targetRect.top - graphRect.top + targetRect.height / 2;

            return {
                id: index,
                sourceId: link.sourceId,
                targetId: link.targetId,
                path: `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
            };
        }).filter(Boolean);

        setConnections(newConnections);
    }, [links, selectedNode]);

    useEffect(() => {
        calculateConnections();

        const handleResize = () => {
            calculateConnections();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateConnections]);

    const handleNodeClick = (nodeId) => {
        setSelectedNode(selectedNode === nodeId ? null : nodeId);
    };

    const handleSLOButtonClick = (component) => {
        const componentWithOperations = {
            ...component,
            operations: component.operations || [
                {
                    id: '1',
                    componentId: '1',
                    name: 'Operation 1',
                    slos: [
                        {
                            id: '1',
                            componentId: '1',
                            operationId: '1',
                            metric: 'error rate',
                            entitySelector: 'entity1',
                            targetThreshold: 0.01,
                            warningThreshold: 0.05,
                            implementationStatus: 'Not Started',
                            sloValue: 0.02,
                            errorBudget: 0.03,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            id: '2',
                            componentId: '1',
                            operationId: '1',
                            metric: 'Response',
                            entitySelector: 'entity1',
                            targetThreshold: 1000,
                            warningThreshold: 500,
                            implementationStatus: 'Not Started',
                            sloValue: 200,
                            errorBudget: 100,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ]
                },
                {
                    id: '2',
                    componentId: '1',
                    name: 'Operation 2',
                    slos: [
                        {
                            id: '3',
                            componentId: '1',
                            operationId: '2',
                            metric: 'error rate',
                            entitySelector: 'entity1',
                            targetThreshold: 0.01,
                            warningThreshold: 0.05,
                            implementationStatus: 'Not Started',
                            sloValue: 0.02,
                            errorBudget: 0.03,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ]
                }
            ]
        };
        setSelectedComponent(componentWithOperations);
        setViewMode('slo');
    };

    const handleBackToHierarchy = () => {
        setSelectedComponent(null);
        setViewMode('hierarchy');
    };

    const connectedNodes = selectedNode ? findConnectedTreeNodes(selectedNode, links) : null;

    // Group objects by level
    const levelGroups = {};
    objects.forEach(obj => {
        if (!levelGroups[obj.level]) {
            levelGroups[obj.level] = [];
        }
        levelGroups[obj.level].push(obj);
    });

    const levels = Object.keys(levelGroups).sort((a, b) => a - b);

    if (viewMode === 'slo' && selectedComponent) {
        return (
            <div className="slo-view">
                <div className="breadcrumbs">
                    <button onClick={handleBackToHierarchy}>FMEA Hierarchy</button>
                    <ChevronRight size={16} />
                    <span>{selectedComponent.name} SLOs</span>
                </div>
                <SLOManagement component={selectedComponent} />
            </div>
        );
    }

    return (
        <div>
            <div className="graph-controls">
                <FMEASearch objects={objects} onSelect={handleNodeClick} />
                {selectedNode && (
                    <div className="graph-status-bar">
                        <span>
                            Showing connections for: <strong>{objects.find(obj => obj.id === selectedNode)?.name}</strong>
                        </span>
                        <button className="graph-reset-button" onClick={() => setSelectedNode(null)}>
                            Show All
                        </button>
                    </div>
                )}
            </div>
            <div className="graph">
                <div className="graph-levels-container">
                    {levels.map(level => {
                        const levelDef = levelDefinitions.find(def => def.level === parseInt(level));
                        return (
                            <div key={level} className="graph-level">
                                <div className="graph-level-background" />
                                <div className="graph-level-header">
                                    {levelDef?.name || `Level ${level}`}
                                </div>
                                <div className="graph-level-nodes">
                                    {levelGroups[level].map(obj => {
                                        const isConnected = !selectedNode || connectedNodes.has(obj.id);
                                        const isSelected = selectedNode === obj.id;
                                        return (
                                            <div
                                                key={obj.id}
                                                className={`graph-node ${isSelected ? 'selected' : ''} ${isConnected ? 'connected' : ''}`}
                                                id={`node-${obj.id}`}
                                            >
                                                <div className="node-content" onClick={() => handleNodeClick(obj.id)}>
                                                    {obj.name}
                                                </div>
                                                {level === '1' && (
                                                    <button 
                                                        className="slo-button"
                                                        onClick={() => handleSLOButtonClick(obj)}
                                                        title="Manage SLOs"
                                                    >
                                                        <Settings size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <svg className="graph-connections">
                    {connections.map(connection => (
                        <path
                            key={connection.id}
                            id={`path-${connection.id}`}
                            d={connection.path}
                            className="graph-connection-path"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
};

// Example usage with expanded sample data
const FMEAHierarchy = () => {
    const levelDefinitions = [
        {level: 1, name: "System Type"},
        {level: 2, name: "Components"},
        {level: 3, name: "Modules"},
        {level: 4, name: "Features"}
    ];

    const sampleObjects = [
        // Level 1: System Types
        {id: 1, name: "Web App", level: 1},
        {id: 2, name: "Mobile App", level: 1},
        {id: 3, name: "Desktop App", level: 1},
        {id: 103, name: "My App", level: 1},

        // Level 2: Components
        {id: 4, name: "Authentication", level: 2},
        {id: 5, name: "User Management", level: 2},
        {id: 6, name: "Data Storage", level: 2},
        {id: 7, name: "Analytics", level: 2},
        {id: 108, name: "My Component", level: 2},

        // Level 3: Modules
        {id: 8, name: "Login", level: 3},
        {id: 9, name: "Registration", level: 3},
        {id: 10, name: "Profile", level: 3},
        {id: 11, name: "Dashboard", level: 3},
        {id: 12, name: "Reports", level: 3},
        {id: 112, name: "My Reports", level: 3},

        // Level 4: Features
        {id: 13, name: "OAuth", level: 4},
        {id: 14, name: "2FA", level: 4},
        {id: 15, name: "Password Reset", level: 4},
        {id: 16, name: "User Roles", level: 4},
        {id: 17, name: "Activity Log", level: 4}
    ];

    const sampleLinks = [
        //My Connections
        { sourceId: 103, targetId: 108},
        { sourceId: 108, targetId: 112},
        // Web App connections
        {sourceId: 1, targetId: 4},
        {sourceId: 1, targetId: 5},
        {sourceId: 1, targetId: 6},

        // Mobile App connections
        {sourceId: 2, targetId: 4},
        {sourceId: 2, targetId: 7},

        // Desktop App connections
        {sourceId: 3, targetId: 4},
        {sourceId: 3, targetId: 6},

        // Authentication module connections
        {sourceId: 4, targetId: 8},
        {sourceId: 4, targetId: 9},

        // User Management connections
        {sourceId: 5, targetId: 10},
        {sourceId: 5, targetId: 11},

        // Analytics connections
        {sourceId: 7, targetId: 11},
        {sourceId: 7, targetId: 12},

        // Login feature connections
        {sourceId: 8, targetId: 13},
        {sourceId: 8, targetId: 14},
        {sourceId: 8, targetId: 15},

        // Profile connections
        {sourceId: 10, targetId: 16},
        {sourceId: 10, targetId: 17},

        // Dashboard connections
        {sourceId: 11, targetId: 16},
        {sourceId: 11, targetId: 17},
        // make User Roles be a target for all objects at Modules level
        {sourceId: 8, targetId: 16},
        {sourceId: 9, targetId: 16},
        {sourceId: 10, targetId: 16},
        {sourceId: 11, targetId: 16},
        {sourceId: 12, targetId: 16},
        {sourceId: 112, targetId: 16},
        {sourceId: 8, targetId: 15},
        {sourceId: 9, targetId: 15},
        {sourceId: 10, targetId: 15},
        {sourceId: 11, targetId: 15},
        {sourceId: 12, targetId: 15},
        {sourceId: 112, targetId: 15},
        {sourceId: 8, targetId: 13},
        {sourceId: 9, targetId: 13},
        {sourceId: 10, targetId: 13},
        {sourceId: 11, targetId: 13},
        {sourceId: 12, targetId: 13},
        {sourceId: 112, targetId: 13},
    ];

    return (
        <Graph
            objects={sampleObjects}
            links={sampleLinks}
            levelDefinitions={levelDefinitions}
        />
    );
};

export default FMEAHierarchy;
