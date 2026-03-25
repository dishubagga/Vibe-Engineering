# /plan-application

> Orchestrates the Architect Agent to map out a complete application, breaking it down into distinct features. 

## Trigger
```
/plan-application <application-description>
```

## Workflow

1. **Load Architect Agent**: Invokes `agents/architect-agent.md`
2. **Analyze Global Requirements**: Parse the application idea and its overall goal.
3. **Application Breakdown**:
   - Split the application into distinct **Features** or **Microservices**.
   - For each feature, create a high-level summary of:
     - The feature's goal
     - Expected Frontend components/flows
     - Expected Backend APIs/services
     - Shared Database architecture mapping
4. **Document Creation**: Save a master architecture document (e.g. `docs/architecture/application-plan.md`).
5. **Output**: A roadmap outlining the timeline of features to build, instructing the user to run `/plan-feature` for each step sequentially.

## Examples

```
/plan-application Build a full-stack Uber clone
/plan-application Create a multi-tenant SaaS for restaurants
/plan-application Build a social media platform with real-time chat
```

## Output Format

```
# Application Architecture Plan: [Name]

## Core Idea & Architecture
A brief summary of the tech stack and the overall flow.

## Feature Roadmap

### Feature 1: [Feature Name]
- **Frontend**: High-level components (e.g. Login Screen, Setup Flow)
- **Backend**: Microservices or modules (e.g. Auth Controller, Email Service)

### Feature 2: [Feature Name]
- **Frontend**: High-level components (e.g. Map View, Ride Booking UI)
- **Backend**: Microservices or modules (e.g. WebSockets, Driver Matching Engine)

...

## Database ERD (Conceptual)
Overview of the primary data models mapping the entire application.

## Next Steps
Run `/plan-feature [Feature 1 Name]` to start breaking down the first milestone into bite-sized actionable development tasks.
```

## Who Uses This

- **Architect Agent**: Primary user for high-level technical direction.
- **Product Owners**: Guiding tool for prioritizing which feature to develop first.
