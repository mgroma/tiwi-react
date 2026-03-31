export type ImplementationStatus = 'Not Started' | 'Requested' | 'Implemented';

export interface SLO {
    id: string;
    componentId: string;
    operationId: string;
    metric: string;
    entitySelector: string;
    targetThreshold: number;
    warningThreshold: number;
    implementationStatus: ImplementationStatus;
    sloValue?: number;
    errorBudget?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Operation {
    id: string;
    componentId: string;
    name: string;
    description?: string;
    slos: SLO[];
}

export interface ComponentPropTypes {
    id?: number;
    name?: string;
    description?: string;
    operations?: Operation[];
}
