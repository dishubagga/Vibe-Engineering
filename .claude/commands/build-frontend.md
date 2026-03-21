# /build-frontend

> Orchestrates the Frontend Agent to build React components.

## Trigger
```
/build-frontend <task-description>
```

## Workflow

1. **Load Frontend Agent**: Invokes `agents/frontend-agent.md`
2. **Load Skills**: react-patterns.md, state-management.md
3. **Analyze Project**: Examine src/ structure, existing state setup
4. **Implement**:
   - Functional components with hooks
   - Clean folder structure
   - Tailwind/Material UI styling
   - API integration via custom hooks
5. **Verify**: Run npm run dev and test locally
6. **Review**: Trigger `/review-code` for quality check

## Examples

```
/build-frontend Create UserProfile component with form validation
/build-frontend Add Redux slice for shopping cart management
/build-frontend Build Modal component with animations
/build-frontend Create useApi custom hook for data fetching
```

## Constraints

- **React**: 18.2.0 (locked)
- **Components**: Functional components with hooks only
- **Props**: Destructure and type with PropTypes/TypeScript
- **State**: Follow project convention (Redux/Zustand/Context)
- **Styling**: Tailwind CSS or CSS-in-JS
- **API Calls**: Use service layer, handle loading/error
- **Testing**: Include test coverage when applicable

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Runtime | React | 18.2.0 |
| State | Redux/Zustand/Context | Per project |
| Build | Vite | 5.0.0+ |
| Testing | Vitest | 1.0.0+ |
| Styling | Tailwind/MUI | Latest |
