# /review-git-diff

> Orchestrates the Git Diff Reviewer Agent to analyze uncommitted changes using high-reasoning LLMs.

## Trigger
```
/review-git-diff [branch|commit]
```
If no branch or commit is specified, it reviews the current working tree (`git diff` over uncommitted and staged changes).

## Workflow

1. **Collect Diff:** Run a `git diff` command that EXCLUDES generated files, build directories, and dependencies.
   - For example: `git diff HEAD -- . ':(exclude)**/node_modules/*' ':(exclude)**/dist/*' ':(exclude)**/target/*' ':(exclude)**/*.jar'`
   - **CRITICAL**: The Claude Code agent MUST NOT capture diffs for `node_modules/`, `dist/`, `target/` (Maven build), `.claude/`, `package-lock.json`, or any compiled files. It should manually append git pathspecs to exclude them if necessary.
2. **Load Git Diff Reviewer Agent:** Invokes `agents/git-diff-reviewer-agent.md`
3. **Analyze Reasoning:**
   - Evaluates the logic changes line-by-line using deep reasoning chains.
   - Evaluates how the new changes interact with the surrounding codebase context.
4. **Generate Report:** Actionable suggestions highlighting lines specifically added or modified in the diff.

## Examples

```
/review-git-diff                # Reviews all current uncommitted changes
/review-git-diff main           # Reviews changes between current branch and main
```

## Difference relative to /review-code
Where `/review-code` looks at entire files for general code quality, `/review-git-diff` is laser-focused on the delta (the diff). It will not complain about pre-existing issues in a file, and relies on models with enhanced reasoning (e.g. `o3-mini`) to trace the implications of the change.

## Output Format

Outputs a Markdown report detailing critical, high, and medium severity issues introduced strictly by the diff, with a final approval verdict.
