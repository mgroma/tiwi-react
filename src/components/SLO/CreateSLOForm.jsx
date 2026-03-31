import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'react-feather';
import { ImplementationStatus, SLOPropTypes } from '../../types/SLO';
import './CreateSLOForm.css';

const CreateSLOForm = ({ operation, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        metric: '',
        entitySelector: '',
        targetThreshold: 99.9,
        warningThreshold: 99.5,
        implementationStatus: ImplementationStatus.NOT_STARTED
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            componentId: operation.componentId,
            operationId: operation.id
        });
    };

    return (
        <div className="create-slo-form">
            <div className="form-header">
                <h3>Create New SLO</h3>
                <button className="close-button" onClick={onCancel}>
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="metric">Metric</label>
                    <input
                        type="text"
                        id="metric"
                        value={formData.metric}
                        onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="entitySelector">Dynatrace Entity Selector</label>
                    <input
                        type="text"
                        id="entitySelector"
                        value={formData.entitySelector}
                        onChange={(e) => setFormData({ ...formData, entitySelector: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="targetThreshold">Target Threshold (%)</label>
                    <input
                        type="number"
                        id="targetThreshold"
                        value={formData.targetThreshold}
                        onChange={(e) => setFormData({ ...formData, targetThreshold: parseFloat(e.target.value) })}
                        min="0"
                        max="100"
                        step="0.1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="warningThreshold">Warning Threshold (%)</label>
                    <input
                        type="number"
                        id="warningThreshold"
                        value={formData.warningThreshold}
                        onChange={(e) => setFormData({ ...formData, warningThreshold: parseFloat(e.target.value) })}
                        min="0"
                        max="100"
                        step="0.1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="implementationStatus">Implementation Status</label>
                    <select
                        id="implementationStatus"
                        value={formData.implementationStatus}
                        onChange={(e) => setFormData({ ...formData, implementationStatus: e.target.value })}
                        required
                    >
                        <option value={ImplementationStatus.NOT_STARTED}>Not Started</option>
                        <option value={ImplementationStatus.REQUESTED}>Requested</option>
                        <option value={ImplementationStatus.IMPLEMENTED}>Implemented</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel}>Cancel</button>
                    <button type="submit">Create SLO</button>
                </div>
            </form>
        </div>
    );
};

CreateSLOForm.propTypes = {
    operation: PropTypes.shape({
        id: PropTypes.string.isRequired,
        componentId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default CreateSLOForm; 