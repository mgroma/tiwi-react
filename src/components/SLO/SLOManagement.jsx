import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, XCircle, PlusCircle } from 'react-feather';
import { ImplementationStatus, ComponentPropTypes } from '../../types/SLO';
import CreateSLOForm from './CreateSLOForm';
import './SLOManagement.css';

const SLOManagement = ({ component }) => {
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [isCreatingSLO, setIsCreatingSLO] = useState(false);

    const getStatusIcon = (status) => {
        switch (status) {
            case ImplementationStatus.IMPLEMENTED:
                return <CheckCircle className="status-icon implemented" />;
            case ImplementationStatus.REQUESTED:
                return <AlertCircle className="status-icon requested" />;
            case ImplementationStatus.NOT_STARTED:
                return <XCircle className="status-icon not-started" />;
            default:
                return null;
        }
    };

    const getSLOStatusIcon = (slo) => {
        if (slo.implementationStatus !== ImplementationStatus.IMPLEMENTED || !slo.sloValue) {
            return null;
        }

        if (slo.sloValue >= slo.targetThreshold) {
            return <CheckCircle className="slo-icon good" />;
        } else if (slo.sloValue >= slo.warningThreshold) {
            return <AlertCircle className="slo-icon warning" />;
        } else {
            return <XCircle className="slo-icon bad" />;
        }
    };

    const calculateDefaultThresholds = (operation) => {
        // This would be replaced with actual calculation logic
        return {
            targetThreshold: 99.9,
            warningThreshold: 99.5
        };
    };

    const handleCreateSLO = (newSLO) => {
        // Here you would typically make an API call to save the SLO
        console.log('Creating new SLO:', newSLO);
        setIsCreatingSLO(false);
    };

    return (
        <div className="slo-management">
            {isCreatingSLO && selectedOperation && (
                <div className="modal-overlay">
                    <CreateSLOForm
                        operation={selectedOperation}
                        onSave={handleCreateSLO}
                        onCancel={() => setIsCreatingSLO(false)}
                    />
                </div>
            )}
            <div className="operations-list">
                <h3>Operations</h3>
                {component.operations.map(operation => (
                    <div 
                        key={operation.id}
                        className={`operation-item ${selectedOperation?.id === operation.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOperation(operation)}
                    >
                        {operation.name}
                    </div>
                ))}
            </div>

            <div className="slo-details">
                {selectedOperation && (
                    <>
                        <div className="slo-header">
                            <h3>{selectedOperation.name} SLOs</h3>
                            <button 
                                className="create-slo-button"
                                onClick={() => setIsCreatingSLO(true)}
                            >
                                <PlusCircle size={16} />
                                Create SLO
                            </button>
                        </div>

                        <div className="slo-list">
                            {selectedOperation.slos.map(slo => (
                                <div key={slo.id} className="slo-item">
                                    <div className="slo-metric">
                                        <span className="metric-name">{slo.metric}</span>
                                        {getStatusIcon(slo.implementationStatus)}
                                    </div>
                                    
                                    {slo.implementationStatus === ImplementationStatus.IMPLEMENTED && (
                                        <div className="slo-values">
                                            <div className="slo-value">
                                                <span className="label">SLO Value:</span>
                                                <span className="value">{slo.sloValue}%</span>
                                                {getSLOStatusIcon(slo)}
                                            </div>
                                            <div className="error-budget">
                                                <span className="label">Error Budget:</span>
                                                <span className="value">{slo.errorBudget}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="slo-thresholds">
                                        <div className="threshold">
                                            <span className="label">Target:</span>
                                            <span className="value">{slo.targetThreshold}%</span>
                                        </div>
                                        <div className="threshold">
                                            <span className="label">Warning:</span>
                                            <span className="value">{slo.warningThreshold}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

SLOManagement.propTypes = {
    component: PropTypes.shape(ComponentPropTypes).isRequired
};

export default SLOManagement;
