import PropTypes from 'prop-types';

export const ImplementationStatus = {
    NOT_STARTED: 'Not Started',
    REQUESTED: 'Requested',
    IMPLEMENTED: 'Implemented'
};

export const SLOPropTypes = {
    id: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    operationId: PropTypes.string.isRequired,
    metric: PropTypes.string.isRequired,
    entitySelector: PropTypes.string.isRequired,
    targetThreshold: PropTypes.number.isRequired,
    warningThreshold: PropTypes.number.isRequired,
    implementationStatus: PropTypes.oneOf(Object.values(ImplementationStatus)).isRequired,
    sloValue: PropTypes.number,
    errorBudget: PropTypes.number,
    createdAt: PropTypes.instanceOf(Date).isRequired,
    updatedAt: PropTypes.instanceOf(Date).isRequired
};

export const OperationPropTypes = {
    id: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    slos: PropTypes.arrayOf(PropTypes.shape(SLOPropTypes)).isRequired
};

export const ComponentPropTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    operations: PropTypes.arrayOf(PropTypes.shape(OperationPropTypes)).isRequired
}; 