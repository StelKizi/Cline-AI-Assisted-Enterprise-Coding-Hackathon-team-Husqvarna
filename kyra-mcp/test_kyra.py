from main import audit_context, run_compliance_scorecard, list_components

print("=== list_components ===")
print(list_components())

print("\n=== audit_context ===")
print(audit_context("Button", "primary submit button for signup form"))

print("\n=== FAIL case ===")
bad = '<button style="background:#FF5733">Submit</button>'
print(run_compliance_scorecard("Button", bad))

print("\n=== PASS case ===")
good = '<Button variant="primary" size="md">Submit</Button>'
print(run_compliance_scorecard("Button", good))
