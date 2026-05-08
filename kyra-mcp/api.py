"""
HTTP API wrapper around Kyra's validation logic.
Runs separately from the MCP server (which stays stdio for Cline).
Next.js dashboard calls this to show compliance results in the browser.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import audit_context, run_compliance_scorecard, list_components, get_tokens, get_component_spec

app = FastAPI(title="Kyra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuditRequest(BaseModel):
    component_name: str
    intent: str


class ScorecardRequest(BaseModel):
    component_name: str
    code: str


@app.get("/components")
def get_components():
    return {"result": list_components()}


@app.get("/tokens")
def get_design_tokens():
    return {"result": get_tokens()}


@app.get("/components/{name}")
def get_spec(name: str):
    return {"result": get_component_spec(name)}


@app.post("/audit-context")
def audit(req: AuditRequest):
    return {"result": audit_context(req.component_name, req.intent)}


@app.post("/compliance-scorecard")
def scorecard(req: ScorecardRequest):
    raw = run_compliance_scorecard(req.component_name, req.code)
    lines = raw.split("\n")

    # Parse result line: "Result: PASS (4/4 checks)" or "Result: FAIL (2/4 checks)"
    result_line = lines[0] if lines else ""
    status = "PASS" if "PASS" in result_line else "FAIL"
    score_part = result_line.split("(")[-1].replace("checks)", "").replace(")", "").strip()
    passed, total = (int(x) for x in score_part.split("/")) if "/" in score_part else (0, 0)

    checks = [l for l in lines if l.startswith("✓") or l.startswith("✗")]
    fixes = [l.replace("→ ", "") for l in lines if l.startswith("→")]

    return {
        "status": status,
        "passed": passed,
        "total": total,
        "checks": checks,
        "fixes": fixes,
        "raw": raw,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
