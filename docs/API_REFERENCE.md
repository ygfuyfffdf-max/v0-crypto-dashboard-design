# API REFERENCE - GENESIS PHASE

## Security API

### `QuantumPermissionEngine`

#### `checkPermission(user: User, action: Action, resource: Resource): Promise<boolean>`
Evaluates whether a user can perform an action on a resource.
- **Returns**: `true` if allowed, `false` otherwise.
- **Side Effects**: Logs to Audit Trail.

#### `evaluateRisk(user: User, action: Action, resource: Resource): RiskScore`
Calculates the risk score (0.0 - 1.0) for an operation.

## AI API

### `MultiModelAIArchitecture`

#### `processQuery(query: AIQuery): Promise<AIResponse>`
Processes a natural language query using the optimal AI model.
- **Input**: `{ prompt: string, urgency: 'low'|'high' }`
- **Output**: `{ content: string, confidence: number }`

## Observability API

### `QuantumObservability`

#### `collectAtomicMetrics(): AtomicMetrics`
Returns a snapshot of current system performance metrics.
